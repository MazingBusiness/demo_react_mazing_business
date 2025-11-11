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
import { verifyGstinForRegistration,registerUser,sendOtpForLogin,getAllStates,verifyPhoneForRegistration ,getCitiesByState   } from "../api/apiRequestChild";

import { FiChevronDown, FiCheck } from "react-icons/fi";


const Register = () => {
  const navigate = useNavigate();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

  const [noGstin, setNoGstin] = useState(false);
  const [noGstinName, setNoGstinName] = useState("");

  const [phoneExists, setPhoneExists] = useState(false); // ✅ New
  
  const [noGstinEmail, setNoGstinEmail] = useState("");
  const [noGstinCompany, setNoGstinCompany] = useState("");
  const [noGstinAddress, setNoGstinAddress] = useState("");
  const [noGstinAddress2, setNoGstinAddress2] = useState("");
  const [noGstinCity, setNoGstinCity] = useState("");
  const [noGstinPincode, setNoGstinPincode] = useState("");
  const [noGstinAadhar, setNoGstinAadhar] = useState("");
  
  const [gstin, setGstin] = useState("");
  const [gstError, setGstError] = useState("");
  const [gstVerified, setGstVerified] = useState(false);
  const [gstChecking, setGstChecking] = useState(false);

  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverOtp, setServerOtp] = useState(""); // ✅ Add this here

  const [gstDetails, setGstDetails] = useState({});

  const [statesList, setStatesList] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState({});

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
      const fetchStates = async () => {
        try {
          const res = await getAllStates();
          const data = await res.json();
          if (data.res === true && Array.isArray(data.state)) {
            setStatesList(data.state);
          }
        } catch (err) {
          console.error("Failed to fetch states", err);
        }
      };

      fetchStates();
    }, []);

    useEffect(() => {
      if (selectedStateId) {
        const fetchCities = async () => {
          try {
            const cities = await getCitiesByState(selectedStateId);
            console.log("Cities for selected state:", cities);
          } catch (error) {
            console.error("Error fetching cities:", error);
          }
        };

        fetchCities();
      }
    }, [selectedStateId]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (stateRef.current && !stateRef.current.contains(event.target)) {
          setStateDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  const validateNoGstinFields = () => {
    const newErrors = {};

    if (!noGstinName.trim()) newErrors.noGstinName = "Full Name is required";
    if (!noGstinEmail.trim()) {
      newErrors.noGstinEmail = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(noGstinEmail)) {
      newErrors.noGstinEmail = "Invalid email format";
    }

    if (!noGstinCompany.trim()) newErrors.noGstinCompany = "Company Name is required";
    if (!noGstinAadhar.trim()) {
      newErrors.noGstinAadhar = "Aadhar No. is required";
    } else if (!/^\d{12}$/.test(noGstinAadhar)) {
      newErrors.noGstinAadhar = "Aadhar must be 12 digits";
    }

    if (!noGstinAddress.trim()) newErrors.noGstinAddress = "Address is required";
    if (!noGstinCity.trim()) newErrors.noGstinCity = "City is required";

    if (!noGstinPincode.trim()) {
      newErrors.noGstinPincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(noGstinPincode)) {
      newErrors.noGstinPincode = "Pincode must be 6 digits";
    }

    if (!selectedStateId) newErrors.selectedStateId = "State is required";
    if (!termsAccepted) newErrors.termsAccepted = "You must accept terms & conditions";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleCreateAccount = async () => {
    if (!mobile || mobile.length !== 10) {
      alert("Enter valid 10-digit mobile number");
      return;
    }
    if (phoneExists) {
      alert("Phone number already exists.");
      return;
    }
    

    if (!termsAccepted) {
      alert("Please accept the Terms and Conditions before proceeding.");
      return;
    }

    if (!noGstin) {
      // ✅ GST flow validation
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

      if (!email) {
        alert("Please enter your email.");
        return;
      }

      if (!gstin || !gstinRegex.test(gstin)) {
        alert("Please enter a valid 15-digit GSTIN.");
        return;
      }
    } else {
      // ✅ No GST validation
      if (!validateNoGstinFields()) return;
    }

    try {
      const response = await sendOtpForLogin(selectedCountry.code + mobile);
      const result = await response.json();
      console.log("OTP Response:", result);
      if (result.res === true) {
        setServerOtp(String(result.otp));
        setShowOtpBox(true);
        setOtp(["", "", "", "", "", ""]);
      } else {
        alert(result.msg || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Something went wrong.");
    }
  };

  useEffect(() => {
    if (otp.join("").length === 6) {
      const enteredOtp = otp.join("");
      const expectedOtp = serverOtp;

      if (enteredOtp === expectedOtp) {
        let formData = {};

        if (!noGstin) {
          const taxpayerInfo = gstDetails?.gst_data?.taxpayerInfo || {};
          const pradr = taxpayerInfo?.pradr?.addr || {};

          formData = {
            gstin: gstin,
            gst_data: JSON.stringify({ taxpayerInfo }),
            phone: mobile,
            email: email,
            name: taxpayerInfo?.lgnm || "",
            company_name: taxpayerInfo?.tradeNam || "",
            postal_code: pradr?.pncd || "",
            aadhar_card: "",
            address: `${pradr?.bno || ""} ${pradr?.st || ""} ${pradr?.loc || ""}`.trim(),
            address2: "",
            city: pradr?.dst || "",
            state: selectedStateId
          };
        } else {
          formData = {
            gstin: "",
            gst_data: JSON.stringify({ taxpayerInfo: {} }),
            phone: mobile,
            email: noGstinEmail,
            name: noGstinName,
            company_name: noGstinCompany,
            postal_code: noGstinPincode,
            aadhar_card: noGstinAadhar,
            address: noGstinAddress,
            address2: noGstinAddress2,
            city: noGstinCity,
            state: selectedStateId
          };
        }

        console.log("📦 Sending formData:", formData);

        registerUser(formData)
          .then((res) => res.json())
          .then((data) => {
            console.log("✅ Server JSON Response:", data);
            if (data.res === true) {
              
                alert("Account created successfully!");
                setShowOtpBox(false);
                setOtp(["", "", "", "", "", ""]);
                navigate("/login");

            } else {
              alert(data.msg || "Registration failed.");
            }
          })
          .catch((err) => {
            console.error("❌ Registration Failed:", err);
            alert("Something went wrong.");
          });
      } else {
        alert("Incorrect OTP");
      }
    }
  }, [otp]);

  const handleGstinChange = async (e) => {
    const input = e.target.value.toUpperCase();
    setGstin(input);
    setGstVerified(false);
    setGstError("");

    if (input.length === 15) {
      if (!gstinRegex.test(input)) {
        setGstError("GSTIN format is invalid.");
        return;
      }

      setGstChecking(true);
      try {
        const res = await verifyGstinForRegistration(input);
        const result = await res.json();
        setGstChecking(false);

        if (result.res === false) {
          setGstError(result.msg || "GSTIN verification failed.");
          setGstVerified(false);
          setGstDetails({});
        } else {
          setGstVerified(true);
          setGstError("");
          setGstDetails(result);  // ✅ Store full response
        }
      } catch (error) {
        setGstChecking(false);
        setGstError("Error verifying GSTIN. Try again.");
      }
    } else if (input.length > 0 && input.length < 15) {
      setGstError("GSTIN must be exactly 15 characters.");
    }
  };


  const handleMobileChange = async (e) => {
    const value = e.target.value;

    // Allow only numeric values
    if (!/^\d*$/.test(value)) return;

    setMobile(value); // ✅ update input value

    if (value.length === 10) {
      try {
        const response = await verifyPhoneForRegistration(selectedCountry.code + value);
        const data = await response.json();

        if (data.res === false) {
          setPhoneExists(true);
        } else {
          setPhoneExists(false);
        }
      } catch (err) {
        console.error("Phone verify error:", err);
      }
    } else {
      setPhoneExists(false);
    }
  };


  const validateMobile = (value) => {
    setMobile(value);
    if (!/^\d{10}$/.test(value)) {
      setMobileError("Please enter a valid 10-digit mobile number.");
    } else {
      setMobileError("");
    }
  };


  const validateEmail = (value) => {
    setEmail(value);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.trim() === "") {
      setEmailError("Email is required.");
    } else if (!emailPattern.test(value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
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
       
                    <div className="form-group">
                      <div
                        className="phone-input"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: mobileError ? "1px solid red" : "1px solid #ccc",
                          borderRadius: "6px",
                          padding: "0 12px",
                          backgroundColor: "#fff",
                          height: "48px",
                          position: "relative",
                          background:"#f5f5f5",
                          border:"none"
                        }}
                      >
                        {/* Country Dropdown */}
                        <div
                          className="countri-dropdown-wrapper"
                          onClick={toggleDropdown}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            marginRight: "10px",
                            userSelect: "none",
                          }}
                        >
                          <img
                            src={selectedCountry.flag}
                            alt="flag"
                            className="flag"
                            style={{ width: "30px", height: "30px", marginRight: "4px" }}
                          />
                          <span style={{ fontSize: "14px", fontWeight: "600" }}>{selectedCountry.code}</span>
                          <HiChevronDown
                            className={`countri-arrow-icon ${dropdownOpen ? "rotate" : ""}`}
                            style={{ marginLeft: "4px", fontSize: "16px" }}
                          />
                        </div>

                        {/* Country Dropdown List */}
                        {dropdownOpen && (
                          <ul
                            className="countri-dropdown-menu"
                            style={{
                              position: "absolute",
                              top: "52px",
                              left: 0,
                              backgroundColor: "#fff",
                              listStyle: "none",
                              padding: "6px 0",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              zIndex: 999,
                              width: "100%",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                          >
                            {countries.map((country, idx) => (
                              <li
                                key={idx}
                                onClick={() => selectCountry(country)}
                                style={{
                                  padding: "8px 12px",
                                  display: "flex",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  transition: "background 0.2s",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <img
                                  src={country.flag}
                                  alt={country.name}
                                  style={{ width: "18px", marginRight: "8px" }}
                                />
                                <span>{country.code}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Mobile Input */}
                        <input
                          type="text"
                          placeholder="Mobile number"
                          value={mobile}
                          onChange={async (e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              validateMobile(value); // your existing validation

                              setMobile(value); // update mobile

                              if (value.length === 10) {
                                try {
                                  const res = await verifyPhoneForRegistration(value); // API call
                                  const data = await res.json();

                                  if (data.res === false) {
                                    setPhoneExists(true);
                                    setMobileError(data.msg); // "Phone already exists"
                                  } else {
                                    setPhoneExists(false);
                                    setMobileError(""); // clear error
                                  }
                                } catch (err) {
                                  console.error("Phone verify error:", err);
                                }
                              } else {
                                setPhoneExists(false);
                                setMobileError(""); // clear error if < 10 digits
                              }
                            }
                          }}
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100%",
                            fontSize: "14px",
                            padding: "10px 0",
                            background: "transparent",
                          }}
                          maxLength={10}
                        />
                      </div>

                      {/* Validation Message */}
                      {mobileError && (
                        <small
                          style={{
                            color: "red",
                            marginTop: "6px",
                            display: "block",
                            fontSize: "12px",
                            paddingLeft: "4px",
                          }}
                        >
                          {mobileError}
                        </small>
                      )}
                    </div>

                      <div className="form-row">
                          <div className="form-group">
                            <input
                              type="email"
                              className="full-input"
                              placeholder="Email"
                              value={email}
                              onChange={(e) => validateEmail(e.target.value)}
                              style={{
                                border: emailError ? "1px solid red" : "none",
                                borderRadius: "6px",
                                padding: "12px 14px",
                                fontSize: "14px",
                                width: "100%",
                                height: "48px",
                                outline: "none",
                                background: "#f5f5f5",
                              }}
                            />
                            {emailError && (
                              <small
                                style={{
                                  color: "red",
                                  marginTop: "6px",
                                  display: "block",
                                  fontSize: "12px",
                                  paddingLeft: "4px",
                                }}
                              >
                                {emailError}
                              </small>
                            )}
                          </div>
                        </div>

                      <div className="form-row">
                        <div className="form-group">
                            <input
                              type="text"
                              className="full-input"
                              placeholder="GSTIN Number"
                              value={gstin}
                              onChange={handleGstinChange}
                              maxLength={15}
                              style={{
                                border: gstError ? "1px solid red" : gstVerified ? "1px solid green" : "",
                              }}
                            />
                            {gstChecking && <small style={{ color: "blue" }}>Verifying...</small>}
                            {gstError && <small style={{ color: "red" }}>{gstError}</small>}
                            {gstVerified && !gstError && <small style={{ color: "green" }}>GSTIN Verified ✅</small>}
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
                           <input
                                type="text"
                                placeholder="Mobile number"
                                value={mobile}
                                onChange={handleMobileChange}
                                maxLength={10}
                                style={{
                                  border: "1px solid #ccc",
                                  borderRadius: "6px",
                                  padding: "10px 12px",
                                  fontSize: "14px",
                                  width: "100%",
                                  height: "48px",
                                  outline: "none",
                                  background: "#f5f5f5",
                                  border:"none"
                                }}
                              />
                          </div>
                        </div>
                        <div className="form-group">
                          <input
                              type="email"
                              className="full-input"
                              value={noGstinEmail}
                              onChange={(e) => setNoGstinEmail(e.target.value)}
                              placeholder="Email"
                            />
                            {errors.noGstinEmail && <small style={{ color: "red" }}>{errors.noGstinEmail}</small>}
                        </div>

                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            value={noGstinName}
                            onChange={(e) => setNoGstinName(e.target.value)}
                            placeholder="Full Name"
                          />
                          {errors.noGstinName && <small style={{ color: "red" }}>{errors.noGstinName}</small>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                              type="text"
                              className="full-input"
                              value={noGstinCompany}
                              onChange={(e) => setNoGstinCompany(e.target.value)}
                              placeholder="Company Name"
                            />
                            {errors.noGstinCompany && <small style={{ color: "red" }}>{errors.noGstinCompany}</small>}
                        </div>
                        <div className="form-group">
                         <input
                            type="text"
                            className="full-input"
                            value={noGstinAadhar}
                            onChange={(e) => setNoGstinAadhar(e.target.value)}
                            placeholder="Aadhar Card No."
                          />
                          {errors.noGstinAadhar && <small style={{ color: "red" }}>{errors.noGstinAadhar}</small>}
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            value={noGstinAddress}
                            onChange={(e) => setNoGstinAddress(e.target.value)}
                            placeholder="Address"
                          />
                          {errors.noGstinAddress && <small style={{ color: "red" }}>{errors.noGstinAddress}</small>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            value={noGstinAddress2}
                            onChange={(e) => setNoGstinAddress2(e.target.value)}
                            placeholder="Address 2 (Optional)"
                          />

                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            className="full-input"
                            value={noGstinCity}
                            onChange={(e) => setNoGstinCity(e.target.value)}
                            placeholder="City"
                          />
                          {errors.noGstinCity && <small style={{ color: "red" }}>{errors.noGstinCity}</small>}

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
                               {statesList.map((stateObj, index) => (
                                    <li
                                      key={stateObj.id}
                                      className={`ba-dropdown-item ${selectedState === stateObj.name ? "selected" : ""}`}
                                      onClick={() => {
  setSelectedState(stateObj.name);
  setSelectedStateId(stateObj.id); // ✅ Yeh line `useEffect` trigger karegi
  setStateDropdownOpen(false);
}}
                                    >
                                      {stateObj.name}
                                      {selectedState === stateObj.name && (
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
                              value={noGstinPincode}
                              onChange={(e) => setNoGstinPincode(e.target.value)}
                              placeholder="Pincode"
                              maxLength={6}
                            />
                            {errors.noGstinPincode && <small style={{ color: "red" }}>{errors.noGstinPincode}</small>}
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
                        <input
                              type="checkbox"
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                            />
                        By signing up you agree to our terms and conditions.
                      </label>
                      {errors.termsAccepted && <small style={{ color: "red" }}>{errors.termsAccepted}</small>}
                    </div>
                  </div>

                 <button
                    className="login-btn"
                    onClick={handleCreateAccount} // ✅ trigger OTP box open
                  >
                    Create Account
                  </button>

                        {showOtpBox && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "25px" }}>
                            <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px", color: "#555" }}>
                              Enter OTP sent to your mobile number
                            </p>

                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                              {otp.map((digit, index) => (
                                <input
                                  key={index}
                                  id={`otp-${index}`}
                                  type="text"
                                  value={digit}
                                  maxLength={1}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d?$/.test(value)) {
                                      const newOtp = [...otp];
                                      newOtp[index] = value;
                                      setOtp(newOtp);
                                      if (value && index < 5) {
                                        document.getElementById(`otp-${index + 1}`).focus();
                                      }
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                                      const newOtp = [...otp];
                                      newOtp[index - 1] = "";
                                      setOtp(newOtp);
                                      document.getElementById(`otp-${index - 1}`).focus();
                                      e.preventDefault();
                                    }
                                  }}
                                  style={{
                                    width: "42px",
                                    height: "44px",
                                    textAlign: "center",
                                    fontSize: "18px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    outline: "none",
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                  <p className="register-text">
                    Already have an account? <Link to="/login">Log In</Link> 
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
