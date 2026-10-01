import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useNavigate, Link } from "react-router-dom";

import bannerBg from "../assets/images/innerBanner.jpg";
import Man from "../assets/images/man.png";

import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";

import {
  FaFacebook,
  FaWhatsappSquare,
  FaInstagramSquare,
} from "react-icons/fa";
const ContactUs = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Banner background style
  const bannerStyle = {
    backgroundImage: `url(${bannerBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0",
    padding: "40px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <MainLayout>
      <section className="InnerBannerScetion" style={bannerStyle}>
        <div className="maincontainer">
          <div className="contact-banner-content">
            <h5>Contact Us</h5>
            <p className="contact-banner-text">
              We're here to help! Get in touch with us for any questions,
              support <br />
              or business inquiries
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="maincontainer contact-container">
          {/*Left Card */}
          <div className="contact-main-card">
            <span className="contact-small-title">GET IN TOUCH</span>
            <h2>Let's Connect</h2>
            <p className="contact-description">
              Have a question, need support, or want to know about more
              products?
              <br /> Our team is always here to help you
            </p>
            {/* Phone */}
            <div className="contact-details">
              <div className="contact-item phone-item">
                <div className="contact-icon">
                  <FaPhone />
                </div>
                <div className="contact-details-info">
                  <h3>Call Us</h3>
                  <a
                    href="tel:+916287859750"
                    onClick={(e) => {
                      e.preventDefault();
                      const confirmedCall = window.confirm(
                        "Do you want to call +91 6287859750?",
                      );

                      if (confirmedSend) {
                        window.location.href = "tel:+916287859750";
                      }
                    }}
                  >
                    +91 6287859750
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="contact-item email-item">
                <div className="contact-icon">
                  <MdEmail />
                </div>
                <div className="contact-details-info">
                  <h3>Email Us</h3>
                  <a
                    href="mailto:support@mazingbusiness.com"
                    onClick={(e) => {
                      e.preventDefault();
                      const confirmedSend = window.confirm(
                        "Do you want to send an email to support@mazingbusiness.com?",
                      );

                      if (confirmedSend) {
                        window.location.href =
                          "mailto:support@mazingbusiness.com";
                      }
                    }}
                  >
                    support@mazingbusiness.com
                  </a>
                </div>
              </div>
              {/* address*/}
              <div className="contact-item address-item">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contact-details-info">
                  <h3>Our Address</h3>
                  <a href="https://www.google.com/maps/search/?api=1&query=Khasra+No+58%2F15%2C+Pal+Colony%2C+Rithala%2C+New+Delhi+110085">
                    Khasra No 58/15,Pal Colony,
                    <br />
                    Rithala, New Delhi - 110085
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="social-media-card">
            <span className="contact-small-title">Follow Us</span>
            <h3>Stay Connected</h3>
            <p>
              Follow us on social media for the latest updates,
              <br />
              offers and new arrivals
            </p>
            {/*Instagram*/}
            <a
              href="https://www.instagram.com/mazingbusiness?stkn=cHV2ZmxobnBlOTFo"
              target="blank"
              rel="noopener noreferrer"
              className="social-media-item"
            >
              <div className="social-media-left">
                <FaInstagramSquare className="instagram-icon" />
                <span>mazingbusiness</span>
              </div>
              <FaChevronRight className="social-media-arrow" />
            </a>

            {/* Facebook*/}
            <a
              href="https://www.facebook.com/profile.php?id=100093562140314"
              target="blank"
              rel="noopener noreferer"
              className="social-media-item"
            >
              <div className="social-media-left">
                <FaFacebook className="facebook-icon" />
                <span>Mazing Business</span>
              </div>
              <FaChevronRight className="social-media-arrow" />
            </a>

            {/*Whatsapp opel*/}
            <a
              href="https://whatsapp.com/channel/0029Va6cw8fGpLHK1Y42Py2N"
              target="blank"
              rel="noopener noreferrer"
              className="social-media-item"
            >
              <div className="social-media-left">
                <FaWhatsappSquare className="whatsapp-icon" />
                <span>Opel Power Tools</span>
                <small>Channel</small>
              </div>
              <FaChevronRight className="social-media-arrow" />
            </a>

            {/*Whatsapp Mazing*/}
            <a
              href="https://whatsapp.com/channel/0029Va6cw8fGpLHK1Y42Py2N"
              target="blank"
              rel="noopener noreferrer"
              className="social-media-item"
            >
              <div className="social-media-left">
                <FaWhatsappSquare className="whatsapp-icon" />
                <span>Mazing Business</span>
                <small>Channel</small>
              </div>
              <FaChevronRight className="social-media-arrow" />
            </a>
            {/* Whatsapp Announcements*/}

            <a
              href="https://chat.whatsapp.com/IaOesQdzjbN2NOXpsSUZvK"
              target="blank"
              rel="noopener noreferrer"
              className="social-media-item"
            >
              <div className="social-media-left">
                <FaWhatsappSquare className="whatsapp-icon" />
                <span>Mazing Announcements</span>
                <small className="community-badge">Community</small>
              </div>
              <FaChevronRight className="social-media-arrow" />
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactUs;
