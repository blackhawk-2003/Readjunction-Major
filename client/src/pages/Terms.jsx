import React from "react";
import "../styles/SupportPages.css";

const Terms = () => (
  <section className="support-page terms-page">
    <h1 className="support-page__title">Terms & Conditions</h1>
    <div className="support-page__section">
      <h2>Use of Service</h2>
      <p>
        By using ReadJunction, you agree to our terms. You must be at least 18
        years old or have parental consent to use our platform.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Account Responsibility</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and password and for restricting access to your device.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Prohibited Activities</h2>
      <p>
        You may not use our site for unlawful purposes, including fraud,
        copyright infringement, or harassment.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Changes to Terms</h2>
      <p>
        We may update these terms at any time. Continued use of the site means
        you accept the new terms.
      </p>
    </div>
  </section>
);

export default Terms;
