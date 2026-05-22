import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

const FORMSPREE_URL = "https://formspree.io/f/mykvjznd";

const instagramLink =
  "https://www.instagram.com/houseofdolcenero/?utm_source=ig_web_button_share_sheet";

const products = [
  {
    id: 1,
    name: "Dark Desire",
    category: "classic",
    note:
      "An intensely rich chocolate creation layered with velvety dark cocoa, smooth ganache and deep roasted chocolate notes.",
    options: [
      { size: "Small", price: 16 },
      { size: "Large", price: 32 },
    ],
  },
  {
    id: 2,
    name: "Tramissyou",
    category: "classic",
    note:
      "A refined tiramisu-inspired dessert crafted with espresso-soaked layers, delicate cream and premium cocoa dusting.",
    options: [
      { size: "Small", price: 18 },
      { size: "Large", price: 36 },
    ],
  },
  {
    id: 3,
    name: "Mama’s Cake",
    category: "classic",
    note:
      "Inspired by homemade comfort and elevated into luxury with soft layers, rich flavour and premium presentation.",
    options: [
      { size: "Small", price: 15 },
      { size: "Large", price: 30 },
    ],
  },
  {
    id: 4,
    name: "Cake of the Day",
    category: "classic",
    note:
      "A limited daily creation made fresh with seasonal premium ingredients and a luxury finish.",
    options: [{ size: "Large", price: 18 }],
  },
  {
    id: 5,
    name: "Dark Desire • Performance Edition",
    category: "protein",
    note:
      "A high-protein luxury chocolate dessert with deep cocoa richness, smooth texture and indulgent flavour.",
    options: [{ size: "Small", price: 20 }],
  },
  {
    id: 6,
    name: "Tramissyou • Performance Edition",
    category: "protein",
    note:
      "Espresso-soaked layers and smooth cream enhanced with elevated protein content.",
    options: [{ size: "Small", price: 22 }],
  },
  {
    id: 7,
    name: "Mama’s Cake • Performance Edition",
    category: "protein",
    note:
      "A nostalgic comfort dessert recreated with higher protein content while keeping a luxury finish.",
    options: [{ size: "Small", price: 21 }],
  },
  {
    id: 8,
    name: "Dark Desire • Lighter Edition",
    category: "lowcal",
    note:
      "A lighter version of Dark Desire crafted to reduce calories while preserving rich chocolate depth.",
    options: [{ size: "Small", price: 18 }],
  },
  {
    id: 9,
    name: "Tramissyou • Lighter Edition",
    category: "lowcal",
    note:
      "A lighter tiramisu-inspired dessert with elegant espresso flavour and smooth creaminess.",
    options: [{ size: "Small", price: 20 }],
  },
  {
    id: 10,
    name: "Mama’s Cake • Lighter Edition",
    category: "lowcal",
    note:
      "A softer lighter version of our signature nostalgic dessert with a balanced luxury feel.",
    options: [{ size: "Small", price: 17 }],
  },
];

const estimateDelivery = (address) => {
  const text = address.toLowerCase();

  if (!text.trim()) return 0;

  if (
    text.includes("hatfield") ||
    text.includes("al10") ||
    text.includes("parkhouse")
  ) {
    return 2.99;
  }

  return null;
};

export default function App() {
  const [basket, setBasket] = useState([]);
  const [page, setPage] = useState("home");
  const [menuFilter, setMenuFilter] = useState("classic");
  const [addedItemId, setAddedItemId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const goHome = () => {
    setPage("home");
    setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const filteredProducts = products.filter(
    (product) => product.category === menuFilter
  );

  const addToBasket = (product, option) => {
    const basketId = `${product.id}-${option.size}`;
    const existing = basket.find((item) => item.basketId === basketId);

    if (existing) {
      setBasket(
        basket.map((item) =>
          item.basketId === basketId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setBasket([
        ...basket,
        {
          basketId,
          name: product.name,
          size: option.size,
          price: option.price,
          note: product.note,
          quantity: 1,
        },
      ]);
    }

    setAddedItemId(basketId);
    setTimeout(() => setAddedItemId(null), 900);
  };

  const increaseQuantity = (basketId) => {
    setBasket(
      basket.map((item) =>
        item.basketId === basketId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (basketId) => {
    setBasket(
      basket
        .map((item) =>
          item.basketId === basketId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (basketId) => {
    setBasket(basket.filter((item) => item.basketId !== basketId));
  };

  const total = basket.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryFee = estimateDelivery(customerInfo.address);
  const deliveryAvailable = deliveryFee !== null;
  const finalTotal =
    basket.length > 0 && deliveryAvailable ? total + deliveryFee : total;

  const detailsComplete =
    customerInfo.name.trim() &&
    customerInfo.email.trim() &&
    customerInfo.phone.trim() &&
    customerInfo.address.trim() &&
    deliveryAvailable;

  const submitOrder = async () => {
    if (!detailsComplete || basket.length === 0) return;

    setIsSubmitting(true);
    setOrderMessage("");

    const orderItems = basket
      .map(
        (item) =>
          `${item.name} (${item.size}) x${item.quantity} = £${
            item.price * item.quantity
          }`
      )
      .join("\n");

    try {
      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: "New Dolcé Nero Order",
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          notes: customerInfo.notes,
          order: orderItems,
          subtotal: `£${total.toFixed(2)}`,
          delivery: `£${deliveryFee.toFixed(2)}`,
          total: `£${finalTotal.toFixed(2)}`,
        }),
      });

      const stripeResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basket,
          deliveryFee,
          customerInfo,
        }),
      });

      const stripeData = await stripeResponse.json();

      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        console.log(stripeData);
        setOrderMessage(stripeData.error || "Stripe checkout failed.");
      }
    } catch (error) {
      console.error(error);
      setOrderMessage("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (page === "basket") {
    return (
      <div className="page">
        <nav className="navbar">
          <button onClick={goHome} className="logo-button">
            <img src={logo} alt="Dolcé Nero" className="logo" />
          </button>

          <div className="nav-links">
            <button onClick={goHome} className="nav-button">
              Menu
            </button>

            <button className="basket-nav">
              Basket ({basketCount}) • £{total}
            </button>
          </div>
        </nav>

        <section className="luxury-basket-page">
          <button onClick={goHome} className="back-button">
            ← Back to Menu
          </button>

          <p className="section-tag">Dolcé Nero Checkout</p>
          <h1>Your Basket</h1>

          {basket.length === 0 ? (
            <div className="empty-luxury-box">
              <h2>Your basket is empty</h2>
              <p>Add desserts from the menu to begin your order.</p>

              <button onClick={goHome} className="btn gold">
                Return to Menu
              </button>

              {orderMessage && <p className="order-message">{orderMessage}</p>}
            </div>
          ) : (
            <div className="checkout-layout">
              <div className="checkout-items">
                {basket.map((item) => (
                  <div className="checkout-card" key={item.basketId}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.size} • £{item.price}
                      </p>
                      <p className="basket-note">{item.note}</p>
                    </div>

                    <div className="quantity-controls">
                      <button onClick={() => decreaseQuantity(item.basketId)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.basketId)}>
                        +
                      </button>
                    </div>

                    <div className="item-price">
                      £{item.price * item.quantity}
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.basketId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <p className="section-tag">Hatfield Delivery Only</p>
                <h2>Order Total</h2>

                <div className="customer-form">
                  <h3>Delivery Details</h3>

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Delivery Address in Hatfield"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: e.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Order notes / allergies / delivery instructions"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, notes: e.target.value })
                    }
                  />

                  {customerInfo.address && !deliveryAvailable && (
                    <p className="delivery-warning">
                      We are only delivering in Hatfield right now.
                    </p>
                  )}
                </div>

                <div className="summary-row">
                  <span>Items</span>
                  <span>{basketCount}</span>
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>£{total.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Delivery</span>
                  <span>
                    {deliveryAvailable
                      ? `£${deliveryFee.toFixed(2)}`
                      : "Not available"}
                  </span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <strong>£{finalTotal.toFixed(2)}</strong>
                </div>

                <button
                  className={
                    detailsComplete ? "checkout-btn" : "checkout-btn disabled"
                  }
                  disabled={!detailsComplete || isSubmitting}
                  onClick={submitOrder}
                >
                  {isSubmitting
                    ? "Opening Secure Checkout..."
                    : detailsComplete
                    ? "Secure Checkout"
                    : "Enter Hatfield Delivery Details"}
                </button>

                {orderMessage && <p className="order-message">{orderMessage}</p>}

                <button onClick={goHome} className="continue-btn">
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="navbar">
        <button onClick={goHome} className="logo-button">
          <img src={logo} alt="Dolcé Nero" className="logo" />
        </button>

        <div className="nav-links">
          <a href="#menu">Menu</a>

          <button onClick={() => setPage("basket")} className="basket-nav">
            Basket ({basketCount}) • £{total}
          </button>

          <a href="#about">About</a>
          <a href="#socials">Socials</a>
        </div>
      </nav>

      <section className="hero">
        <p className="tagline">Luxury Handmade Desserts</p>

        <h1>Rich. Refined. Unforgettable.</h1>

        <p>
          Premium handcrafted desserts inspired by elegant European dessert
          culture, created fresh with luxurious flavour, refined presentation and
          top-quality ingredients.
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="btn gold">
            View Menu
          </a>

          <button onClick={() => setPage("basket")} className="btn outline">
            View Basket
          </button>
        </div>
      </section>

      <section id="menu" className="menu">
        <p className="section-tag">Our Collection</p>
        <h2>Signature Desserts</h2>

        <div className="menu-tabs">
          <button
            onClick={() => setMenuFilter("classic")}
            className={menuFilter === "classic" ? "tab active-tab" : "tab"}
          >
            Classic
          </button>

          <button
            onClick={() => setMenuFilter("lowcal")}
            className={menuFilter === "lowcal" ? "tab active-tab" : "tab"}
          >
            Low Calorie
          </button>

          <button
            onClick={() => setMenuFilter("protein")}
            className={menuFilter === "protein" ? "tab active-tab" : "tab"}
          >
            High Protein
          </button>
        </div>

        <p className="menu-note">
          Every dessert is crafted using premium ingredients. Currently
          delivering in Hatfield only.
        </p>

        <div className="cards">
          {filteredProducts.map((product) => (
            <div className="card" key={product.id}>
              <h3>{product.name}</h3>

              <p className="product-note">{product.note}</p>

              <div className="size-options">
                {product.options.map((option) => {
                  const basketId = `${product.id}-${option.size}`;

                  return (
                    <button
                      key={option.size}
                      className={
                        addedItemId === basketId
                          ? "size-option added-animation"
                          : "size-option"
                      }
                      onClick={() => addToBasket(product, option)}
                    >
                      <div>
                        <span className="option-size">{option.size}</span>
                        <small>Add {option.size} to Basket</small>
                      </div>

                      <strong>£{option.price}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about">
        <p className="section-tag">The Brand</p>
        <h2>About Dolcé Nero</h2>

        <p>
          Dolcé Nero was created to bring a more luxurious and elegant dessert
          experience to every order. Every dessert is handcrafted with attention
          to flavour, presentation and detail.
        </p>
      </section>

      <section id="socials" className="contact">
        <p className="section-tag">Socials</p>
        <h2>Follow House Of Dolcé Nero</h2>

        <p>
          Follow us on Instagram for luxury desserts, daily specials and premium
          dessert content.
        </p>

        <a
          href={instagramLink}
          className="btn gold"
          target="_blank"
          rel="noreferrer"
        >
          Follow On Instagram
        </a>
      </section>
    </div>
  );
}