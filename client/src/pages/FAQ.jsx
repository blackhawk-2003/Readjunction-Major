import React, { useState } from "react";
import "../styles/SupportPages.css";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse products, add to cart, and proceed to checkout. You’ll receive a confirmation email after purchase.",
  },
  {
    q: "Can I return a book?",
    a: "Yes, returns are accepted within 7 days of delivery. See our Returns page for details.",
  },
  {
    q: "How long does shipping take?",
    a: "Shipping usually takes 3-7 business days depending on your location.",
  },
  {
    q: "Are the books new or used?",
    a: "We offer both new and pre-loved books. Condition is clearly mentioned on each product page.",
  },
  {
    q: "How do I contact support?",
    a: "Use the Contact page to reach us via email or phone. We’re here to help!",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section className="support-page faq-page">
      <h1 className="support-page__title">Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((item, idx) => (
          <div className={`faq-item${open === idx ? " open" : ""}`} key={idx}>
            <button
              className="faq-q"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              {item.q}
              <span className="faq-toggle">{open === idx ? "−" : "+"}</span>
            </button>
            <div
              className="faq-a"
              style={{ maxHeight: open === idx ? 200 : 0 }}
            >
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
