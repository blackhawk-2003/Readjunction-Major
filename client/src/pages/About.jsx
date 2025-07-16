import React from "react";
import "../styles/SupportPages.css";

const About = () => (
  <section className="support-page about-page">
    <h1 className="support-page__title">About ReadJunction</h1>
    <div className="support-page__section">
      <h2>Our Mission</h2>
      <p>
        ReadJunction is dedicated to making quality study material accessible
        and affordable for everyone. We believe in sustainable learning and the
        power of sharing knowledge.
      </p>
    </div>
    <div className="support-page__section">
      <h2>What Makes Us Unique</h2>
      <p>
        We connect students and book lovers to a trusted marketplace for
        pre-loved and new study material. Our platform is designed for easy
        discovery, secure transactions, and a seamless shopping experience.
      </p>
    </div>
    <div className="support-page__section">
      <h2>Our Vision</h2>
      <p>
        To build a community where learning resources are never wasted and every
        learner finds what they need to succeed.
      </p>
    </div>
  </section>
);

export default About;
