import React from "react";
import logoImg from "../assets/logo-transparent.png";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
} from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer__main footer__main--grid">
      <div className="footer__col footer__brand">
        <div className="footer__logo">
          <Link
            to="/"
            aria-label="Go to homepage"
            className="footer__logo-link"
          >
            <img
              src={logoImg}
              alt="ReadJunction Logo"
              className="footer__logo-img navbar__logo-img--transparent"
            />
            <span className="footer__logo-text">ReadJunction</span>
          </Link>
        </div>
        <div className="footer__desc">
          Your trusted marketplace for pre-loved study material. Shop, save, and
          support sustainable learning.
        </div>
        <div className="footer__socials">
          <a href="#" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="#" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#" aria-label="LinkedIn">
            <FaLinkedinIn />
          </a>
        </div>
      </div>
      <div className="footer__col">
        <div className="footer__links-title">Company</div>
        <ul className="footer__list">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Shop</a>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </div>
      <div className="footer__col">
        <div className="footer__links-title">Support</div>
        <ul className="footer__list">
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
          <li>
            <Link to="/returns">Returns</Link>
          </li>
          <li>
            <Link to="/shipping">Shipping</Link>
          </li>
          <li>
            <Link to="/terms">Terms</Link>
          </li>
          <li>
            <Link to="/privacy">Privacy</Link>
          </li>
        </ul>
      </div>
      <div className="footer__col footer__contact-col">
        <div className="footer__links-title">Contact</div>
        <div className="footer__contact-item">
          NCT-5, Chandigarh University,
          <br />
          Punjab, India
        </div>
        <div className="footer__contact-item">
          Email: support@readjunction.com
        </div>
        <div className="footer__contact-item">Phone: +91 98765 43210</div>
        <div className="footer__payments-title">We accept</div>
        <div className="footer__payments-icons">
          <FaCcVisa />
          <FaCcMastercard />
          <FaCcPaypal />
          <FaCcAmex />
        </div>
      </div>
    </div>
    <div className="footer__bottom">
      &copy; {new Date().getFullYear()} ReadJunction. All rights reserved.
    </div>
  </footer>
);

export default Footer;
