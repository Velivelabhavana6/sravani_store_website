import React from "react";
import { Link } from "react-router-dom";
import logoSrc from "/images/logo.jpeg";
import InstagramIcon from "./icons/InstagramIcon";
import YouTubeIcon from "./icons/YouTubeIcon";
import { buildWhatsAppUrl } from "../services/whatsappService";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <img src={logoSrc} alt="Sravani Store logo" className="footer-logo-img" />
            <span className="brand-text">Sri renuka sogasulu</span>
          </div>
          <p className="footer-line">Mopidevi, krishna district, Andhra Pradesh, India</p>
          <p className="footer-line"><a href="mailto:srirenukasogasulu@gmail.com">srirenukasogasulu@gmail.com</a></p>
          <p className="footer-line"><a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">+91 9100758185</a></p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div>
          <h4>Follow Us</h4>
          <div className="footer-social-circles">
            <a className="circle insta" href="https://www.instagram.com/srirenukasogasulu?igsh=aGU1d3B3ZHNpZHd6" target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a className="circle yt" href="https://www.youtube.com/@SrirenukaSogasulu/shorts" target="_blank" rel="noreferrer" aria-label="YouTube">
              <YouTubeIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-catalog-banner">
        <span className="footer-catalog-label">Quick Access:</span>
        <a
          href="https://wa.me/c/919100758185"
          target="_blank"
          rel="noreferrer"
          className="footer-catalog-link"
        >
          Open WhatsApp Catalogue
        </a>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Srirenukasogasulu. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
