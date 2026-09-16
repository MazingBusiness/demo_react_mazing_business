import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";

import cartllink1 from "../assets/icons/cartllink1a.svg";
import cartllink2 from "../assets/icons/cartllink2.svg";
import cartllink3 from "../assets/icons/cartllink3b.svg";
import cartllink4 from "../assets/icons/cartllink4b.svg";
import CartSummary from "../components/CartSummary.jsx";

import {
  addAddress,
  getShippingAddress,
  getStateList,
  userDetails,
} from "../api/apiRequest";
import { verifyGstinForRegistration } from "../api/apiRequestChild";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

const Company = () => {
  const formatCompanyPhone = (value) => {
    const phone = String(value ?? "").trim();

    return /^\d{10}$/.test(phone) ? `+91${phone}` : phone;
  };

  const [selectedAddress, setSelectedAddress] = useState(null); // store selected INDEX
  // const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // add this
  const [noGstin, setNoGstin] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const stateRef = useRef();

  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef();
  
  const [selectedCity, setSelectedCity] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityRef = useRef();

  const [gstInput, setGstInput] = useState(""); // Stores the GST input entered by the user
  const [states, setStates] = useState([]); // Stores the list of states fetched from the API
  const [userPhone, setUserPhone] = useState(""); // Stores the user phone number

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

  const mapUserDetailsToAddresses = (addressJson) => {
    const list = Array.isArray(addressJson?.shipping_address)
      ? addressJson.shipping_address
      : [];

    return list.map((a) => ({
      id: a?.id || "",
      gst: a?.gstin || "",
      company: a?.company_name || "",
      address1: a?.address || "",
      address2: a?.address_2 || "",
      postalCode: a?.postal_code || "",
      city: a?.city || "",
      state: a?.state || "",
      country: "India",
      phone: a?.phone || "",
      acc_code: a?.acc_code || "",
      set_default: Number(a?.set_default || 0),
      address_id: a?.id || "",
      state_id: a?.state_id || "",
      city_id: a?.city_id || "",
      country_id: a?.country_id || "",
    }));
  };
  // stores all details enter for the new shipping address
  const [newCompany, setNewCompany] = useState({
    gstin: "",
    aadharCard: "",
    companyName: "",
    address: "",
    address2: "",
    postalCode: "",
    city: "",
    stateId: "",
    country: "India",
    phone: "",
  });
  const [isCheckingGstin, setIsCheckingGstin] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [gstinMessage, setGstinMessage] = useState({
    text: "",
    type: "",
  });
  //fetch the shipping address and saved the  last used address default address and new address
  const getAddressData = async () => {
    try {
      const json = await getShippingAddress();

      if (json?.res) {
        const mapped = mapUserDetailsToAddresses(json);
        setAddresses(mapped);

        const lastOrderAddressId = json?.lastOrderAddressId
          ? Number(json.lastOrderAddressId)
          : null;

        let defaultIndex = -1;

        // 1) First priority: lastOrderAddressId
        if (lastOrderAddressId) {
          defaultIndex = mapped.findIndex(
            (addr) => Number(addr.address_id) === lastOrderAddressId,
          );
        }

        // 2) If not found, fallback to set_default = 1
        if (defaultIndex === -1) {
          defaultIndex = mapped.findIndex(
            (addr) => Number(addr.set_default) === 1,
          );
        }

        // 3) If still not found, fallback to first address
        if (defaultIndex === -1 && mapped.length > 0) {
          defaultIndex = 0;
        }

        setSelectedAddress(defaultIndex >= 0 ? defaultIndex : null);
      } else {
        setAddresses([]);
        setSelectedAddress(null);
      }
    } catch (e) {
      console.error(e);
      setAddresses([]);
      setSelectedAddress(null);
    }
  };

  useEffect(() => {
    getAddressData();
  }, []);
  // Close the state, country, and city dropdowns when the user clicks outside them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setStateDropdownOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statesOfIndia = ["Andhra Pradesh", "Arunachal Pradesh"];
  const countryofWorld = ["India", "English"];
  const cityList = ["Delhi", "Mumbai", "Kolkata", "Bangalore"];

  const matchedAddress = addresses.find(
    (addr) => (addr.gst || "").toLowerCase() === gstInput.toLowerCase(),
  );

  const handleNoGstinChange = (e) => {
    setNoGstin(e.target.checked);
    if (e.target.checked) {
      setGstInput("");
    }
  };

  const selectedAddressObj =
    selectedAddress !== null ? addresses?.[selectedAddress] : null;

  const selectedAddressId =
    selectedAddressObj?.address_id ?? selectedAddressObj?.id ?? 0;
  // Handle changes in the Add New Company form fields.
  // Convert gstin to uppercase and clear company details gstin is removed
  const handleNewCompanyChange = (event) => {
    const { name, value } = event.target;
    setNewCompany((current) => ({
      ...current,
      [name]: name === "gstin" ? value.toUpperCase() : value,
      ...(name === "gstin" && value.trim() === ""
        ? {
            companyName: "",
            address: "",
            address2: "",
            postalCode: "",
            city: "",
            stateId: "",
          }
        : {}),
    }));
    // Clear the GSTIN verification message when the gstin is changed
    if (name === "gstin") {
      setGstinMessage({ type: "", text: "" });
    }
  };
  // Verify the entered gstin and automatically fill company details from the GST API
  const handleGstinCheck = async () => {
    console.log("STEP 1: GST FUNCTION CALLED");
    // Get and format the GSTIN
    const gstin = newCompany.gstin.trim().toUpperCase();
    console.log("GSTIN:", gstin);
    if (!gstin) {
      setGstinMessage({ type: "", text: "" });
      return;
    }
    // Check that GSTIN is exactly 15 characters
    if (gstin.length !== 15) {
      setGstinMessage({
        type: "error",
        text: "GSTIN must be exactly 15 characters.",
      });
      return;
    }

    setIsCheckingGstin(true);
    setGstinMessage({ type: "", text: "Checking GSTIN..." });
    try {
      const result = await (await verifyGstinForRegistration(gstin)).json();
      console.log("GST API RESULT:", result);
      let availableStates = states;
      if (result?.res !== false && availableStates.length === 0) {
        const stateResponse = await getStateList();
        availableStates = Array.isArray(stateResponse?.state)
          ? stateResponse.state
          : [];
        setStates(availableStates);
      }

      if (result?.res !== false) {
        const taxpayerInfo =
          result?.data?.gst_data?.taxpayerInfo ??
          result?.gst_data?.taxpayerInfo ??
          result?.data?.taxpayerInfo ??
          result?.taxpayerInfo;
        const gstData =
          result?.data?.name || result?.data?.address ? result.data : result;
        const returnedState = String(gstData?.state ?? "")
          .trim()
          .toLowerCase();
        const matchedState = availableStates.find(
          (state) =>
            String(state?.name ?? "")
              .trim()
              .toLowerCase() === returnedState,
        );

        setNewCompany((current) => ({
          ...current,
          companyName:
            taxpayerInfo?.tradeNam ??
            gstData?.tradeNam ??
            gstData?.name ??
            current.companyName,
          address: gstData?.address ?? current.address,
          address2: gstData?.address2 ?? current.address2,
          postalCode: gstData?.postal_code ?? current.postalCode,
          city: gstData?.city ?? current.city,
          stateId: matchedState?.id ?? current.stateId,
            phone:
    gstData?.phone ??
    
    gstData?.phone_number ??
    gstData?.mobile ??
    taxpayerInfo?.phone ??
    taxpayerInfo?.mobile ??
    userPhone ??
    current.phone,

        }));
      }
      // Show error if GST verification fails
      setGstinMessage({
        type: result?.res === false ? "error" : "success",
        text:
          result?.msg ||
          (result?.res === false
            ? "GSTIN verification failed."
            : "GSTIN verified successfully."),
      });
    } catch (error) {
      setGstinMessage({
        type: "error",
        text: "Error verifying GSTIN. Try again.",
      });
    } finally {
      setIsCheckingGstin(false);
    }
  };

  const handleAddNew = async (event) => {
    event.preventDefault();
    const phonePattern = /^\+91\d{10}$/;
    if (
      !newCompany.companyName.trim() ||
      !newCompany.address.trim() ||
      !newCompany.postalCode.trim() ||
      !newCompany.city.trim() ||
      !newCompany.stateId ||
      !newCompany.phone.trim()
    ) {
      toast.error("Please fill in all required address fields.");
      return;
    }
    if (!phonePattern.test(newCompany.phone.trim())) {
      toast.error("Phone number must start with +91 followed by 10 digits.");
      return;
    }

    setIsAddingAddress(true);
    try {
      // Check duplicate BEFORE saving
      const duplicateGST =
        newCompany.gstin.trim() !== "" &&
        addresses.some(
          (addr) =>
            String(addr.gst || "")
              .trim()
              .toUpperCase() === newCompany.gstin.trim().toUpperCase(),
        );

      console.log("Duplicate GST:", duplicateGST);

      // Duplicate GST
      if (duplicateGST) {
        toast.error("Address is already saved.");
        setIsAddingAddress(false);
        return;
      }
      // Only NEW address reaches addAddress API
      const response = await addAddress(newCompany);

      // 4. NEW ADDRESS
      await getAddressData();
      setNewCompany({
        gstin: "",
        aadharCard: "",
        companyName: "",
        address: "",
        address2: "",
        postalCode: "",
        city: "",
        stateId: "",
        country: "India",
        phone: "",
      });
      setGstinMessage({ type: "", text: "" });
      setShowAddModal(false);
      toast.success(response?.msg || "Address added successfully.");
    } catch (error) {
      toast.error(error?.message || "Failed to add address.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Load the logged-in user's phone number when the component loads
  useEffect(() => {
    const loadUserPhone = async () => {
      try {
        // Get user details from the API
        const response = await userDetails();

        const user =
          response?.data?.userDetails ??
          response?.data?.user ??
          response?.userDetails ??
          response?.user ??
          response?.data ??
          response;

        const phone = user?.phone ?? user?.phone_number ?? user?.mobile ?? "";

        const formattedPhone = formatCompanyPhone(phone);

        console.log("USER PHONE:", formattedPhone);

        setUserPhone(formattedPhone);
      } catch (error) {
        console.error("Failed to load user phone:", error);
      }
    };
    // Call the function when the component loads
    loadUserPhone();
  }, []);

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

                  <Link className="deactive">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                  <Link className="deactive">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
                  </Link>
                </div>
              </div>

              <div className="cart-left-rgt">
                <div className="address-container">
                  {addresses.map((addr, index) => (
                    <label
                      key={addr.id || index}
                      className={`address-card ${
                        selectedAddress === index ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={addr.id}
                        checked={selectedAddress === index}
                        onChange={() => setSelectedAddress(index)}
                      />
                      <div className="card-content">
                        <p>
                          <strong>GST IN:</strong> {addr.gst || "-"}
                        </p>
                        <p>
                          <strong>Company Name:</strong> {addr.company || "-"}
                        </p>
                        <p>
                          <strong>Address:</strong> {addr.address1 || "-"}
                        </p>
                        <p>
                          <strong>Address 2:</strong> {addr.address2 || "-"}
                        </p>
                        <p>
                          <strong>Postal Code:</strong> {addr.postalCode || "-"}
                        </p>
                        <p>
                          <strong>City:</strong> {addr.city || "-"}
                        </p>
                        <p>
                          <strong>State:</strong> {addr.state || "-"}
                        </p>
                        <p>
                          <strong>Country:</strong> {addr.country || "-"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {addr.phone || "-"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <button 
                  className="add-address-btn" 
                  onClick={() => { 
                    setNewCompany((current) => ({
                      ...current,
                      phone: current.phone || userPhone,
                    }));
                    setShowAddModal(true);
                  }}
                >
                  Add New Address <span>+</span>
                </button>
                <p></p>
              </div>
            </div>
            <CartSummary
              selectedAddressId={selectedAddressId}
              canCheckout={true}
            />
          </div>
        </div>
        {/* Add New Company Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Add New Company</h3>
              {/* GSTIN input and Verification */}

              <div className="gstin-check-field">
                <input
                  name="gstin"
                  value={newCompany.gstin}
                  onChange={handleNewCompanyChange}
                  maxLength={15}
                  type="text"
                  placeholder="GSTIN (optional)"
                  disabled={isCheckingGstin}
                />

                <button
                  type="button"
                  onClick={handleGstinCheck}
                  disabled={isCheckingGstin || !newCompany.gstin.trim()}
                >
                  {isCheckingGstin ? "Checking..." : "Check GST"}
                </button>
              </div>
              {/* Displaying of GST verification message */}
              {gstinMessage.text && (
                <p className={`gstin-message ${gstinMessage.type}`}>
                  {gstinMessage.text}
                </p>
              )}
              {/* Aadhaar Card */}
              <input
                type="text"
                placeholder="Aadhaar Card"
                name="aadharCard"
                value={newCompany.aadharCard}
                onChange={handleNewCompanyChange}
              />
              {/* Company details */}
              <input
                type="text"
                placeholder="Company Name *"
                name="companyName"
                value={newCompany.companyName}
                onChange={handleNewCompanyChange}
                required
              />

              <input
                type="text"
                placeholder="Address *"
                name="address"
                value={newCompany.address}
                onChange={handleNewCompanyChange}
                required
              />

              <input
                type="text"
                placeholder="Address 2"
                name="address2"
                value={newCompany.address2}
                onChange={handleNewCompanyChange}
              />
              {/* Location details */}
              <input
                type="text"
                placeholder="Postal Code *"
                name="postalCode"
                value={newCompany.postalCode}
                onChange={handleNewCompanyChange}
                required
              />

              <input
                type="text"
                placeholder="City *"
                name="city"
                value={newCompany.city}
                onChange={handleNewCompanyChange}
                required
              />

              {/* State  */}
              <select
                name="stateId"
                value={newCompany.stateId}
                onChange={handleNewCompanyChange}
                required
              >
                <option value="">Select State *</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              {/* Country */}
              <input type="text" value="India" readOnly />

              {/*phone number */}
              <input
                type="text"
                name="phone"
                placeholder="+91XXXXXXXXXX"
                value={newCompany.phone}
                onChange={handleNewCompanyChange}
              />

              {/* Add and Cancel buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleAddNew}
                  disabled={isAddingAddress}
                >
                  {isAddingAddress ? "Saving..." : "Add"}
                </button>

                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </div>
  );
};

export default Company;