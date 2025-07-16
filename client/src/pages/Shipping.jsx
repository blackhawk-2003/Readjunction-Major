import React from "react";
import "../styles/SupportPages.css";

const Shipping = () => (
  <section className="support-page shipping-page">
    <h1 className="support-page__title">Shipping Information</h1>
    <div className="support-page__section">
      <h2>Delivery Times</h2>
      <p>
        Orders are processed within 1-2 business days. Delivery typically takes
        3-7 business days depending on your location.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Shipping Charges</h2>
      <p>
        Shipping is free for orders above ₹499. For orders below this amount, a
        flat shipping fee of ₹49 applies.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Order Tracking</h2>
      <p>
        Once your order ships, you’ll receive a tracking link via email. You can
        also track your order in your account dashboard.
      </p>
    </div>
  </section>
);

export default Shipping;
