import React, { useState } from "react";
import "../styles/SupportPages.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSuccess(false), 3000);
  };
  return (
    <section className="support-page contact-page">
      <h1 className="support-page__title">Contact Us</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>
        <div className="contact-form__group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>
        <div className="contact-form__group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
          />
        </div>
        <button className="contact-form__btn" type="submit">
          Send Message
        </button>
        {success && (
          <div className="contact-form__success">
            Thank you! We'll get back to you soon.
          </div>
        )}
      </form>
    </section>
  );
};

export default Contact;
