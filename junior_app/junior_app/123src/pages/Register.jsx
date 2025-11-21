import { useState, useRef, useEffect } from "react";
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

import { FiChevronDown, FiCheck } from "react-icons/fi";

const Register = () => {
  const [noGstin, setNoGstin] = useState(false);

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

  const [selectedState, setSelectedState] = useState("");
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const stateRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setStateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statesOfIndia = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  return (
    <>
      <LoginHeader />
      <div
        className="login-container"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="overlay">
          <div className="login-maincontainer">
            <div className={`left-section ${noGstin ? "no-gstin" : ""}`}>
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
            <div className={`right-section ${noGstin ? "no-gstin" : ""}`}>
              <div className="login-form-box">
                <div className="login-box">
                  <h2 className="marginbottom10">Create an Account</h2>

                  {/* ===== Form 1: With GSTIN ===== */}
                  {!noGstin && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
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
                                      <img
                                        src={country.flag}
                                        alt={country.name}
                                      />
                                      <span>{country.code}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <input type="text" placeholder="Mobile number" />
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="email"
                            className="full-input"
                            placeholder="Email"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="GSTIN Number"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="options-row marginbottom0">
                          <label>
                            <input
                              type="checkbox"
                              checked={noGstin}
                              onChange={(e) => setNoGstin(e.target.checked)}
                            />{" "}
                            Don’t have a GSTIN?
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Form 2: Without GSTIN ===== */}
                  {noGstin && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
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
                                      <img
                                        src={country.flag}
                                        alt={country.name}
                                      />
                                      <span>{country.code}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <input type="text" placeholder="Mobile number" />
                          </div>
                        </div>
                        <div className="form-group">
                          <input
                            type="email"
                            className="full-input"
                            placeholder="Email"
                          />
                        </div>

                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="Full Name"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="Aadhar No."
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="Address"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="Address2"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="City"
                          />
                        </div>

                        <div className="form-group">
                          <div className="ba-dropdown-container" ref={stateRef}>
                            <div
                              className={`ba-dropdown-toggle ${
                                !selectedState ? "placeholder" : ""
                              }`}
                              onClick={() =>
                                setStateDropdownOpen((prev) => !prev)
                              }
                            >
                              {selectedState || "Select State"}
                              <FiChevronDown
                                className={`ba-arrow-icon ${
                                  stateDropdownOpen ? "ba-rotate" : ""
                                }`}
                              />
                            </div>

                            <div
                              className={`ba-dropdown-menu ${
                                stateDropdownOpen ? "open" : ""
                              }`}
                            >
                              <ul className="ba-dropdown-options">
                                {statesOfIndia.map((state, index) => (
                                  <li
                                    key={index}
                                    className={`ba-dropdown-item ${
                                      selectedState === state ? "selected" : ""
                                    }`}
                                    onClick={() => {
                                      setSelectedState(state);
                                      setStateDropdownOpen(false);
                                    }}
                                  >
                                    {state}
                                    {selectedState === state && (
                                      <span className="ba-check-icon">
                                        <FiCheck />
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            placeholder="Pincode"
                          />
                        </div>
                        <div className="form-group"></div>
                        <div className="form-group"></div>
                      </div>

                      <div className="form-row">
                        <div className="options-row marginbottom0">
                          <label>
                            <input
                              type="checkbox"
                              checked={noGstin}
                              onChange={(e) => setNoGstin(e.target.checked)}
                            />{" "}
                            Don’t have a GSTIN?
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Terms & Submit */}
                  <div className="form-row">
                    <div className="options-row ">
                      <label>
                        <input type="checkbox" />
                        By signing up you agree to our terms and conditions.
                      </label>
                    </div>
                  </div>

                  <button className="login-btn">Create Account</button>

                  <p className="register-text">
                    Already have an account? <Link to="/">Log In</Link>
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

export default Register;
