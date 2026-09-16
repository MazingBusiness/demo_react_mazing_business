import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserProfileLayout from "../../layouts/UserProfileLayout";

import View from "../../assets/icons/View.svg";
import Man from "../../assets/images/man.png";
import Ticket from "../../assets/images/ticket.png";
import Plusicon from "../../assets/icons/plusicon.svg";
import Bigtick from "../../assets/icons/Bigtick.svg";
import Modal from "../../components/Modal";
import { addSuportTickets, getSupportTickets } from "../../api/apiRequest";

const ProfileSupportTicket = () => {
  const [fileName, setFileName] = useState("");
  const [ticketPhoto, setTicketPhoto] = useState(null);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshTicketsKey, setRefreshTicketsKey] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketError, setTicketError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    const loadTickets = async () => {
      setLoadingTickets(true);
      setTicketError("");

      try {
        const response = await getSupportTickets(currentPage);
        const paginator = response?.data ?? {};
        const list = paginator?.data ?? (Array.isArray(paginator) ? paginator : []);

        setTickets(Array.isArray(list) ? list : []);
        setLastPage(Number(paginator?.last_page) || 1);
      } catch (error) {
        setTickets([]);
        setTicketError(error?.message || "Unable to load support tickets.");
      } finally {
        setLoadingTickets(false);
      }
    };

    loadTickets();
  }, [currentPage, refreshTicketsKey]);

  const formatTicketDate = (value) => {
    if (!value) return "-";
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatus = (status) => {
    const value = String(status ?? "Pending").toLowerCase();
    return {
      label: value.charAt(0).toUpperCase() + value.slice(1),
      className: ["closed", "resolved", "solved"].includes(value)
        ? "delivered"
        : "pending",
    };
  };

  const handleTicketFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmittingTicket(true);

    try {
      const response = await addSuportTickets({ subject, details, photo: ticketPhoto });
      setSuccessMessage(response?.msg || "Support ticket submitted successfully.");
      setTicketSubmitted(true);
      setSubject("");
      setDetails("");
      setTicketPhoto(null);
      setFileName("");

      if (currentPage === 1) {
        setRefreshTicketsKey((key) => key + 1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      setSubmitError(error?.message || "Unable to submit support ticket.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setTicketPhoto(e.target.files[0]);
    }
    setIsFocused(false); // remove focus after file selection
  };

  return (
    <UserProfileLayout>
      <div>
        {/* Header section */}
        <div className="tickets-hr">
          {/* <div className="tickets-hrLft">
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
          </div> */}
          <button
            className="download-pdf-btn"
            type="button"
            onClick={() => {
              setTicketSubmitted(false);
              setSubmitError("");
              setSuccessMessage("");
              setShowTicketModal(true);
            }}
          >
            Create a ticket
          </button>
          
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
                {loadingTickets && (
                  <tr><td colSpan="5">Loading tickets…</td></tr>
                )}
                {!loadingTickets && ticketError && (
                  <tr><td colSpan="5">{ticketError}</td></tr>
                )}
                {!loadingTickets && !ticketError && tickets.length === 0 && (
                  <tr><td colSpan="5">No support tickets found.</td></tr>
                )}
                {!loadingTickets && !ticketError && tickets.map((ticket) => {
                  const status = getStatus(ticket.status);
                  return (
                    <tr key={ticket.id}>
                      <td>
                        <Link to="/ticket-details" state={{ ticket }} className="order-link">
                          #{ticket.code || ticket.id}
                        </Link>
                      </td>
                      <td>{formatTicketDate(ticket.created_at)}</td>
                      <td>{ticket.subject || "-"}</td>
                      <td>
                        <span className={`status-badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="actions">
                        <Link to="/ticket-details" state={{ ticket }} className="ordertbl-icon-btn view" title="View">
                          <img src={View} alt="View" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {lastPage > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={currentPage === 1 || loadingTickets}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>
              <span>Page {currentPage} of {lastPage}</span>
              <button
                type="button"
                disabled={currentPage === lastPage || loadingTickets}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Ticket Modal */}
        <Modal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setTicketSubmitted(false);
          }}
          showFooter={false}
          size="xlg"
          className={`support-ticket-modal ${ticketSubmitted ? "support-ticket-modal-success" : ""}`}
        >
          <div className={`ba-modal-wpap ${ticketSubmitted ? "ticket-success" : "ticket-form-only"}`}>
            <div className="ba-modal-Lft">
              <form className="ba-modal-form manage-profile-form" onSubmit={handleTicketFormSubmit}>
                <h3 className="modal-title">Create a Ticket</h3>
                <div className="manageProfileFrmBoxInner">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        placeholder="Enter your subject"
                        maxLength={255}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Provide a Detailed Description</label>
                      <textarea
                        value={details}
                        onChange={(event) => setDetails(event.target.value)}
                        placeholder="Write your description"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Photo</label>
                      <div
                        className={`file-upload-box ${isFocused ? "focused" : ""}`}
                        onClick={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        tabIndex={0}
                      >
                        <span className={`file-status ${fileName ? "uploaded" : "placeholder"}`}>
                          {fileName || "Select your file!"}
                        </span>

                        <label className="custom-upload-btn">
                          Choose file
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {submitError && <p className="form-error">{submitError}</p>}

                  <div className="form-row">
                    <button type="submit" className="form-submit" disabled={submittingTicket}>
                      {submittingTicket ? "Sending..." : "Send Ticket"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {ticketSubmitted && (
              <div className="ba-modal-Rgt">
                <h5>
                  {successMessage} Thank you for reaching out to us.
                </h5>
                <img src={Bigtick} alt="Success" />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileSupportTicket;
