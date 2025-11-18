import React, { useState, useRef, useEffect } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { FiChevronDown, FiCheck, FiEdit } from "react-icons/fi";
import Edit from "../../assets/icons/EditIcon.svg";

import { useNavigate, Link } from "react-router-dom";

const ManageProfile = () => {
  const [fileName, setFileName] = useState("");
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
      setFileName(e.target.files[0].name);
    }
    setIsFocused(false); // remove focus after file selection
  };

  const handleVerify = () => {
    // handle verify logic
    console.log("Verify clicked for:", email);
  };

  const handleUpdateEmail = () => {
    // handle update logic
    console.log("Update Email clicked");
  };

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [companies, setCompanies] = useState([
    {
      gstin: "07AAOCM7588A1Z3",
      companyName: "Mazing Retail Pvt Ltd",
      address: "Rama Road Industrial Park",
      address2: "Rama Road Industrial Center",
      postalCode: "700059",
      city: "West Delhi",
      state: "Delhi",
      country: "India",
      phone: "+91 1234567890",
    },
    {
      gstin: "08BBBCD1234B1Z2",
      companyName: "SuperTech Innovations",
      address: "Sector 18 Tech Hub",
      address2: "Plot No. 34",
      postalCode: "110045",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      phone: "+91 9876543210",
    },
    {
      gstin: "09XYZC7890A1Z5",
      companyName: "GreenField Agro",
      address: "NH-24 Agro Zone",
      address2: "Warehouse No. 5",
      postalCode: "122001",
      city: "Gurgaon",
      state: "Haryana",
      country: "India",
      phone: "+91 9988776655",
    },
    {
      gstin: "10ABCDX3210C1Z9",
      companyName: "PixelMatrix Designs",
      address: "Creative Studio Block A",
      address2: "2nd Floor, IT Tower",
      postalCode: "500081",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      phone: "+91 9123456789",
    },
  ]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    gstin: "",
    companyName: "",
    address: "",
    address2: "",
    postalCode: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });

  const openEditModal = (company, index) => {
    setEditData(company);
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = () => {
    const updated = [...companies];
    updated[editIndex] = editData;
    setCompanies(updated);
    setShowEditModal(false);
  };

  const handleAddNew = () => {
    const allFilled = Object.values(newCompany).every(
      (value) => value.trim() !== ""
    );
    if (!allFilled) {
      alert("Please fill in all fields before adding.");
      return;
    }

    setCompanies([...companies, newCompany]);
    setNewCompany({
      gstin: "",
      companyName: "",
      address: "",
      address2: "",
      postalCode: "",
      city: "",
      state: "",
      country: "",
      phone: "",
    });
    setShowAddModal(false);
  };

  return (
    <UserProfileLayout>
      <div className="manage-profile-container">
        <div className="manageProfileFrm">
          <div className="manageProfileFrmBoxHr">
            <h3>Basic Info</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form class="manage-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your full name" />
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" placeholder="Enter company name" />
                </div>

                <div className="form-group">
                  <label>Aadhar Number</label>
                  <input type="text" placeholder="Enter Aadhar number" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" placeholder="Enter phone number" />
                </div>

                <div className="form-group">
                  <label>GSTIN</label>
                  <input type="text" placeholder="Enter GSTIN" />
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
                      {fileName || "Select your file!"}
                    </span>

                    <label className="custom-upload-btn">
                      Choose file
                      <input type="file" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <button type="submit" className="form-submit">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
          <div className="manageProfileFrmBoxHr">
            <h3>Change Password</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form class="manage-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Password</label>
                  <input type="password" placeholder="Enter your password" />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Enter confirm password" />
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="form-submit form-submit-Update"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="manageProfileFrmBoxHr">
            <h3>Change your Email</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form class="manage-profile-form">
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
                    <button onClick={handleVerify}>Verify</button>
                  </div>
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="form-submit form-submit-Update"
                  >
                    Update Email
                  </button>
                </div>
                <div className="form-group blanksBox"></div>
              </div>
            </form>
          </div>
          <div className="manageProfileFrmBoxHr">
            <h3>Active to order your OWN brand</h3>
          </div>
          <div className="manageProfileFrmBoxInner">
            <form class="manage-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Send Request</label>
                  <div className="ShowEntries-dropdown" ref={dropdownRef}>
                    {/* ⬇️ Custom Dropdown */}
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
          </div>

          <div className="company-section">
            <h3>Your Company Details</h3>

            <div className="company-grid">
              {companies.map((company, index) => (
                <div
                  key={index}
                  className={`company-card ${
                    selectedIndex === index ? "selected" : ""
                  }`}
                >
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="company"
                      checked={selectedIndex === index}
                      onChange={() => setSelectedIndex(index)}
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
                      <strong>Country:</strong> {company.country}
                    </p>
                    <p>
                      <strong>Phone:</strong> {company.phone}
                    </p>
                  </div>

                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(company, index)}
                  >
                    <img src={Edit} alt="Edit" />
                  </button>
                </div>
              ))}
            </div>

            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              Add New Address <span>+</span>
            </button>

            {/* EDIT MODAL */}
            {showEditModal && (
              <div className="modal-overlay">
                <div className="modal-box">
                  <h3>Edit Company Details</h3>
                  {Object.keys(editData).map((key) => (
                    <input
                      key={key}
                      name={key}
                      value={editData[key]}
                      onChange={handleEditChange}
                      placeholder={key}
                    />
                  ))}
                  <div className="modal-actions">
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ADD MODAL */}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal-box">
                  <h3>Add New Company</h3>
                  {Object.keys(newCompany).map((key) => (
                    <input
                      key={key}
                      name={key}
                      value={newCompany[key]}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          [e.target.name]: e.target.value,
                        })
                      }
                      placeholder={key}
                      className={newCompany[key].trim() === "" ? "error" : ""}
                    />
                  ))}
                  <div className="modal-actions">
                    <button onClick={handleAddNew}>Add</button>
                    <button onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ManageProfile;
