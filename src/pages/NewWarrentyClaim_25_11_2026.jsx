import React, { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiCheck, FiTrash2, FiPlus, FiX } from "react-icons/fi";

import product1 from "../assets/images/Image.png";

import { FiChevronDown } from "react-icons/fi";

import Modal from "../components/Modal";

import { useNavigate, Link } from "react-router-dom";

const NewWarrentyClaim = () => {
  const [fileName, setFileName] = useState("");
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
    if (e.target.files.length > 0) setFileName(e.target.files[0].name);
    setIsFocused(false);
  };

  const handleTicketFormSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket form submitted!");
    setShowTicketModal(false);
  };

  // PRODUCT LIST
  const [productList, setProductList] = useState([
    {
      id: 1,
      title: "OPEL SELECT 5232 - 4” MARBLE CUTTER (1650WATTS)",
      partNo: "MZ32886",
      warranty: "6 months",
      desc: "Lorem Ipsum, giving on its...",
      image: product1,
    },
  ]);

  // WARRANTY ITEMS
  const [warrantyItems, setWarrantyItems] = useState([
    {
      id: 101,
      title: "OPEL SELECT 5232 - ARMATURE",
      partNo: "MZ23913",
      image: product1,
      selected: true,
    },
    {
      id: 102,
      title: "OPEL SELECT 5232 - ARMATURE",
      partNo: "MZ23913",
      image: product1,
      selected: false,
    },
  ]);

  const toggleWarranty = (id) => {
    setWarrantyItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/WarrentyClaimFull"); // Replace with your actual route
  };

  // ADD PRODUCT MODAL
  const [showTicketModal, setShowTicketModal] = useState(false);

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="manageProfileFrm">
          {/* ---------------- BASIC DETAILS SECTION ---------------- */}
          <div className="manageProfileFrmBoxInner">
            <form className="manage-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your full name" />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" placeholder="Enter phone number" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="text" placeholder="Enter email" />
                </div>

                <div className="form-group">
                  <label>Aadhar Number</label>
                  <input type="text" placeholder="Enter Aadhar number" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <textarea placeholder="Enter Your Address"></textarea>
                </div>

                <div className="form-group">
                  <label>Address2</label>
                  <textarea placeholder="Enter Your Address"></textarea>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="Enter City" />
                </div>

                <div className="form-group">
                  <label>Pin Code</label>
                  <input type="text" placeholder="Enter Pin Code" />
                </div>
              </div>
            </form>
          </div>

          <div className="manageProfileFrmBoxHr"></div>

          {/* ---------------- INVOICE SECTION ---------------- */}
          <div className="manageProfileFrmBoxInner">
            <form className="manage-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Bar Code</label>
                  <input type="text" placeholder="Enter Bar Code" />
                </div>

                <div className="form-group">
                  <label>Invoice No</label>
                  <input type="text" placeholder="Enter Invoice No" />
                </div>

                <div className="form-group">
                  <label>Purchase Date</label>
                  <input type="date" />
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    className="form-submit form-submit-Update dle"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* FILE UPLOADS */}
              <div className="form-row">
                <div className="form-group">
                  <label>Upload Invoice</label>
                  <div
                    className={`file-upload-box ${isFocused ? "focused" : ""}`}
                    tabIndex={0}
                    onClick={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
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

                <div className="form-group">
                  <label>Upload Warranty Card</label>
                  <div className="file-upload-box" tabIndex={0}>
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

              <div className="form-row newprow">
                <div className="form-rowLft">
                  <h3 className="section-title">Product Details</h3>

                  <div className="warranty-product-grid">
                    {productList.map((p) => (
                      <div key={p.id} className="warranty-product-card">
                        <div className="warranty-product-img">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-product.jpg";
                              }}
                            />
                          ) : (
                            <div className="warranty-image-placeholder">
                              <span>No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="product-info">
                          <h4>{p.title}</h4>
                          <p>
                            <strong>Part No:</strong> {p.partNo}
                          </p>
                          <p>
                            <strong>Warranty Duration:</strong> {p.warranty}
                          </p>
                          <p>{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-rowRgt">
                  <h3 className="section-title">Covered in warranty</h3>
                  <div className="warranty-grid">
                    {warrantyItems.map((item) => (
                      <div
                        key={item.id}
                        className={`warranty-card ${
                          item.selected ? "active" : ""
                        }`}
                        onClick={() => toggleWarranty(item.id)}
                      >
                        <img src={item.image} className="warranty-img" alt="" />

                        <div className="warranty-info">
                          <h4>{item.partNo}</h4>
                          <p>{item.title}</p>
                        </div>

                        {item.selected && (
                          <div className="checkmark">
                            <FiCheck />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ---------------- COVERED IN WARRANTY SECTION ---------------- */}
          <div className="manageProfileFrmBoxInner add-product-btnbox">
            <button
              type="button"
              className="add-product-btn"
              onClick={() => setShowTicketModal(true)}
            >
              <FiPlus /> Add More Product
            </button>
          </div>

          {/* ---------------- TERMS + SUBMIT ---------------- */}
          <div className="form-row terms-row">
            <label>
              {" "}
              <input type="checkbox" />
              Check Terms and Condition
            </label>
          </div>

          <div className="form-row">
            <button
              type="submit"
              className="form-submit submit-btn"
              onClick={handleLoginClick}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- PRODUCT ADD MODAL ---------------- */}
      {/* Ticket Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        showFooter={false}
        size="md"
        className=" warrentyModal"
      >
        <div className="ba-modal-wpap">
          <div className="ba-modal-Lft" style={{ width: "100%" }}>
            <form className="ba-modal-form" onSubmit={handleTicketFormSubmit}>
              <h3 className="modal-title">
                Select Preferred Warehouse For Shipping
              </h3>

              <div className="manageProfileFrmBoxInner manageProfileFrm">
                <form class="manage-profile-form" style={{ padding: "0" }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Warehouse</label>
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
                                      selectedEntries === option
                                        ? "selected"
                                        : ""
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
                  </div>

                  <div className="form-row">
                    <button
                      type="submit"
                      className="form-submit"
                      style={{ width: "200px" }}
                    >
                      Use This Warehouse
                    </button>
                  </div>
                </form>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default NewWarrentyClaim;
