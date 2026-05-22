import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { basket, deliveryFee, customerInfo } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Missing STRIPE_SECRET_KEY in Vercel environment variables.",
      });
    }

    if (!basket || !Array.isArray(basket) || basket.length === 0) {
      return res.status(400).json({
        error: "Basket is empty or missing.",
      });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({
        error: "Customer email is missing.",
      });
    }

    const line_items = basket.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.name} - ${item.size}`,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    if (deliveryFee && Number(deliveryFee) > 0) {
      line_items.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: "Hatfield Delivery",
          },
          unit_amount: Math.round(Number(deliveryFee) * 100),
        },
        quantity: 1,
      });
    }

    const origin =
      req.headers.origin || "https://house-of-dolce-nero.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerInfo.email,
      line_items,
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: {
        name: customerInfo.name || "",
        phone: customerInfo.phone || "",
        address: customerInfo.address || "",
        notes: customerInfo.notes || "None",
      },
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.log("Stripe checkout error:", error);

    return res.status(500).json({
      error: error.message || "Stripe checkout failed.",
    });
  }
}