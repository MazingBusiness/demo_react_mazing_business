import React from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import InvoiceBtn from "../../assets/icons/InvoiceBtn.svg";

const ProfileOrderDetails = () => {
  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="breadcrumb">
              <Link to="/profileOrder">
                <IoIosArrowBack />
                Purchase History
              </Link>
              / Order Id: <span>20250610-14033430</span>
            </div>
          </div>

          <div className="orderdetailsHrRgt">
            <button className="invoice-btn">
              <img src={InvoiceBtn} alt="User" />
            </button>
          </div>
        </div>

        <div className="order-section">
          <h3>Order Details</h3>
          <table className="order-table">
            <thead>
              <tr>
                <th>SL No</th>
                <th>Product</th>
                <th>Part No</th>
                <th>Order Quantity</th>
                <th>Approved Quantity</th>
                <th>Rate</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01</td>
                <td>OPEL 5332 - ELECTRIC BLOWER 600WATTS</td>
                <td>MZ11018</td>
                <td>10</td>
                <td>08</td>
                <td>₹ 300.0</td>
                <td>₹ 2,400.0</td>
                <td>
                  <span className="status approved">Approved</span>
                </td>
              </tr>
              <tr>
                <td>02</td>
                <td>KOBMAX ELECTRIC BLOWER 600W</td>
                <td>MZ32581</td>
                <td>10</td>
                <td>08</td>
                <td>₹ 300.0</td>
                <td>₹ 2,400.0</td>
                <td>
                  <span className="status pending">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="order-info-grid">
          <div className="order-info-gridLft">
            <div className="order-box">
              <h4>Order Summary</h4>
              <div className="order-box-inner">
                <p>
                  <strong>Order Code:</strong> 20241123–02412121
                </p>
                <p>
                  <strong>Customer:</strong> The Mzing Store
                </p>

                <p>
                  <strong>Shipping Address:</strong> Plot No. 123, Lane-4,
                  Jayadev Vihar, Bhubaneswar - 751013, Khordha District, Odisha,
                  India
                </p>

                <p>
                  <strong>Order Date:</strong> 23-11-2024 02:42 AM
                </p>
                <p>
                  <strong>Order status:</strong> Pending
                </p>
                <p>
                  <strong>Total Order Amount:</strong> ₹ 2,633
                </p>
              </div>
            </div>
            <div className="order-box">
              <h4>Order Amount</h4>
              <div className="order-box-inner amount-box">
                <p>
                  <label>Subtotal:</label>
                  <span>₹ 2,400.0</span>
                </p>
                <p>
                  <label>Shipping:</label>
                  <span>₹ 200.0</span>
                </p>
                <p>
                  <label>Tax:</label>
                  <span>₹ 40.0</span>
                </p>
                <p>
                  <label>Payment Discount:</label>
                  <span>₹ 0.0</span>
                </p>
                <p>
                  <label>Coupon:</label>
                  <span>₹ 0.0</span>
                </p>

                <p className="total-price">
                  <label>Total Amount:</label>
                  <span>₹ 3,000.0</span>
                </p>
              </div>
            </div>
          </div>

          <div className="order-info-gridRgt">
            <div className="order-box">
              <h4>Logistics Details</h4>
              <div className="order-box-inner">
                <p>
                  <strong>Shipping Provider:</strong> BlueDart Express
                </p>
                <p>
                  <strong>Tracking Number: </strong> BLUEDART-987654321
                </p>

                <p>
                  <strong>Current Status: </strong> In Transit
                </p>

                <p>
                  <strong>Shipping Milestones:</strong>
                </p>

                <div class="timeline">
                  <div class="milestone completed">
                    <div className="milestone-info">
                      <div class="milestone-title">Order Confirmed </div>
                      <div class="milestone-date">2024-11-23 14:30</div>
                    </div>

                    <div class="milestone-location">E-commerce warehouse</div>
                  </div>

                  <div class="milestone completed">
                    <div className="milestone-info">
                      <div class="milestone-title">Picked Up</div>
                      <div class="milestone-date">2024-11-23 18:00</div>
                    </div>

                    <div class="milestone-location">Pune, Maharashtra</div>
                  </div>

                  <div class="milestone completed">
                    <div className="milestone-info">
                      <div class="milestone-title">In Transit</div>
                      <div class="milestone-date">2024-11-24 09:15</div>
                    </div>

                    <div class="milestone-location">Mumbai, Maharashtra</div>
                  </div>

                  <div class="milestone completed laststatus">
                    <div className="milestone-info">
                      <div class="milestone-title">Reached Near Hub</div>
                      <div class="milestone-date">2024-11-25 02:45</div>
                    </div>

                    <div class="milestone-location">Bangalore, Karnataka</div>
                  </div>

                  <div class="milestone pending">
                    <div className="milestone-info">
                      <div class="milestone-title">Out for Delivery</div>
                      <div class="milestone-date">2024-11-25</div>
                    </div>

                    <div class="milestone-location">Pending</div>
                  </div>

                  <div class="milestone pending">
                    <div className="milestone-info">
                      <div class="milestone-title">Delivered</div>
                      <div class="milestone-date">2024-11-25</div>
                    </div>

                    <div class="milestone-location">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileOrderDetails;
