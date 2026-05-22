import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { total } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Dolcé Nero Order",
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],

      success_url: "https://YOURWEBSITE.com",
      cancel_url: "https://YOURWEBSITE.com",
    });

    res.status(200).json({
      url: session.url,
    });
  } catch (err) {
    res.status(500).json({
      error: "Stripe failed",
    });
  }
}