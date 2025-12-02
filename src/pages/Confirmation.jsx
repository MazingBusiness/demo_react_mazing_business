import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";

import cartllink1 from "../assets/icons/cartllink1a.svg";
import cartllink2 from "../assets/icons/cartllink2a.svg";
import cartllink3 from "../assets/icons/cartllink3a.svg";
import cartllink4 from "../assets/icons/cartllink4.svg";
import tickIcon from "../assets/icons/tickIcon.svg";
import PaidIcon from "../assets/icons/PaidIcon.svg";

const Confirmation = () => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();

  const handlegohome = () => {
    navigate("/home");
  };

  return (
    <div className="CartBody ConfirmationBody">
      <MainLayout>
        <div className="cart-panel-box">
          <div className="cart-wrapper">
            <div className="cart-left">
              <div className="cart-left-lft">
                <div className="cartLink">
                  <Link to="/cart" className="active">
                    <img src={cartllink1} alt="MenuIcon" /> Shopping Cart
                  </Link>
                  <Link to="/company" className="active">
                    <img src={cartllink2} alt="MenuIcon" /> Shipping Company
                  </Link>
                  <Link to="/payment" className="active">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
                  </Link>
                  <Link to="confirmation">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                </div>
              </div>

              <div className="cart-left-rgt">
                <div className="payment-container">
                  <div className="Order-info">
                    <div className="Order-info-lft">
                      <div className="Thank-info">
                        <img src={tickIcon} alt="MenuIcon" />
                        <h5>Thank You for Your Order!</h5>
                        <p>
                          A copy or your order summary has been sent to your
                          Mail
                        </p>
                      </div>
                    </div>

                    <div className="Order-info-rgt">
                      <h5>Payment Summary</h5>
                      <div className="bank-details">
                        <p>
                          <strong>Order Date:</strong> 23-11-2024 02:42 AM
                        </p>
                        <p>
                          <strong>Name: </strong> The Mazing Store
                        </p>
                        <p>
                          <strong>Email:</strong> mazing@email.com
                        </p>
                        <p>
                          <strong>Shipping Address: </strong> Plot No. 123,
                          Lane-4, Jayadev Vihar, Bhubaneswar - 751013, Khordha
                          District, Odisha, India
                        </p>
                        <p>
                          <strong>Order Status:</strong> Pending
                        </p>
                        <p>
                          <strong>Total Order Amount:</strong> ₹ 29,597
                        </p>
                        <p>
                          <strong>Shipping:</strong> Flat shipping rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pay-OrderDetails">
                  <h5>Order Details</h5>
                  <h4>
                    Order Code: <span>20241123-02421121</span>
                  </h4>
                  <div class="pay-OrderDetails-table">
                    {/* ✅ Mobile Summary Section */}
                    <div className="statement-summary-mobile">
                      <div className="summary-box">
                        <div>
                          <strong>Subtotal:</strong> ₹20,597
                        </div>
                        <div>
                          <strong>Shipping:</strong> ₹ 0.0
                        </div>
                        <div>
                          <strong>Tax:</strong> ₹ 0.0
                        </div>
                        <div>
                          <strong>Coupon Discount:</strong> ₹ 0.0
                        </div>
                        <div>
                          <strong>Total:</strong>{" "}
                          <span style={{ color: "#004d84" }}>₹20,597</span>
                        </div>
                      </div>
                    </div>

                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>S1 No.</th>
                          <th>Product</th>
                          <th>Variation</th>
                          <th>Quantity</th>
                          <th>Delivery Type</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-label="S1 No.">1</td>
                          <td data-label="Product">
                            Bosch Rexroth Hydraulic Pump
                          </td>
                          <td data-label="Variation">Variation</td>
                          <td data-label="Quantity">1</td>
                          <td data-label="Delivery Type">Carrier</td>
                          <td data-label="Price">₹15,800</td>
                        </tr>
                        <tr>
                          <td data-label="S1 No.">2</td>
                          <td data-label="Product">
                            Bosch Rexroth Hydraulic Pump
                          </td>
                          <td data-label="Variation">Variation</td>
                          <td data-label="Quantity">1</td>
                          <td data-label="Delivery Type">Carrier</td>
                          <td data-label="Price">₹15,800</td>
                        </tr>
                        <tr>
                          <td data-label="S1 No.">3</td>
                          <td data-label="Product">
                            Bosch Rexroth Hydraulic Pump
                          </td>
                          <td data-label="Variation">Variation</td>
                          <td data-label="Quantity">1</td>
                          <td data-label="Delivery Type">Carrier</td>
                          <td data-label="Price">₹15,800</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Subtotal</td>
                          <td></td>
                          <td>₹20,597</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Shipping</td>
                          <td></td>

                          <td>₹0.0</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Tax</td>
                          <td></td>

                          <td>₹0.0</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Coupon Discount</td>
                          <td></td>

                          <td>₹0.0</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Total</td>
                          <td></td>

                          <td>₹20,597</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="cart-summary"
              style={{ backgroundcolor: "#f8f8f8" }}
            >
              <div className="cart-panel-header">
                <button className="cart-close-btn" onClick={handlegohome}>
                  <FiX />
                </button>
              </div>
              <div className="cart-summary-content">
                <h3>Summary</h3>
                <label>
                  No Credit Item Subtotal:<span>₹ 10,800</span>
                </label>
                <label>
                  Other Item Subtotal:<span>₹ 20,597</span>
                </label>
                <label>
                  Overdue Amount:<span>₹ 9000</span>
                </label>

                <button className="download-pdf">
                  <BsCloudArrowDownFill /> Download Pdf
                </button>
              </div>

              <div className="cart-panel-footer">
                <div className="paidIcon">
                  <img src={PaidIcon} alt="PaidIcon" />
                </div>
                <div className="subtotal">
                  Total Payable: <span className="paid">₹ 29,597</span>
                </div>
                <button className="checkout-btn" onClick={handlegohome}>
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default Confirmation;
