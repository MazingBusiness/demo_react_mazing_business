import React, { useRef, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { useNavigate, Link } from "react-router-dom";
import DownloadBtn from "../../assets/icons/DownloadBtn.svg";
import WhatsButton from "../../assets/icons/WhatsButton.svg";

const ProfileRewards = () => {
  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <h2>My Rewards</h2>
          </div>

          <div className="orderdetailsHrRgt">
            <button className="invoice-btn">
              <img src={DownloadBtn} alt="paycust" />
            </button>

            <button className="invoice-btn">
              <img src={WhatsButton} alt="User" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="order-table-container statement-table-container">
          <table className="order-table statement-table">
            <thead>
              <tr>
                <th>Txn No</th>
                <th>Rewards From</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
                <th>Dr / Cr</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link to="/" className="order-link">
                    20250610014033430
                  </Link>
                </td>
                <td>MANUAL</td>
                <td>₹ 30.0</td>

                <td>₹ 0.0</td>
                <td>₹ 30.0</td>
                <td>
                  <span className="dr">Debit</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link to="/" className="order-link">
                    20250610014033430
                  </Link>
                </td>
                <td>MANUAL</td>
                <td>₹ 30.0</td>

                <td>₹ 0.0</td>
                <td>₹ 30.0</td>
                <td>
                  <span className="dr">Debit</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link to="/" className="order-link">
                    20250610014033430
                  </Link>
                </td>
                <td>OFFER</td>
                <td>₹ 0.0</td>
                <td>₹ 500.0</td>
                <td>₹ 500.0</td>

                <td>
                  <span className="cr">Credit</span>
                </td>
              </tr>
              <tr className="total-row">
                <td colSpan="2">Total</td>
                <td>₹ 75030.0</td>
                <td>₹ 500.0</td>
                <td>₹ 7030.0</td>
                <td colSpan="2"></td>
              </tr>
              <tr className="total-row">
                <td colSpan="2">Closing Balance</td>
                <td>₹ 75030.0</td>

                <td colSpan="3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileRewards;
