import React, { useState, useRef, useEffect } from "react";
import View from "../../assets/icons/View.svg";
import SaveLater from "../../assets/icons/SaveLater.svg";
import Delete from "../../assets/icons/Delete.svg";
import { useNavigate, Link } from "react-router-dom";
import { FiChevronDown, FiCheck } from "react-icons/fi";

const OrderTable = () => {
  const [selectedEntries, setSelectedEntries] = useState("5");
  const entriesOptions = ["5", "10", "25", "50"];
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

  return (
    <div className="order-table-wrapper">
      {/* Header */}
      <div className="order-table-hr">
        <div className="order-table-hrLft">
          <h2>Purchase History</h2>
        </div>

        <div className="order-table-hrRgt">
          {/* ⬇️ Custom Dropdown */}
          <div className="ShowEntries-dropdown" ref={dropdownRef}>
            <label>Showing:</label>

            <div className="show-dropdown-container">
              <div
                className="show-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedEntries}
                <FiChevronDown
                  className={`show-arrow-icon ${
                    dropdownOpen ? "show-rotate" : ""
                  }`}
                />
              </div>

              <ul
                className={`show-dropdown-menu ${dropdownOpen ? "open" : ""}`}
              >
                {entriesOptions.length === 0 ? (
                  <li className="show-no-data">No Data</li>
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
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Delivery Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link to="/profileOrderDetails" className="order-link">
                  20250610-14033430
                </Link>
              </td>
              <td>10-06-2025</td>
              <td>₹7440.00</td>
              <td>
                <span className="status-badge pending">Pending</span>
              </td>
              <td className="actions">
                <button className="ordertbl-icon-btn view" title="View">
                  <img src={View} alt="Logo" />
                </button>
                <button className="ordertbl-icon-btn repeat" title="Repeat">
                  <img src={SaveLater} alt="Logo" />
                </button>
                <button className="ordertbl-icon-btn delete" title="Delete">
                  <img src={Delete} alt="Logo" />
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <Link to="/profileOrderDetails" className="order-link">
                  20250610-14033430
                </Link>
              </td>
              <td>10-06-2025</td>
              <td>₹7440.00</td>
              <td>
                <span className="status-badge delivered ">Delivered </span>
              </td>
              <td className="actions">
                <button className="ordertbl-icon-btn view" title="View">
                  <img src={View} alt="Logo" />
                </button>
                <button className="ordertbl-icon-btn repeat" title="Repeat">
                  <img src={SaveLater} alt="Logo" />
                </button>
                <button className="ordertbl-icon-btn delete" title="Delete">
                  <img src={Delete} alt="Logo" />
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <Link to="/profileOrderDetails" className="order-link">
                  20250610-14033430
                </Link>
              </td>
              <td>10-06-2025</td>
              <td>₹7440.00</td>
              <td>
                <span className="status-badge cancelled">Cancelled</span>
              </td>
              <td className="actions">
                <button className="ordertbl-icon-btn view" title="View">
                  <img src={View} alt="Logo" />
                </button>
                <button className="ordertbl-icon-btn repeat" title="Repeat">
                  <img src={SaveLater} alt="Logo" />
                </button>
                <button className="ordertbl-icon-btn delete" title="Delete">
                  <img src={Delete} alt="Logo" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination (Static) */}
      <div className="pagination-wrapper">
        <button className="pagination-btn nav disabled">Previous</button>
        <button className="pagination-btn active">1</button>
        <button className="pagination-btn">2</button>
        <span className="pagination-btn dots">...</span>
        <button className="pagination-btn">4</button>
        <button className="pagination-btn">5</button>
        <button className="pagination-btn nav">Next</button>
      </div>
    </div>
  );
};

export default OrderTable;
