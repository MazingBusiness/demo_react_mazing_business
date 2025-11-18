import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserProfileLayout from "../../layouts/UserProfileLayout";

import View from "../../assets/icons/View.svg";
import Wallet from "../../assets/images/Wallet.svg";
import Ticket from "../../assets/images/ticket.png";
import Plusicon from "../../assets/icons/plusicon.svg";
import Bigtick from "../../assets/icons/Bigtick.svg";
import Modal from "../../components/Modal";

const ProfileWallet = () => {
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
        <div className="tickets-hr Wallet-hr">
          <div className="tickets-hrLft">
            <div className="tickets-hrLft-info ">
              <h4>Your Wallet</h4>
              <h4>Balance</h4>
              <div className="tickets-hrLft-info-btn">
                <span>Total</span>₹ 7000.00
              </div>
            </div>
            <div className="tickets-hrLft-info-img">
              <img src={Wallet} alt="Wallet" />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="order-table-wrapper">
          <div className="order-table-hr">
            <div className="order-table-hrLft">
              <h2>Wallet Recharge History</h2>
            </div>
          </div>

          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>01</td>
                  <td>10-06-2025</td>
                  <td>₹ 7000.0</td>
                  <td>Online</td>
                  <td>
                    <span className="status-badge pending">Pending</span>
                  </td>
                </tr>

                <tr>
                  <td>01</td>
                  <td>10-06-2025</td>
                  <td>₹ 5000.0</td>
                  <td>Online</td>
                  <td>
                    <span className="status-badge delivered">Approved</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileWallet;
