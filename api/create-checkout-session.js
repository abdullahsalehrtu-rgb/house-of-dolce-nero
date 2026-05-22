import Stripe from "stripe";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { basket, deliveryFee } = req.body;

    const line_items = basket.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.name} (${item.size})`,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: "https://house-of-dolce-nero.vercel.app/?success=true",
      cancel_url: "https://house-of-dolce-nero.vercel.app/?cancelled=true",
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      type: error.type,
      code: error.code,
    });
  }
}