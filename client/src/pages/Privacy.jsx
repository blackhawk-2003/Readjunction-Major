import React from "react";
import "../styles/SupportPages.css";

const Privacy = () => (
  <section className="support-page privacy-page">
    <h1 className="support-page__title">Privacy Policy</h1>
    <div className="support-page__section">
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide when you create an account, place an
        order, or contact support. This includes your name, email, address, and
        payment details.
      </p>
    </div>
    <div className="support-page__section">
      <h2>How We Use Your Data</h2>
      <p>
        Your data is used to process orders, provide support, and improve our
        services. We do not sell your personal information to third parties.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Cookies</h2>
      <p>
        We use cookies to enhance your experience and analyze site usage. You
        can manage cookie preferences in your browser settings.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Contact Us</h2>
      <p>For privacy questions, email us at support@readjunction.com.</p>
    </div>
  </section>
);

export default Privacy;
