import React from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import View from "../../assets/icons/View.svg";
import SaveLater from "../../assets/icons/SaveLater.svg";
import Delete from "../../assets/icons/Delete.svg";
import { useNavigate, Link } from "react-router-dom";

const ProfileStatement = () => {
  return (
    <UserProfileLayout>
      <div>
        <div className="statementHr">
          <div className="statementpaybox">
            <div className="statementpayboxInfo">
              <h2>₹ 9,846 Dr</h2>
              <p>Due Balance</p>
            </div>
            <button className="PayNowBtn">Pay Now</button>
          </div>
          <div className="statementpaybox">
            <div className="statementpayboxInfo">
              <h2>₹ 9,846 Dr</h2>
              <p>Due Balance</p>
            </div>
            <button className="PayNowBtn">Pay Now</button>
          </div>
        </div>

        <div className="statementTable">
          <div className="order-table-hr">
            <div className="order-table-hrLft">
              <h2>Statement</h2>
            </div>
          </div>

          {/* Table */}
          <div className="order-table-container statement-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Party Name</th>
                  <th>Party Code</th>
                  <th>Ledger Code</th>
                  <th>GST No</th>

                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Link to="/profileStatementDetails" className="order-link">
                      20250610-14033430
                    </Link>
                  </td>
                  <td>Mazing Retail Private Limited</td>
                  <td>OPEL0100087</td>
                  <td>The Mazing Store OPEL0100087</td>
                  <td>07AAOCM7588A1Z3</td>

                  <td className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="view" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Link to="/profileStatementDetails" className="order-link">
                      20250610-14033430
                    </Link>
                  </td>
                  <td>Mazing Retail Private Limited</td>
                  <td>OPEL0100087</td>
                  <td>The Mazing Store OPEL0100087</td>
                  <td>07AAOCM7588A1Z3</td>

                  <td className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="view" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Link to="/profileStatementDetails" className="order-link">
                      20250610-14033430
                    </Link>
                  </td>
                  <td>Mazing Retail Private Limited</td>
                  <td>OPEL0100087</td>
                  <td>The Mazing Store OPEL0100087</td>
                  <td>07AAOCM7588A1Z3</td>

                  <td className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="view" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Link to="/profileStatementDetails" className="order-link">
                      20250610-14033430
                    </Link>
                  </td>
                  <td>Mazing Retail Private Limited</td>
                  <td>OPEL0100087</td>
                  <td>The Mazing Store OPEL0100087</td>
                  <td>07AAOCM7588A1Z3</td>

                  <td className="actions">
                    <button className="ordertbl-icon-btn view" title="View">
                      <img src={View} alt="view" />
                    </button>
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

export default ProfileStatement;
