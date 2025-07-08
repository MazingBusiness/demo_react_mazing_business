import React from "react";

import fastDeliveryIcon from "../assets/icons/FtIcon1.svg";
import qualityAssuranceIcon from "../assets/icons/FtIcon2.svg";
import expertSupportIcon from "../assets/icons/FtIcon3.svg";
import easyReturnsIcon from "../assets/icons/FtIcon4.svg";
import securePaymentsIcon from "../assets/icons/FtIcon5.svg";
import visaIcon from "../assets/icons/Card.svg";
import facebookIcon from "../assets/icons/fbIcon.svg";
import twitterIcon from "../assets/icons/xIcon.svg";
import linkedinIcon from "../assets/icons/playIcon.svg";

import { useNavigate, Link } from "react-router-dom";

import Logo from "../assets/images/Logo.svg";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-top">
        <div className="maincontainer">
          <div className="footerTopInner">
            <div className="feature-box">
              <img src={fastDeliveryIcon} alt="Fast Delivery" />
              <div className="feature-box-info">
                <h4>Fast Delivery</h4>
                <p>Fast Delivery Everywhere</p>
              </div>
            </div>
            <div className="feature-box">
              <img src={qualityAssuranceIcon} alt="Quality Assurance" />
              <div className="feature-box-info">
                <h4>Quality Assurance</h4>
                <p>Certified Quality Tools</p>
              </div>
            </div>
            <div className="feature-box">
              <img src={expertSupportIcon} alt="Expert Support" />
              <div className="feature-box-info">
                <h4>Expert Support</h4>
                <p>24/7 Customer Support</p>
              </div>
            </div>
            <div className="feature-box">
              <img src={easyReturnsIcon} alt="Easy Returns" />
              <div className="feature-box-info">
                <h4>Easy Returns</h4>
                <p>Hassle-Free Returns</p>
              </div>
            </div>
            <div className="feature-box">
              <img src={securePaymentsIcon} alt="Secure Payments" />
              <div className="feature-box-info">
                <h4>Secure Payments</h4>
                <p>Safe & Secure Transaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="maincontainer">
          <div className="footer-main-inner">
            <div className="footer-col company">
              <img src={Logo} alt="Logo" />
              <h3 className="tagline">
                One Stop Shop for All Your Industrial Needs.
              </h3>
              <p>
                <strong>Mazing Business</strong> is an innovative e-commerce
                platform that connects B2B customers with suppliers in the
                industrial tools, machinery, and equipment sector.
              </p>
              <label>Address</label>
              <p>
                Plot No 220/219 & 220 Kh No 58/2,
                <br />
                Rithala Road, Rithala, New Delhi - 110085
              </p>
              <label>Phone</label>
              <p>+91-6287859750</p>

              <label>Email</label>
              <p>support@mazingbusiness.com</p>
            </div>

            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul>
                <li>
                  <Link to="/">About Us </Link>
                </li>
                <li>
                  <Link to="/">Copyright Policy </Link>
                </li>
                <li>
                  <Link to="/">Contact Us </Link>
                </li>
                <li>
                  <Link to="/">Terms & Conditions </Link>
                </li>
                <li>
                  <Link to="/">Return Policy </Link>
                </li>
                <li>
                  <Link to="/">Shipping Policy </Link>
                </li>
                <li>
                  <Link to="/">Privacy Policy </Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3>My Account</h3>
              <ul>
                <li>
                  <Link to="/">Login</Link>
                </li>
                <li>
                  <Link to="/">Order History</Link>
                </li>
                <li>
                  <Link to="/">My Wishlist</Link>
                </li>
                <li>
                  <Link to="/">Track Order</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col newsletter">
              <h3>Format Business</h3>
              <p>Register now to get update on promotions and coupons.</p>
              <div className="subscribe-box">
                <input type="email" placeholder="Your Email" />
                <button>Subscribe</button>
              </div>
              <div className="payment-icons">
                <img src={visaIcon} alt="Visa" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="maincontainer">
        <div className="footer-bottom">
          <p>
            <strong>Ace Tools Pvt. Ltd.</strong> © {new Date().getFullYear()}. All Rights Reserved.
          </p>
          <div className="social-icons">
            <img src={facebookIcon} alt="Facebook" />
            <img src={twitterIcon} alt="Twitter" />
            <img src={linkedinIcon} alt="LinkedIn" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
