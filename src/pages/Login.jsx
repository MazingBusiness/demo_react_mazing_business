import React, { useState, useRef } from "react";
import LoginHeader from "../layouts/LoginHeader";
import bg from "../assets/images/BG.jpg";
import { login, sendOtpForLogin } from "../api/apiRequestChild";
import { Link,useNavigate } from "react-router-dom";

import facebookIcon from "../assets/icons/fbIcon.svg";
import twitterIcon from "../assets/icons/xIcon.svg";
import linkedinIcon from "../assets/icons/playIcon.svg";

import indiaFlag from "../assets/icons/flag-icon/ind.svg";
import usaFlag from "../assets/icons/flag-icon/ind.svg";
import uaeFlag from "../assets/icons/flag-icon/ind.svg";
import { HiChevronDown } from "react-icons/hi";

const Login = () => {
  
  const countries = [
    { name: "India", code: "+91", flag: indiaFlag },
    { name: "USA", code: "+1", flag: usaFlag },
    { name: "UAE", code: "+971", flag: uaeFlag },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverOtp, setServerOtp] = useState("");
  const otpRefs = useRef([]);

  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectCountry = (country) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
  };

  const validate = () => {
    const newErrors = {};
    if (useEmail) {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Invalid email format";
      }
    } else {
      const cleanMobile = mobile.replace(/\D/g, '');
      if (!cleanMobile) {
        newErrors.mobile = "Mobile number is required";
      } else if (cleanMobile.length !== 10) {
        newErrors.mobile = "Enter valid 10-digit mobile number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    
    if (!validate()) return;

    try {
      const login_info = useEmail
      ? { email, password }
      : { email: "", phone: selectedCountry.code + mobile, password }; //  added `email: ""`

      const res = await login(login_info);
      const data = await res.json();
      console.log("Login API Response:", data);

      if (data && data.id) {
        localStorage.setItem("mazingBusinessLoginInfo", JSON.stringify(data));
        navigate("/profileDashbord");
      } else if (data && data.res === false) {
        setErrors({ general: data.msg || "Login failed" });
        setTimeout(() => setErrors({}), 3000);
      } else {
        setErrors({ general: data.message || "Login failed" });
        setTimeout(() => setErrors({}), 3000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Something went wrong. Please try again." });
      setTimeout(() => setErrors({}), 3000);
    }
  };

  const handleSendOtp = async () => {
    if (!validate()) return;

    try {
      const plainMobile = mobile.replace(/\D/g, '');
      const res = await sendOtpForLogin(plainMobile);
      const data = await res.json();

      console.log("OTP Send API Response:", data);

      if (data.res === true) {
        setOtpSent(true);
        setServerOtp(data.otp?.toString()); // ✅ store OTP for later verification
      } else {
        setErrors({ general: data.msg || "Failed to send OTP" });
        setTimeout(() => setErrors({}), 3000);
      }
    } catch (err) {
      console.error("OTP Send Error:", err);
      setErrors({ general: "Error sending OTP" });
      setTimeout(() => setErrors({}), 3000);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    const enteredOtp = newOtp.join("");
    const otpComplete = enteredOtp.length === 6 && newOtp.every((d) => d !== "");

    if (otpComplete) {
      //  Check against server OTP
      if (enteredOtp !== serverOtp) {
        setErrors({ general: "Invalid OTP" });
        setTimeout(() => setErrors({}), 3000);
        return;
      }

      const login_info = {
        phone: selectedCountry.code + mobile,
        email: "",
        password: enteredOtp,
      };

      login(login_info)
        .then(async (res) => {
          const data = await res.json();
          console.log("Login API Response:", data);

          if (data && data.id) {
            localStorage.setItem("mazingBusinessLoginInfo", JSON.stringify(data));
            navigate("/profileDashbord");
          } else {
            setErrors({ general: data.message || "Login failed" });
            setTimeout(() => setErrors({}), 3000);
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
          setErrors({ general: "Something went wrong. Please try again." });
          setTimeout(() => setErrors({}), 3000);
        });
    }
  };



  return (
    <>
      <LoginHeader />
      <div className="login-container" style={{ backgroundImage: `url(${bg})` }}>
        <div className="overlay">
          <div className="login-maincontainer">
            <div className="left-section">
              <h1>Mazing Business</h1>
              <p>
                Mazing Business is a one-stop B2B e-commerce platform for industrial tools, machinery, and equipment.
                It simplifies procurement with a wide product range and seamless transactions via its website, mobile app, and WhatsApp chatbot.
              </p>
              <small><strong>Ace Tools Pvt. Ltd.</strong> © 2025. All Rights Reserved.</small>
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
                  <h2>Login to your account.</h2>

                  {errors.general && (
                    <div style={{ backgroundColor: "#ffe6e6",color: "#d10000",padding: "10px 14px",borderRadius: "4px",fontSize: "13px",margin: "10px 0"}}>
                      {errors.general}
                    </div>
                  )}

                  {!useEmail ? (
                    <div className="input-row">
                      <div className="phone-input">
                        <div className="countri-dropdown-wrapper" onClick={toggleDropdown}>
                          <img src={selectedCountry.flag} alt="flag" className="flag" />
                          <span className="dial-code">{selectedCountry.code}</span>
                          <HiChevronDown className={`countri-arrow-icon ${dropdownOpen ? "rotate" : ""}`} />
                          {dropdownOpen && (
                            <ul className="countri-dropdown-menu">
                              {countries.map((country, idx) => (
                                <li key={idx} onClick={() => selectCountry(country)}>
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
                          value={mobile}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                            setMobile(onlyNums);
                          }}
                          maxLength={10}
                        />
                      </div>
                      {errors.mobile && <p style={{ color: "red", fontSize: "12px" }}>{errors.mobile}</p>}
                    </div>
                  ) : (
                    <div className="input-row">
                      <input
                        type="email"
                        className="full-input"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {errors.email && <p style={{ color: "red", fontSize: "12px" }}>{errors.email}</p>}
                    </div>
                  )}

                  <div className="otp-row">
                    <button
                      type="button"
                      className="left-link"
                      onClick={() => {
                        setUseEmail(!useEmail);
                        setOtpSent(false);
                      }}
                      style={{ border: "none", background: "none", padding: 0, fontWeight: "500", cursor: "pointer" }}
                    >
                      {useEmail ? "Use Phone Instead" : "Use Email Instead"}
                    </button>

                    {!useEmail && !otpSent && (
                      <span className="right-link" style={{ cursor: "pointer" }} onClick={handleSendOtp}>Send OTP</span>
                    )}
                  </div>

                  {!useEmail && otpSent ? (
                    <div className="otp-box" style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => otpRefs.current[index] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          style={{
                            width: "40px",
                            height: "40px",
                            textAlign: "center",
                            fontSize: "20px",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                          }}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="input-row">
                      <input
                        type="password"
                        className="full-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {errors.password && <p style={{ color: "red", fontSize: "12px" }}>{errors.password}</p>}
                    </div>
                  )}

                  <div className="options-row">
                    <label className="remember-label">
                      <input type="checkbox" /> Remember Me
                    </label>
                    <Link
                      to="/forgotpassword"
                      className="forgot-link"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button className="login-btn" onClick={handleLogin}>Login</button>

                  <p className="register-text">
                    Don’t have an account?
                    <span style={{ marginLeft: "5px" }}>
                      <a href="/register">Register Now</a>
                    </span>
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
