import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";
import DownloadBtn from "../assets/icons/top-heading.svg";
import View from "../assets/icons/View.svg";
import SaveLater from "../assets/icons/SaveLater.svg";
import Option from "../assets/icons/Option.svg";

import Bigtick from "../assets/icons/Bigtick.svg";
import Modal from "../components/Modal";

const WarrentyClaimHistory = () => {
  const [fileName, setFileName] = useState("");
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

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

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="order-details">
          <div className="orderdetailsHr">
            <div className="orderdetailsHrLft">
              <h2>Warrenty Claim History</h2>
            </div>

            <div className="orderdetailsHrRgt">
              <button className="invoice-btn">
                <img src={DownloadBtn} alt="Download" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="order-table-container statement-table-container">
            <table className="order-table statement-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ticket Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Date">31-07-2024</td>
                  <td data-label="Ticket Number">
                    <Link to="/" className="order-link">
                      MZW00000001
                    </Link>
                  </td>
                  <td data-label="Status">Sended to warehouse</td>

                  <td data-label="Action" className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="Logo" />
                    </button>
                    <button className="ordertbl-icon-btn repeat" title="Repeat">
                      <img src={SaveLater} alt="Logo" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td data-label="Date">31-07-2024</td>
                  <td data-label="Ticket Number">
                    <Link to="/" className="order-link">
                      MZW00000001
                    </Link>
                  </td>
                  <td data-label="Status">Sended to warehouse</td>

                  <td data-label="Action" className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="Logo" />
                    </button>
                    <button className="ordertbl-icon-btn repeat" title="Repeat">
                      <img src={SaveLater} alt="Logo" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td data-label="Date">20-09-2025</td>
                  <td data-label="Ticket Number">
                    <Link to="/" className="order-link">
                      MZW00000003
                    </Link>
                  </td>
                  <td data-label="Status">
                    Pending for courier details upload
                  </td>

                  <td data-label="Action" className="actions">
                    <button
                      className="ordertbl-icon-btn repeat"
                      title="Repeat"
                      onClick={() => setShowTicketModal(true)}
                    >
                      <img src={Option} alt="Logo" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
                <h3 className="modal-title">Create a Ticket</h3>

                <div className="manageProfileFrmBoxInner">
                  <form class="manage-profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>File (PDF / Image)</label>
                        <div
                          className={`file-upload-box ${
                            isFocused ? "focused" : ""
                          }`}
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
                        <span
                          style={{
                            color: "#FF383C80",
                            width: "100%",
                            display: "block",
                            textAlign: "right",
                            paddingTop: "5px",
                            fontSize: "12px",
                          }}
                        >
                          Max 5 MB
                        </span>
                      </div>

                      <div className="form-group">
                        <label>Courier Name</label>
                        <input type="text" placeholder="Enter your subject" />
                      </div>

                      <div className="form-group">
                        <label>Consignment No</label>
                        <input type="text" placeholder="Enter your subject" />
                      </div>
                    </div>

                    <div className="form-row">
                      <button type="submit" className="form-submit">
                        Upload
                      </button>
                    </div>
                  </form>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default WarrentyClaimHistory;
