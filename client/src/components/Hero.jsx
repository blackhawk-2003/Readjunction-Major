import React from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero-section.png";
import "../styles/Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__headline">
          Shop Old <span className="hero__highlight">Study</span> Material.
        </h1>
        <p className="hero__subheading">
          Shopping study material is now easy, just sit back and we’ll deliver
          at your door step.
        </p>
        <Link to="/products" className="hero__cta">
          Shop now
        </Link>
      </div>
      <div className="hero__image-container">
        <img src={heroImg} alt="Stack of books" className="hero__image-blend" />
      </div>
    </section>
  );
};

export default Hero;
