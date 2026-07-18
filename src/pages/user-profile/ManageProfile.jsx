import React, { useState, useRef, useEffect } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { FiChevronDown, FiCheck, FiEdit } from "react-icons/fi";
import Edit from "../../assets/icons/EditIcon.svg";
import { addAddress, getStateList, updateAddress, updateBasicInfo, updateEmail, updatePassword, updateSetDefaultAddress, userDetails } from "../../api/apiRequest";
import { verifyGstinForRegistration } from "../../api/apiRequestChild";
import Swal from "sweetalert2";

import { useNavigate, Link } from "react-router-dom";

const ManageProfile = () => {
  const [fileName, setFileName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingDefaultAddress, setIsUpdatingDefaultAddress] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [states, setStates] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isCheckingGstin, setIsCheckingGstin] = useState(false);
  const [gstinMessage, setGstinMessage] = useState({ type: "", text: "" });
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    companyName: "",
    aadharNumber: "",
    phoneNumber: "",
    gstin: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await userDetails();
        const user = response?.data?.userDetails
          ?? response?.data?.user
          ?? response?.userDetails
          ?? response?.user
          ?? response?.data
          ?? response;

        setBasicInfo({
          fullName: user?.name ?? user?.full_name ?? "",
          companyName: user?.company_name ?? user?.companyName ?? "",
          aadharNumber:
            user?.aadhar_card ?? user?.aadhar_number ?? user?.aadhaar_number ?? "",
          phoneNumber: user?.phone ?? user?.phone_number ?? user?.mobile ?? "",
          gstin: user?.gstin ?? user?.gst_no ?? "",
        });
        setEmail(user?.email ?? "");

        const savedPhoto = user?.avatar_original
          ?? user?.photo
          ?? user?.profile_photo
          ?? user?.image;
        if (savedPhoto) {
          setFileName(String(savedPhoto).replace(/\\/g, "/").split("/").pop());
        }

        const addresses = response?.get_addresses
          ?? response?.data?.get_addresses
          ?? user?.get_addresses
          ?? [];

        const addressValue = (value) =>
          typeof value === "object" && value !== null
            ? value.name ?? ""
            : value ?? "";

        const mappedCompanies = (Array.isArray(addresses) ? addresses : []).map(
          (address) => ({
            id: address?.id,
            setDefault: Number(address?.set_default) === 1,
            gstin: address?.gstin ?? "",
            aadharCard: address?.aadhar_card ?? "",
            companyName: address?.company_name ?? "",
            address: address?.address ?? "",
            address2: address?.address_2 ?? "",
            postalCode: address?.postal_code ?? "",
            city: addressValue(address?.city),
            stateId: address?.state_id ?? "",
            state: addressValue(address?.state),
            country: addressValue(address?.country) || "India",
            phone: address?.phone ?? "",
          })
        );

        setCompanies(mappedCompanies);
        const defaultAddressIndex = (Array.isArray(addresses) ? addresses : [])
          .findIndex((address) => Number(address?.set_default) === 1);
        setSelectedIndex(
          mappedCompanies.length > 0
            ? defaultAddressIndex >= 0 ? defaultAddressIndex : 0
            : null
        );
      } catch (error) {
        console.error("Failed to load user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleBasicInfoChange = (event) => {
    const { name, value } = event.target;
    setBasicInfo((current) => ({ ...current, [name]: value }));
  };

  const showToast = (icon, title) => {
    Swal.fire({
      target: document.body,
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      customClass: {
        container: "swal-toast-container",
        popup: "swal-toast-popup",
      },
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordInfo((current) => ({ ...current, [name]: value }));
  };

  const [selectedEntries, setSelectedEntries] = useState("Select option");
  const entriesOptions = ["Request 1", "Request 2"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedPhoto = e.target.files[0];
      setPhoto(selectedPhoto);
      setFileName(selectedPhoto.name);
    }
    setIsFocused(false); // remove focus after file selection
  };

  const handleBasicInfoSubmit = async (event) => {
    event.preventDefault();
    setIsUpdatingBasicInfo(true);

    try {
      const response = await updateBasicInfo(basicInfo, photo);
      const updatedUser = response?.data;

      if (updatedUser) {
        setBasicInfo({
          fullName: updatedUser.name ?? basicInfo.fullName,
          companyName: updatedUser.company_name ?? basicInfo.companyName,
          aadharNumber: updatedUser.aadhar_card ?? basicInfo.aadharNumber,
          phoneNumber: updatedUser.phone ?? basicInfo.phoneNumber,
          gstin: updatedUser.gstin ?? basicInfo.gstin,
        });

        window.dispatchEvent(
          new CustomEvent("user-profile-updated", { detail: updatedUser })
        );
      }

      setPhoto(null);
      showToast("success", response?.msg || "Basic information updated successfully.");
    } catch (error) {
      showToast("error", error?.message || "Failed to update basic information.");
    } finally {
      setIsUpdatingBasicInfo(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordInfo.newPassword || !passwordInfo.confirmPassword) {
      showToast("error", "Please enter password and confirm password.");
      return;
    }

    if (passwordInfo.newPassword.length < 6) {
      showToast("error", "Password minimum 6 characters.");
      return;
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      showToast("error", "Confirm password must match the new password.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await updatePassword(passwordInfo);
      setPasswordInfo({
        newPassword: "",
        confirmPassword: "",
      });
      showToast("success", response?.msg || "Password updated successfully.");
    } catch (error) {
      showToast("error", error?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleVerify = () => {
    // handle verify logic
    console.log("Verify clicked for:", email);
  };

  const handleUpdateEmail = async (event) => {
    event.preventDefault();

    const nextEmail = email.trim();
    if (!nextEmail) {
      showToast("error", "Please enter your email.");
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const response = await updateEmail(nextEmail);
      const updatedUser = response?.data;

      setEmail(updatedUser?.email ?? nextEmail);

      if (updatedUser) {
        window.dispatchEvent(
          new CustomEvent("user-profile-updated", { detail: updatedUser })
        );
      }

      showToast("success", response?.msg || "Email updated successfully.");
    } catch (error) {
      showToast("error", error?.message || "Failed to update email.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [companies, setCompanies] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
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

  const openEditModal = (company, index) => {
    setEditData({ ...company, country: "India" });
    setEditIndex(index);
    setShowEditModal(true);

    if (states.length === 0) {
      getStateList()
        .then((response) => setStates(Array.isArray(response?.state) ? response.state : []))
        .catch((error) => showToast("error", error?.message || "Failed to load states."));
    }
  };

  const handleSelectAddress = async (company, index) => {
    if (isUpdatingDefaultAddress || selectedIndex === index) {
      return;
    }

    if (!company?.id) {
      showToast("error", "Address id not found.");
      return;
    }

    const previousIndex = selectedIndex;
    setSelectedIndex(index);
    setIsUpdatingDefaultAddress(true);

    try {
      const response = await updateSetDefaultAddress(company.id);

      setCompanies((current) =>
        current.map((item, itemIndex) => ({
          ...item,
          setDefault: itemIndex === index,
        }))
      );

      showToast("success", response?.msg || "Default address updated successfully.");
    } catch (error) {
      setSelectedIndex(previousIndex);
      showToast("error", error?.message || "Failed to update default address.");
    } finally {
      setIsUpdatingDefaultAddress(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editData.companyName?.trim() || !editData.address?.trim()
      || !editData.postalCode?.trim() || !editData.city?.trim()
      || !editData.stateId || !editData.phone?.trim()) {
      showToast("error", "Please fill in all required address fields.");
      return;
    }

    setIsUpdatingAddress(true);
    try {
      const response = await updateAddress(editData);
      const selectedState = states.find(
        (state) => String(state.id) === String(editData.stateId)
      );
      const updatedAddress = {
        ...editData,
        state: response?.data?.state ?? selectedState?.name ?? editData.state,
        country: "India",
      };
      setCompanies((current) => current.map(
        (company, index) => index === editIndex ? updatedAddress : company
      ));
      setShowEditModal(false);
      showToast("success", response?.msg || "Address updated successfully.");
    } catch (error) {
      showToast("error", error?.message || "Failed to update address.");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const loadStates = () => {
    if (states.length > 0) {
      return;
    }

    getStateList()
      .then((response) => setStates(Array.isArray(response?.state) ? response.state : []))
      .catch((error) => showToast("error", error?.message || "Failed to load states."));
  };

  const openAddModal = () => {
    setGstinMessage({ type: "", text: "" });
    setShowAddModal(true);
    loadStates();
  };

  const handleNewCompanyChange = (event) => {
    const { name, value } = event.target;
    setNewCompany((current) => ({
      ...current,
      [name]: name === "gstin" ? value.toUpperCase() : value,
    }));

    if (name === "gstin") {
      setGstinMessage({ type: "", text: "" });
    }
  };

  const handleGstinCheck = async () => {
    const gstin = newCompany.gstin.trim().toUpperCase();
    if (!gstin) {
      setGstinMessage({ type: "", text: "" });
      return;
    }

    if (gstin.length !== 15) {
      setGstinMessage({ type: "error", text: "GSTIN must be exactly 15 characters." });
      return;
    }

    setIsCheckingGstin(true);
    setGstinMessage({ type: "", text: "Checking GSTIN..." });
    try {
      const result = await (await verifyGstinForRegistration(gstin)).json();
      let availableStates = states;
      if (result?.res !== false && availableStates.length === 0) {
        const stateResponse = await getStateList();
        availableStates = Array.isArray(stateResponse?.state) ? stateResponse.state : [];
        setStates(availableStates);
      }

      if (result?.res !== false) {
        const gstData = result?.data?.name || result?.data?.address
          ? result.data
          : result;
        const returnedState = String(gstData?.state ?? "").trim().toLowerCase();
        const matchedState = availableStates.find(
          (state) => String(state?.name ?? "").trim().toLowerCase() === returnedState
        );

        setNewCompany((current) => ({
          ...current,
          companyName: gstData?.name ?? current.companyName,
          address: gstData?.address ?? current.address,
          address2: gstData?.address2 ?? current.address2,
          postalCode: gstData?.postal_code ?? current.postalCode,
          city: gstData?.city ?? current.city,
          stateId: matchedState?.id ?? current.stateId,
        }));
      }

      setGstinMessage({
        type: result?.res === false ? "error" : "success",
        text: result?.msg || (result?.res === false ? "GSTIN verification failed." : "GSTIN verified successfully."),
      });
    } catch (error) {
      setGstinMessage({ type: "error", text: "Error verifying GSTIN. Try again." });
    } finally {
      setIsCheckingGstin(false);
    }
  };

  const handleAddNew = async (event) => {
    event.preventDefault();
    const phonePattern = /^\+91\d{10}$/;
    if (!newCompany.companyName.trim() || !newCompany.address.trim()
      || !newCompany.postalCode.trim() || !newCompany.city.trim()
      || !newCompany.stateId || !newCompany.phone.trim()) {
      showToast("error", "Please fill in all required address fields.");
      return;
    }
    if (!phonePattern.test(newCompany.phone.trim())) {
      showToast("error", "Phone number must start with +91 followed by 10 digits.");
      return;
    }

    setIsAddingAddress(true);
    try {
      const response = await addAddress(newCompany);
      const selectedState = states.find(
        (state) => String(state.id) === String(newCompany.stateId)
      );
      setCompanies((current) => [...current, {
        ...newCompany,
        id: response?.data?.id,
        state: response?.data?.state ?? selectedState?.name ?? "",
        setDefault: false,
      }]);
      setNewCompany({
        gstin: "", aadharCard: "", companyName: "", address: "", address2: "",
        postalCode: "", city: "", stateId: "", country: "India", phone: "",
      });
      setGstinMessage({ type: "", text: "" });
      setShowAddModal(false);
      showToast("success", response?.msg || "Address added successfully.");
    } catch (error) {
      showToast("error", error?.message || "Failed to add address.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  return (
    <UserProfileLayout>
      <div className="manage-profile-container">
        <div className="manageProfileFrm">
          <div className="manageProfileFrmBoxHr">
            <h3>Basic Info</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form className="manage-profile-form" onSubmit={handleBasicInfoSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={basicInfo.fullName}
                    onChange={handleBasicInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter company name"
                    value={basicInfo.companyName}
                    onChange={handleBasicInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Aadhar Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    placeholder="Enter Aadhar number"
                    value={basicInfo.aadharNumber}
                    onChange={handleBasicInfoChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    value={basicInfo.phoneNumber}
                    onChange={handleBasicInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    placeholder="Enter GSTIN"
                    value={basicInfo.gstin}
                    onChange={handleBasicInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Photo</label>
                  <div
                    className={`file-upload-box ${isFocused ? "focused" : ""}`}
                    onClick={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)} // will work only if element is focusable
                    tabIndex={0} // make div focusable
                  >
                    <span
                      className={`file-status ${
                        fileName ? "uploaded" : "placeholder"
                      }`}
                    >
                      {"Select your file!"}
                    </span>

                    <label className="custom-upload-btn">
                      Choose file
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <button
                  type="submit"
                  className="form-submit"
                  disabled={isUpdatingBasicInfo}
                >
                  {isUpdatingBasicInfo ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
          <div className="manageProfileFrmBoxHr">
            <h3>Change Password</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form className="manage-profile-form" onSubmit={handlePasswordSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter your password"
                    value={passwordInfo.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Enter confirm password"
                    value={passwordInfo.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="form-submit form-submit-Update"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="manageProfileFrmBoxHr">
            <h3>Change your Email</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form className="manage-profile-form" onSubmit={handleUpdateEmail}>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <div className="email-input-container">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="button" onClick={handleVerify}>Verify</button>
                  </div>
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="form-submit form-submit-Update"
                    disabled={isUpdatingEmail}
                  >
                    {isUpdatingEmail ? "Updating..." : "Update Email"}
                  </button>
                </div>
                <div className="form-group blanksBox"></div>
              </div>
            </form>
          </div>
          {/* <div className="manageProfileFrmBoxHr">
            <h3>Active to order your OWN brand</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form className="manage-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Send Request</label>
                  <div className="ShowEntries-dropdown" ref={dropdownRef}>
                    <div className="show-dropdown-container">
                      <div
                        className={`show-dropdown-toggle ${
                          selectedEntries === "Select option"
                            ? "placeholder"
                            : ""
                        }`}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        {selectedEntries}
                        <FiChevronDown
                          className={`show-arrow-icon ${
                            dropdownOpen ? "show-rotate" : ""
                          }`}
                        />
                      </div>

                      <div
                        className={`show-dropdown-menu ${
                          dropdownOpen ? "open" : ""
                        }`}
                      >
                        <ul className="show-dropdown-options">
                          {entriesOptions.length === 0 ? (
                            <li className="ba-no-data">No Data</li>
                          ) : (
                            entriesOptions.map((option, index) => (
                              <li
                                key={index}
                                className={`show-dropdown-item ${
                                  selectedEntries === option ? "selected" : ""
                                }`}
                                onClick={() => {
                                  setSelectedEntries(option);
                                  setDropdownOpen(false);
                                }}
                              >
                                {option}
                                {selectedEntries === option && (
                                  <span className="show-check-icon">
                                    <FiCheck />
                                  </span>
                                )}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <span className="greenInfo">
                    Your OWN Brand request had been approved by Admin
                  </span>
                </div>
              </div>

              <div className="form-row">
                <button type="submit" className="form-submit">
                  Submit Request
                </button>
              </div>
            </form>
          </div> */}

          <div className="company-section">
            <h3>Your Company Details</h3>

            <div className="company-grid">
              {companies.map((company, index) => (
                <div
                  key={company.id ?? index}
                  className={`company-card ${
                    selectedIndex === index ? "selected" : ""
                  }`}
                  onClick={() => handleSelectAddress(company, index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectAddress(company, index);
                    }
                  }}
                  role="radio"
                  aria-checked={selectedIndex === index}
                  tabIndex={0}
                >
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="company"
                      checked={selectedIndex === index}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => handleSelectAddress(company, index)}
                      disabled={isUpdatingDefaultAddress}
                    />
                  </div>

                  <div className="company-info">
                    <p>
                      <strong>GST In:</strong> {company.gstin}
                    </p>
                    <p>
                      <strong>Company Name:</strong> {company.companyName}
                    </p>
                    <p>
                      <strong>Address:</strong> {company.address}
                    </p>
                    <p>
                      <strong>Address 2:</strong> {company.address2}
                    </p>
                    <p>
                      <strong>Postal Code:</strong> {company.postalCode}
                    </p>
                    <p>
                      <strong>City:</strong> {company.city}
                    </p>
                    <p>
                      <strong>State:</strong> {company.state}
                    </p>
                    <p>
                      <strong>Country:</strong> {company.country || "India"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {company.phone}
                    </p>
                  </div>

                  <button
                    className="edit-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditModal(company, index);
                    }}
                  >
                    <img src={Edit} alt="Edit" className="edit-icon" />
                  </button>
                </div>
              ))}
            </div>

            <button className="add-btn" onClick={openAddModal}>
              Add New Address <span>+</span>
            </button>

            {/* EDIT MODAL */}
            {showEditModal && (
              <div className="modal-overlay">
                <form className="modal-box" onSubmit={saveEdit}>
                  <h3>Edit Company Details</h3>
                  <input name="gstin" value={editData.gstin ?? ""} placeholder="GSTIN" disabled />
                  <input name="aadharCard" value={editData.aadharCard ?? ""} onChange={handleEditChange} placeholder="Aadhaar Card" />
                  <input name="companyName" value={editData.companyName ?? ""} onChange={handleEditChange} placeholder="Company Name" required />
                  <input name="address" value={editData.address ?? ""} onChange={handleEditChange} placeholder="Address" required />
                  <input name="address2" value={editData.address2 ?? ""} onChange={handleEditChange} placeholder="Address 2" />
                  <input name="postalCode" value={editData.postalCode ?? ""} onChange={handleEditChange} placeholder="Postal Code" required />
                  <input name="city" value={editData.city ?? ""} onChange={handleEditChange} placeholder="City" required />
                  <select name="stateId" value={editData.stateId ?? ""} onChange={handleEditChange} required>
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                  <input name="country" value="India" readOnly />
                  <input name="phone" value={editData.phone ?? ""} onChange={handleEditChange} placeholder="Phone" required />
                  <div className="modal-actions">
                    <button type="submit" disabled={isUpdatingAddress}>
                      {isUpdatingAddress ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={() => setShowEditModal(false)} disabled={isUpdatingAddress}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ADD MODAL */}
            {showAddModal && (
              <div className="modal-overlay">
                <form className="modal-box" onSubmit={handleAddNew}>
                  <h3>Add New Company</h3>
                  <div className="gstin-check-field">
                    <input name="gstin" value={newCompany.gstin} onChange={handleNewCompanyChange} placeholder="GSTIN (optional)" maxLength={15} disabled={isCheckingGstin} />
                    <button type="button" onClick={handleGstinCheck} disabled={isCheckingGstin || !newCompany.gstin.trim()}>
                      {isCheckingGstin ? "Checking..." : "Check GST"}
                    </button>
                  </div>
                  {gstinMessage.text && <p className={`gstin-message ${gstinMessage.type}`}>{gstinMessage.text}</p>}
                  <fieldset disabled={isCheckingGstin} className="address-fields">
                    <input name="aadharCard" value={newCompany.aadharCard} onChange={handleNewCompanyChange} placeholder="Aadhaar Card" />
                    <input name="companyName" value={newCompany.companyName} onChange={handleNewCompanyChange} placeholder="Company Name *" required />
                    <input name="address" value={newCompany.address} onChange={handleNewCompanyChange} placeholder="Address *" required />
                    <input name="address2" value={newCompany.address2} onChange={handleNewCompanyChange} placeholder="Address 2" />
                    <input name="postalCode" value={newCompany.postalCode} onChange={handleNewCompanyChange} placeholder="Postal Code *" required />
                    <input name="city" value={newCompany.city} onChange={handleNewCompanyChange} placeholder="City *" required />
                    <select name="stateId" value={newCompany.stateId} onChange={handleNewCompanyChange} required>
                      <option value="">Select State *</option>
                      {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
                    </select>
                    <input name="country" value="India" readOnly />
                    <input name="phone" value={newCompany.phone} onChange={handleNewCompanyChange} placeholder="+91XXXXXXXXXX *" required />
                  </fieldset>
                  <div className="modal-actions">
                    <button type="submit" disabled={isAddingAddress || isCheckingGstin}>{isAddingAddress ? "Adding..." : "Add"}</button>
                    <button type="button" onClick={() => setShowAddModal(false)} disabled={isAddingAddress || isCheckingGstin}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ManageProfile;
