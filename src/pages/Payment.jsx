import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";

import cartllink1 from "../assets/icons/cartllink1a.svg";
import cartllink2 from "../assets/icons/cartllink2a.svg";
import cartllink3 from "../assets/icons/cartllink3.svg";
import cartllink4 from "../assets/icons/cartllink4a.svg";

import tickIcon from "../assets/icons/tickIcon.svg";
import PaidIcon from "../assets/icons/PaidIcon.svg";

import QR from "../assets/images/QR.png";

import Modal from "../components/Modal";
import CartSummary from "../components/CartSummary.jsx";

const Payment = () => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qr"); // 'qr', 'upi', or 'bank

  const [showTicketModal, setShowTicketModal] = useState(false);

  const [noGstin, setNoGstin] = useState(false);

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/confirmation");
  };

  const handlegohome = () => {
    navigate("/home");
  };

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

  const addresses = [
    {
      gst: "07AAOCM7588A1Z3",
      company: "Mazing Retail Private Limited",
      address1: "Rama Road Industrial Park",
      address2: "2 Rama Road Industrial Center",
      postalCode: "700059",
      city: "West Delhi",
      state: "Delhi",
      country: "India",
      phone: "+91 1234567890",
    },
    {
      gst: "07AAOCM7588A1Z3",
      company: "Mazing Retail Private Limited",
      address1: "Rama Road Industrial Park",
      address2: "2 Rama Road Industrial Center",
      postalCode: "700059",
      city: "West Delhi",
      state: "Delhi",
      country: "India",
      phone: "+91 1234567890",
    },
    {
      gst: "07AAOCM7588A1Z3",
      company: "Mazing Retail Private Limited",
      address1: "Rama Road Industrial Park",
      address2: "2 Rama Road Industrial Center",
      postalCode: "700059",
      city: "West Delhi",
      state: "Delhi",
      country: "India",
      phone: "+91 1234567890",
    },
    {
      gst: "07AAOCM7588A1Z3",
      company: "Mazing Retail Private Limited",
      address1: "Rama Road Industrial Park",
      address2: "2 Rama Road Industrial Center",
      postalCode: "700059",
      city: "West Delhi",
      state: "Delhi",
      country: "India",
      phone: "+91 1234567890",
    },
  ];

  const [selectedState, setSelectedState] = useState("");
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const stateRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setStateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statesOfIndia = ["Andhra Pradesh", "Arunachal Pradesh"];

  const countryofWorld = ["India", "English"];
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef();

  const cityList = ["Delhi", "Mumbai", "Kolkata", "Bangalore"]; // update as needed
  const [selectedCity, setSelectedCity] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityRef = useRef();

  const [gstInput, setGstInput] = useState("");

  // Filter addresses based on GSTIN input
  const matchedAddress = addresses.find(
    (addr) => addr.gst.toLowerCase() === gstInput.toLowerCase()
  );

  const handleNoGstinChange = (e) => {
    setNoGstin(e.target.checked);
    if (e.target.checked) {
      setGstInput(""); // Clear GSTIN input when checkbox is checked
    }
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
                  <Link to="/confirmation" className="active">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                  <Link to="/payment">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
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

                <div className="payment-methods">
                  <h2>Payment Type</h2>

                  <div className="payment-methods-inner">
                    <div className="payment-methods-inner-lft">
                      <h5>Pay your amount by scanning the QR Code</h5>
                      <div className="qrBox">
                        <img src={QR} alt="qr" />
                      </div>

                      <h4>NOTE : This QR Code is valid for next 24 hrs</h4>
                    </div>

                    <div className="payment-methods-inner-rgt">
                      <h5>Pay your amount by entering your @upi ID</h5>
                      <div className="form-group">
                        <label>Enter your @upi ID</label>
                        <input
                          type="text"
                          className="full-input"
                          placeholder="Enter"
                        />
                        <button type="submit" className="form-submit">
                          Verify & Pay
                        </button>
                      </div>
                      <h5>Transfer the amount to this account</h5>
                      <div className="bank-details">
                        <p>
                          <strong>Bank Name:</strong> ICICI BANK
                        </p>
                        <p>
                          <strong>Account Name:</strong> ACE TOOLS PVT LTD
                        </p>
                        <p>
                          <strong>A/C No:</strong> 235605001202
                        </p>
                        <p>
                          <strong>IFSC Code:</strong> ICIC0002356
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="cart-summary">
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
                <div className="subtotal">
                  Total Payable: <span>₹ 29,597</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Complete
                </button>
              </div>
            </div> */}
            <CartSummary />
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default Payment;
