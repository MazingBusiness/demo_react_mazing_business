import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserProfileLayout from "../../layouts/UserProfileLayout";

import View from "../../assets/icons/View.svg";
import Man from "../../assets/images/man.png";
import Ticket from "../../assets/images/ticket.png";
import Plusicon from "../../assets/icons/plusicon.svg";
import Bigtick from "../../assets/icons/Bigtick.svg";
import Modal from "../../components/Modal";

const ProfileSupportTicket = () => {
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
    <UserProfileLayout>
      <div>
        {/* Header section */}
        <div className="tickets-hr">
          <div className="tickets-hrLft">
            <div className="tickets-hrLft-info">
              <h4>Connect with</h4>
              <h4>Jhone Doe</h4>
              <Link to="/" className="tickets-hrLft-info-btn">
                <span>Call Now</span> +91 1234567890
              </Link>
            </div>
            <div className="tickets-hrLft-info-img">
              <img src={Man} alt="man" />
            </div>
          </div>

          <div className="tickets-hrRgt">
            <div className="tickets-hrRgt-info">
              <div
                className="tickets-hrRgt-info-btn"
                onClick={() => setShowTicketModal(true)}
              >
                <span>Create a</span>Ticket
                <img src={Plusicon} alt="plusicon" />
              </div>
            </div>
            <div className="tickets-hrRgt-info-img">
              <img src={Ticket} alt="ticket" />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="order-table-wrapper">
          <div className="order-table-hr">
            <div className="order-table-hrLft">
              <h2>Tickets</h2>
            </div>
          </div>

          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Sending Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Link to="/ticketDetails" className="order-link">
                      #10000003
                    </Link>
                  </td>
                  <td>
                    2025-03-31 <span>14:01:20</span>
                  </td>
                  <td>Request for Bulk Order Pricing and Availability</td>
                  <td>
                    <span className="status-badge pending">Pending</span>
                  </td>
                  <td className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="View" />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <Link to="/ticketDetails" className="order-link">
                      #10000004
                    </Link>
                  </td>
                  <td>
                    2025-03-31 <span>14:01:20</span>
                  </td>
                  <td>Request for Product Stock</td>
                  <td>
                    <span className="status-badge delivered">Closed</span>
                  </td>
                  <td className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="View" />
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
          size="xlg"
        >
          <div className="ba-modal-wpap">
            <div className="ba-modal-Lft">
              <form className="ba-modal-form" onSubmit={handleTicketFormSubmit}>
                <h3 className="modal-title">Create a Ticket</h3>

                <div className="manageProfileFrmBoxInner">
                  <form class="manage-profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject</label>
                        <input type="text" placeholder="Enter your subject" />
                      </div>

                      <div className="form-group">
                        <label>Provide a Detailed Description</label>
                        <textarea placeholder="Write your description"></textarea>
                      </div>

                      <div className="form-group">
                        <label>Photo</label>
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
                      </div>
                    </div>

                    <div className="form-row">
                      <button type="submit" className="form-submit">
                        Send Ticket
                      </button>
                    </div>
                  </form>
                </div>
              </form>
            </div>

            <div className="ba-modal-Rgt">
              <h5>
                Thank you for successfully raising your ticket. We appreciate
                you reaching out to us.
              </h5>

              <img src={Bigtick} alt="Bigtick" />
            </div>
          </div>
        </Modal>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileSupportTicket;
