import React, { useState } from "react";
import "../styles/NewsletterSignup.css";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter__content">
        <h2 className="newsletter__headline">Stay in the Loop!</h2>
        <p className="newsletter__subheading">
          Subscribe to our newsletter for exclusive deals, updates, and more.
        </p>
        <form className="newsletter__form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="newsletter__input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="newsletter__btn" type="submit">
            Subscribe
          </button>
        </form>
        {submitted && (
          <div className="newsletter__success">Thank you for subscribing!</div>
        )}
      </div>
    </section>
  );
};

export default NewsletterSignup;
