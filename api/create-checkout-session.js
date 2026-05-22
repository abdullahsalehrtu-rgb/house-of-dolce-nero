import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { basket, deliveryFee } = req.body;

    const line_items = basket.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.name} (${item.size})`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (deliveryFee) {
      line_items.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url:
        "https://house-of-dolce-nero.vercel.app/?success=true",
      cancel_url:
        "https://house-of-dolce-nero.vercel.app/?canceled=true",
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}