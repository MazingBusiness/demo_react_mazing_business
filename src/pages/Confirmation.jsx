import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";

import cartllink1 from "../assets/icons/cartllink1a.svg";
import cartllink2 from "../assets/icons/cartllink2a.svg";
import cartllink3 from "../assets/icons/cartllink3b.svg";
import cartllink4 from "../assets/icons/cartllink4.svg";

import CartSummary from "../components/CartSummary.jsx";

import { cart } from "../api/apiRequest";

const Confirmation = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);      // for cartPageData()
  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [noCreditItemTotalAmount, setNoCreditItemTotalAmount] = useState(0);
  const [overDueAmount, setOverDueAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  const cartPageData = async () => {
    setCartLoading(true);
    try {
      const responseData = await cart();
      if (responseData.res) {
        const cart_item = responseData.cart_item || [];
        const cartSubTotal = Number(responseData.other_item_total_amount || 0);
        const noCreditItemTotalAmount = Number(responseData.no_credit_item_total_amount || 0);
        const overDueAmount = Number(responseData.over_due_amount || 0);
        const totalPayableAmount = Number(responseData.payable_amount || 0);
                
        setCartItems(cart_item);
        setCartSubTotal(cartSubTotal);
        setNoCreditItemTotalAmount(noCreditItemTotalAmount);
        setOverDueAmount(overDueAmount);
        setSubTotal(cartSubTotal + noCreditItemTotalAmount);
        setTotalPayable(totalPayableAmount);        
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
      cartPageData(); // first load when header renders
    }, []);

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
                  <Link to="/confirmation">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                  <Link to="/payment" className="deactive">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
                  </Link>
                </div>
              </div>

              <div className="cart-left-rgt">
                <div className="payment-container">
                  <div className="product-section">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {" "}
                            {item.product.name}{" "}
                            <span className="quantity">( ₹ {item.price} x {item.quantity} )</span>
                          </td>
                          <td>₹ {item.quantity * item.price}</td>
                        </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>
                            <h3>Total Price</h3>
                            <label>
                              <input type="checkbox" checked={agreeToTerms}
                                onChange={(e) =>
                                  setAgreeToTerms(e.target.checked)
                                }
                              />
                              I agree to the terms and conditions, return policy
                              & privacy policy
                            </label>
                          </td>
                          <td>₹ {cartSubTotal}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* <div
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
            </div> */}
            <CartSummary />
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default Confirmation;
