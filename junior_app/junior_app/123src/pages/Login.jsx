import React, { useState } from "react";
import LoginHeader from "../layouts/LoginHeader";
import bg from "../assets/images/BG.jpg";

import facebookIcon from "../assets/icons/fbIcon.svg";
import twitterIcon from "../assets/icons/xIcon.svg";
import linkedinIcon from "../assets/icons/playIcon.svg";

import indiaFlag from "../assets/icons/flag-icon/ind.svg";
import usaFlag from "../assets/icons/flag-icon/ind.svg";
import uaeFlag from "../assets/icons/flag-icon/ind.svg";
import { HiChevronDown } from "react-icons/hi";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const countries = [
    { name: "India", code: "+91", flag: indiaFlag },
    { name: "USA", code: "+1", flag: usaFlag },
    { name: "UAE", code: "+971", flag: uaeFlag },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectCountry = (country) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
  };

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/profileDashbord"); // Replace with your actual route
  };

  return (
    <>
      <LoginHeader />
      <div
        className="login-container"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="overlay">
          <div className="login-maincontainer">
            <div className="left-section">
              <h1>Mazing Business</h1>
              <p>
                Mazing Business is a one-stop B2B e-commerce platform for
                industrial tools, machinery, and equipment. It simplifies
                procurement with a wide product range and seamless transactions
                via its website, mobile app, and WhatsApp chatbot.
              </p>

              <small>
                <strong>Ace Tools Pvt. Ltd.</strong> Ltd. © 2025. All Rights
                Reserved. Designed by Arunaksha Sautya
              </small>

              <div className="social-icons">
                Stay Connected
                <img src={facebookIcon} alt="Facebook" />
                <img src={twitterIcon} alt="Twitter" />
                <img src={linkedinIcon} alt="LinkedIn" />
              </div>
            </div>
            <div className="right-section">
              <div className="login-form-box">
                <div className="login-box">
                  <h2>Create an Account</h2>

                  {/* Phone Input */}
                  <div className="input-row">
                    <div className="phone-input">
                      <div
                        className="countri-dropdown-wrapper"
                        onClick={toggleDropdown}
                      >
                        <img
                          src={selectedCountry.flag}
                          alt="flag"
                          className="flag"
                        />
                        <span className="dial-code">
                          {selectedCountry.code}
                        </span>
                        <HiChevronDown
                          className={`countri-arrow-icon ${
                            dropdownOpen ? "rotate" : ""
                          }`}
                        />
                        {dropdownOpen && (
                          <ul className="countri-dropdown-menu">
                            {countries.map((country, idx) => (
                              <li
                                key={idx}
                                onClick={() => selectCountry(country)}
                              >
                                <img src={country.flag} alt={country.name} />
                                <span>{country.code}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <input type="text" placeholder="Mobile number" />
                    </div>
                  </div>

                  <div className="otp-row">
                    <Link to="/" className="left-link">
                      Use Email Instead
                    </Link>

                    <Link to="/" className="right-link">
                      Send OTP
                    </Link>
                  </div>

                  {/* Password Input */}
                  <div className="input-row">
                    <input
                      type="password"
                      className="full-input"
                      placeholder="Password"
                    />
                  </div>

                  <div className="options-row">
                    <label>
                      <input type="checkbox" /> Remember Me
                    </label>

                    <Link to="/forgotpassword">Forgot Password?</Link>
                  </div>

                  <button className="login-btn" onClick={handleLoginClick}>
                    Login
                  </button>

                  <p className="register-text">
                    Don’t have an account?
                    <Link to="/register">Register Now</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
