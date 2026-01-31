import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";

import cartllink1 from "../assets/icons/cartllink1a.svg";
import cartllink2 from "../assets/icons/cartllink2.svg";
import cartllink3 from "../assets/icons/cartllink3b.svg";
import cartllink4 from "../assets/icons/cartllink4b.svg";

import Modal from "../components/Modal";
import CartSummary from "../components/CartSummary.jsx";

import { userDetails, getShippingAddress } from "../api/apiRequest";

const Company = () => {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [noGstin, setNoGstin] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/payment");
  };
  const handlegohome = () => {
    navigate("/home");
  };

  const handleTicketFormSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket form submitted!");
    setShowTicketModal(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
    setIsFocused(false); // remove focus after file selection
  };

  const mapUserDetailsToAddresses = (addressJson) => {
    const list = Array.isArray(addressJson?.shipping_address)? addressJson.shipping_address: [];
    return list.map((a) => ({
      id: a?.id || "",
      gst: a?.gstin || "",
      company: a?.company_name || "",
      address1: a?.address || "",
      address2: a?.address_2 || "",
      postalCode: a?.postal_code || "",
      city: a?.city || "",
      state: a?.state || "", // API me state name nahi hai, only state_id
      country: "India",
      phone: a?.phone || "",
      // optional extra fields (useful later)
      id: a?.id,
      acc_code: a?.acc_code,
      set_default: a?.set_default,
      address_id: a?.id,
      state_id: a?.state_id,
      city_id: a?.city_id,
      country_id: a?.country_id,
    }));
  };

  const getAddressData = async () => {
      try {
        const json = await getShippingAddress(); // <-- ensure this returns parsed JSON
        if (json?.res) {
          const mapped = mapUserDetailsToAddresses(json);
          setAddresses(mapped);
        } else {
          setAddresses([]);
        }
      } catch (e) {
        console.error(e);
        setAddresses([]);
      }
  };

  useEffect(() => {
    getAddressData();
  }, []);

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

  const statesOfIndia = ["Andhra Pradesh", "Arunachal Pradesh"];

  const countryofWorld = ["India", "English"];
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef();

  const cityList = ["Delhi", "Mumbai", "Kolkata", "Bangalore"]; // update as needed
  const [selectedCity, setSelectedCity] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityRef = useRef();

  const [gstInput, setGstInput] = useState("");

  // Filter addresses based on GSTIN input
  const matchedAddress = addresses.find(
    (addr) => addr.gst.toLowerCase() === gstInput.toLowerCase()
  );

  const handleNoGstinChange = (e) => {
    setNoGstin(e.target.checked);
    if (e.target.checked) {
      setGstInput(""); // Clear GSTIN input when checkbox is checked
    }
  };

  const selectedAddressObj = addresses?.[selectedAddress];  // selectedAddress = index
  const selectedAddressId = selectedAddressObj?.address_id ?? selectedAddressObj?.id ?? 0;
  return (
    <div className="CartBody ConfirmationBody">
      <MainLayout>
        <div className="cart-panel-box">
          <div className="cart-wrapper">
            <div className="cart-left">
              <div className="cart-left-lft">
                <div className="cartLink">
                  <Link to="/cart" className="active">
                    <img src={cartllink1} alt="MenuIcon" /> Shopping Cart
                  </Link>
                  <Link to="/company">
                    <img src={cartllink2} alt="MenuIcon" /> Shipping Company
                  </Link>
                  
                  <Link to="/confirmation" className="deactive">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                  <Link to="/payment" className="deactive">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
                  </Link>
                </div>
              </div>
              <div className="cart-left-rgt">
                <div className="address-container">
                  {addresses.map((addr, index) => (
                    <label key={index}
                      className={`address-card ${
                        selectedAddress === index ? "selected" : ""
                      }`}
                    >
                      <input type="radio" name="selectedAddress" value={addr.id} checked={selectedAddress === index} onChange={() => setSelectedAddress(index)} />
                      <div className="card-content">
                        <p>
                          <strong>GST IN:</strong> {addr.gst}
                        </p>
                        <p>
                          <strong>Company Name:</strong> {addr.company}
                        </p>
                        <p>
                          <strong>Address:</strong> {addr.address1}
                        </p>
                        <p>
                          <strong>Address 2:</strong> {addr.address2}
                        </p>
                        <p>
                          <strong>Postal Code:</strong> {addr.postalCode}
                        </p>
                        <p>
                          <strong>City:</strong> {addr.city}
                        </p>
                        <p>
                          <strong>State:</strong> {addr.state}
                        </p>
                        <p>
                          <strong>Country:</strong> {addr.country}
                        </p>
                        <p>
                          <strong>Phone:</strong> {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <button className="add-address-btn" onClick={() => setShowTicketModal(true)} >
                  Add New Address <span>+</span>
                </button>
                <p></p>
              </div>
            </div>
            {/* Pass selectedAddressId as props to the cartSummary page */}
            <CartSummary selectedAddressId={selectedAddressId} />
          </div>
        </div>

        {/* Ticket Modal */}
        <Modal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          showFooter={false}
          size={noGstin ? "xlg" : "md"}
        >
          <div className="ba-modal-wpap adrpopup">
            <div className="ba-modal-Lft">
              <form className="ba-modal-form" onSubmit={handleTicketFormSubmit}>
                <h3 className="modal-title">Add New Address</h3>

                <div className="manageProfileFrmBoxInner">
                  <form class="manage-profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>GSTIN</label>
                        <input
                          type="text"
                          placeholder="Enter your GSTIN"
                          value={gstInput}
                          onChange={(e) => setGstInput(e.target.value)}
                        />
                      </div>

                      <div className="options-row">
                        <label>
                          <input
                            type="checkbox"
                            checked={noGstin}
                            onChange={handleNoGstinChange}
                          />{" "}
                          Don’t have a GSTIN?
                        </label>
                      </div>

                      <div className="address-container">
                        {matchedAddress ? (
                          <label className="address-card selected">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={true}
                              onChange={() => {}}
                            />
                            <div className="card-content">
                              <p>
                                <strong>GST IN:</strong> {matchedAddress.gst}
                              </p>
                              <p>
                                <strong>Company Name:</strong>{" "}
                                {matchedAddress.company}
                              </p>
                              <p>
                                <strong>Address:</strong>{" "}
                                {matchedAddress.address1}
                              </p>
                              <p>
                                <strong>Address 2:</strong>{" "}
                                {matchedAddress.address2}
                              </p>
                              <p>
                                <strong>Postal Code:</strong>{" "}
                                {matchedAddress.postalCode}
                              </p>
                              <p>
                                <strong>City:</strong> {matchedAddress.city}
                              </p>
                              <p>
                                <strong>State:</strong> {matchedAddress.state}
                              </p>
                              <p>
                                <strong>Country:</strong>{" "}
                                {matchedAddress.country}
                              </p>
                              <p>
                                <strong>Phone:</strong> {matchedAddress.phone}
                              </p>
                            </div>
                          </label>
                        ) : gstInput ? (
                          <p>No matching address found for this GSTIN.</p>
                        ) : null}
                      </div>
                    </div>

                    {/* ===== Form 2: Without GSTIN ===== */}
                    {noGstin && (
                      <div className="noGst-form-row">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Company Name</label>
                            <input
                              type="text"
                              className="full-input"
                              placeholder="Enter Company Name"
                            />
                          </div>

                          <div className="form-group">
                            <label>Aadhar Number</label>
                            <input
                              type="text"
                              className="full-input"
                              placeholder="Enter Aadhar number"
                            />
                          </div>

                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              className="full-input"
                              placeholder="Enter address"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Country</label>
                            <div
                              className="ba-dropdown-container"
                              ref={countryRef}
                            >
                              <div
                                className={`ba-dropdown-toggle ${
                                  !selectedCountry ? "placeholder" : ""
                                }`}
                                onClick={() =>
                                  setCountryDropdownOpen((prev) => !prev)
                                }
                              >
                                {selectedCountry || "Select Country"}
                                <FiChevronDown
                                  className={`ba-arrow-icon ${
                                    countryDropdownOpen ? "ba-rotate" : ""
                                  }`}
                                />
                              </div>

                              <div
                                className={`ba-dropdown-menu ${
                                  countryDropdownOpen ? "open" : ""
                                }`}
                              >
                                <ul className="ba-dropdown-options">
                                  {countryofWorld.map((country, index) => (
                                    <li
                                      key={index}
                                      className={`ba-dropdown-item ${
                                        selectedCountry === country
                                          ? "selected"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        setSelectedCountry(country);
                                        setCountryDropdownOpen(false);
                                      }}
                                    >
                                      {country}
                                      {selectedCountry === country && (
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

                          <div className="form-group">
                            <label>State</label>
                            <div
                              className="ba-dropdown-container"
                              ref={stateRef}
                            >
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
                                        selectedState === state
                                          ? "selected"
                                          : ""
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
                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              className="full-input"
                              placeholder="Address"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>City</label>
                            <div
                              className="ba-dropdown-container"
                              ref={cityRef}
                            >
                              <div
                                className={`ba-dropdown-toggle ${
                                  !selectedCity ? "placeholder" : ""
                                }`}
                                onClick={() =>
                                  setCityDropdownOpen((prev) => !prev)
                                }
                              >
                                {selectedCity || "Select City"}
                                <FiChevronDown
                                  className={`ba-arrow-icon ${
                                    cityDropdownOpen ? "ba-rotate" : ""
                                  }`}
                                />
                              </div>

                              <div
                                className={`ba-dropdown-menu ${
                                  cityDropdownOpen ? "open" : ""
                                }`}
                              >
                                <ul className="ba-dropdown-options">
                                  {cityList.map((city, index) => (
                                    <li
                                      key={index}
                                      className={`ba-dropdown-item ${
                                        selectedCity === city ? "selected" : ""
                                      }`}
                                      onClick={() => {
                                        setSelectedCity(city);
                                        setCityDropdownOpen(false);
                                      }}
                                    >
                                      {city}
                                      {selectedCity === city && (
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

                          <div className="form-group">
                            <label>City Name</label>
                            <input
                              type="text"
                              className="full-input"
                              placeholder="Enter City"
                            />
                          </div>

                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              className="full-input"
                              placeholder="Address"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <button type="submit" className="form-submit">
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      </MainLayout>
    </div>
  );
};

export default Company;
