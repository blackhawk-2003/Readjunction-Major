import React from "react";
import "../styles/SupportPages.css";

const Returns = () => (
  <section className="support-page returns-page">
    <h1 className="support-page__title">Returns & Refunds</h1>
    <div className="support-page__section">
      <h2>Return Policy</h2>
      <p>
        You may return most items within 7 days of delivery for a full refund.
        Items must be in original condition. To start a return, contact our
        support team with your order details.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Refunds</h2>
      <p>
        Refunds are processed within 3-5 business days after we receive your
        return. Refunds will be issued to your original payment method.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Exceptions</h2>
      <p>
        Some items, such as final sale or digital products, may not be eligible
        for return. Please check the product page for details.
      </p>
    </div>
  </section>
);

export default Returns;
