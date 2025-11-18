import React, { useRef, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import Paycust from "../../assets/icons/paycust.svg";
import DownloadCloud from "../../assets/icons/DownloadCloud.svg";
import WhatsButton from "../../assets/icons/WhatsButton.svg";
import calendarIcon from "../../assets/icons/calendar-icon.svg";
import RefreshIcon from "../../assets/icons/refresh-btn-Icon.svg";

const ProfileStatementDetails = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const handleRefresh = () => {
    setFromDate("");
    setToDate("");
  };
  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="breadcrumb">
              <Link to="/profileStatement">
                <IoIosArrowBack />
                My Statement
              </Link>
              / Party Code: <span>OPEL0100087</span>
            </div>
          </div>

          <div className="orderdetailsHrRgt">
            <button className="invoice-btn">
              <img src={Paycust} alt="paycust" />
            </button>
            <button className="invoice-btn">
              <img src={DownloadCloud} alt="User" />
            </button>
            <button className="invoice-btn">
              <img src={WhatsButton} alt="User" />
            </button>
          </div>
        </div>

        <div className="statement-table-filters">
          <div className="date-filters">
            {/* From Date */}
            <div
              className={`date-input-wrapper ${fromDate ? "filled" : ""}`}
              onClick={() => fromInputRef.current?.showPicker()}
            >
              <input
                type="date"
                id="fromDate"
                ref={fromInputRef}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  // Clear toDate if it becomes invalid
                  if (toDate && new Date(e.target.value) > new Date(toDate)) {
                    setToDate("");
                  }
                }}
              />
              {!fromDate && <span className="date-placeholder">From Date</span>}
              <span className="calendar-icon">
                <img src={calendarIcon} alt="calendar" />
              </span>
            </div>

            {/* To Date */}
            <div
              className={`date-input-wrapper ${toDate ? "filled" : ""}`}
              onClick={() => toInputRef.current?.showPicker()}
            >
              <input
                type="date"
                id="toDate"
                ref={toInputRef}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || ""}
              />
              {!toDate && <span className="date-placeholder">To Date</span>}
              <span className="calendar-icon">
                <img src={calendarIcon} alt="calendar" />
              </span>
            </div>

            <button className="search-btn">Search</button>
          </div>

          <button className="refresh-btn" onClick={handleRefresh}>
            <img src={RefreshIcon} alt="RefreshIcon" />
          </button>
        </div>

        <div className="order-table-hr">
          <div className="order-table-hrLft">
            <h2>Statement</h2>
          </div>
        </div>

        {/* Table */}
        <div className="order-table-container statement-table-container">
          <table className="order-table statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th>Txn No</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
                <th>Dr / Cr</th>
                <th>Overdue By Day</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>31-07-2024</td>
                <td>SALES (Partial Overdue)</td>
                <td>DEL/0001/24-25</td>
                <td>
                  <span className="red">₹ 1,606</span>
                </td>
                <td>₹ 0</td>
                <td>₹ 1,606</td>
                <td>
                  <span className="dr">Dr</span>
                </td>
                <td>302 Days</td>
              </tr>
              <tr>
                <td>31-07-2024</td>
                <td>SALES (Overdue)</td>
                <td>DEL/0001/24-25</td>
                <td className="red">
                  <span className="red">₹ 8,340</span>
                </td>
                <td>₹ 0</td>
                <td>₹ 9,946</td>
                <td>
                  <span className="dr">Dr</span>
                </td>
                <td>302 Days</td>
              </tr>
              <tr>
                <td>31-07-2024</td>
                <td>CREDIT NOTE (DISCOUNT)</td>
                <td>CN/0002/24-25</td>
                <td>₹ 0</td>
                <td>₹ 1,600</td>
                <td>₹ 1,600</td>
                <td>
                  <span className="cr">Cr</span>
                </td>
                <td>0 Days</td>
              </tr>
              <tr className="total-row">
                <td colSpan="3">Total</td>
                <td>₹ 18,286</td>
                <td>₹ 1,600</td>
                <td colSpan="3"></td>
              </tr>
              <tr className="total-row">
                <td colSpan="3">Closing Balance</td>
                <td>₹ 0</td>
                <td>₹ 18,286</td>
                <td colSpan="3"></td>
              </tr>
              <tr className="total-row">
                <td colSpan="3">Grand Total</td>
                <td>₹ 18,286</td>
                <td>₹ 18,286</td>
                <td colSpan="3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileStatementDetails;
