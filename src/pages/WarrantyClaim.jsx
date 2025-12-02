import React, { useState, useRef } from "react";
import LoginHeader from "../layouts/LoginHeader";
import bg from "../assets/images/BG.jpg";

import indiaFlag from "../assets/icons/flag-icon/ind.svg";
import usaFlag from "../assets/icons/flag-icon/ind.svg";
import uaeFlag from "../assets/icons/flag-icon/ind.svg";
import { HiChevronDown } from "react-icons/hi";
import { useNavigate, Link } from "react-router-dom";

import warranty from "../assets/icons/warranty.svg";
import Footer from "../layouts/Footer";

const WarrantyClaim = () => {
  const countries = [
    { name: "India", code: "+91", flag: indiaFlag },
    { name: "USA", code: "+1", flag: usaFlag },
    { name: "UAE", code: "+971", flag: uaeFlag },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpField, setShowOtpField] = useState(false);

  const otpRefs = useRef([]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectCountry = (country) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
  };

  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (mobileNumber.length === 10) {
      setShowOtpField(true);
      // Focus on first OTP input when OTP field is shown
      setTimeout(() => {
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus();
        }
      }, 100);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);

    const newOtp = [...otp];
    pastedNumbers.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Focus on the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((val) => val === "");
    if (nextEmptyIndex !== -1) {
      otpRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpRefs.current[5]?.focus();
    }
  };

  const handleContinue = () => {
    if (showOtpField) {
      const enteredOtp = otp.join("");
      if (enteredOtp.length === 6) {
        navigate("/WarrentyClaimHistory");
      } else {
        alert("Please enter a valid 6-digit OTP");
      }
    } else {
      alert("Please send OTP first");
    }
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
              <h1>Warranty Claim</h1>
              <p>
                Mazing Business is a one-stop B2B e-commerce platform for
                industrial tools, machinery, and equipment. It simplifies
                procurement with a wide product range and seamless transactions
                via its website, mobile app, and WhatsApp chatbot.
              </p>
            </div>
            <div className="right-section">
              <div className="login-form-box warratyBox">
                <div className="login-box">
                  <img src={warranty} alt="MenuIcon" />
                  <h2>Warranty Claim Form.</h2>

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
                      <input
                        type="text"
                        placeholder="Mobile number"
                        value={mobileNumber}
                        onChange={(e) =>
                          setMobileNumber(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="otp-row " style={{ justifyContent: "end" }}>
                    <button
                      class="send-otp-btn"
                      onClick={handleSendOtp}
                      disabled={mobileNumber.length !== 10}
                      data-discover="true"
                    >
                      Send OTP
                    </button>
                  </div>

                  {/* OTP Input - 6 individual boxes */}
                  {showOtpField && (
                    <div className="otp-container">
                      <label>Enter 6-digit OTP</label>
                      <div className="otp-inputs">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpRefs.current[index] = el)}
                            type="text"
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            maxLength={1}
                            className="otp-box"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="login-btn" onClick={handleContinue}>
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WarrantyClaim;
