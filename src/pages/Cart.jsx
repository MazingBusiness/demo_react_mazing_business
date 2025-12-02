import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";

import cartIcon from "../assets/images/product.jpg";
import { MdArrowBackIos } from "react-icons/md";

import { BiSolidCart } from "react-icons/bi";

import SaveLatericon from "../assets/icons/SaveLatericon.svg";
import SaveLatericon1 from "../assets/icons/SaveLatericon1.svg";
import Deleteicon from "../assets/icons/Deleteicon.svg";

import cartllink1 from "../assets/icons/cartllink1.svg";
import cartllink2 from "../assets/icons/cartllink2b.svg";
import cartllink3 from "../assets/icons/cartllink3b.svg";
import cartllink4 from "../assets/icons/cartllink4b.svg";

import OfferModal from "../components/OfferModal.jsx";

const initialCartItems = [
  { id: 1, name: "Bosch Rexroth Hydraulic Pump", price: 15800, qty: 1 },
  {
    id: 2,
    name: "Caterpillar Hydraulic Excavator (CAT 320D)",
    price: 10800,
    qty: 1,
    noCredit: true,
  },
  { id: 3, name: "KUKA Industrial Robot (KR AGILUS)", price: 2997, qty: 1 },
];

const initialSavedItems = [
  {
    id: 4,
    name: "Electric Oil Pump",
    price: 999,
    category: "ELECTRIC OIL PUMP",
  },
  { id: 5, name: "Tool Kit Pro", price: 1200, category: "TOOL KIT" },
  { id: 6, name: "Air Blower Turbo", price: 1100, category: "AIR BLOWER" },
  {
    id: 7,
    name: "Electric Oil Pump V2",
    price: 1050,
    category: "ELECTRIC OIL PUMP",
  },
];

const Cart = ({ isCartVisible, toggleCart }) => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [savedItems, setSavedItems] = useState(initialSavedItems);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState([]);

  const [isOfferModalOpen, setOfferModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/payment");
  };

  const handlegohome = () => {
    navigate("/home");
  };

  // 🔧 Fix: cart subtotal (use qty instead of quantity)
  const calculateCartSubtotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.price * item.qty, 0)
      .toFixed(2);
  };

  // 🔧 Add: calculate subtotal for saved items
  const calculateSavedSubtotal = () => {
    return savedItems
      .reduce((sum, item) => sum + item.price * (item.qty || 1), 0)
      .toFixed(2);
  };

  useEffect(() => {
    document.body.style.overflow = isCartVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartVisible]);

  const handleCartCheckbox = (id) => {
    setSelectedCartIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSavedCheckbox = (id) => {
    setSelectedSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCart = () => {
    if (selectedCartIds.length === cartItems.length) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(cartItems.map((item) => item.id));
    }
  };

  const toggleSelectAllSaved = () => {
    const currentIds = filteredSavedItems.map((item) => item.id);
    if (currentIds.every((id) => selectedSavedIds.includes(id))) {
      setSelectedSavedIds((prev) =>
        prev.filter((id) => !currentIds.includes(id))
      );
    } else {
      setSelectedSavedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const moveToSaved = (item) => {
    setCartItems((prev) => prev.filter((i) => i.id !== item.id));
    setSavedItems((prev) => [
      ...prev,
      { ...item, category: item.category || "UNCATEGORIZED" },
    ]);
    setSelectedCartIds((prev) => prev.filter((id) => id !== item.id));
  };

  const moveToCart = (item) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
    setCartItems((prev) => [...prev, { ...item, qty: 1 }]);
    setSelectedSavedIds((prev) => prev.filter((id) => id !== item.id));
  };

  const deleteFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedCartIds((prev) => prev.filter((x) => x !== id));
  };

  const deleteFromSaved = (id) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedSavedIds((prev) => prev.filter((x) => x !== id));
  };

  const categoryCounts = savedItems.reduce((acc, item) => {
    const category = item.category || "UNCATEGORIZED";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const filteredSavedItems =
    selectedCategory === "All"
      ? savedItems
      : savedItems.filter(
          (item) => (item.category || "UNCATEGORIZED") === selectedCategory
        );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const noCreditTotal = cartItems
    .filter((i) => i.noCredit)
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="CartBody ConfirmationBody">
      <MainLayout>
        <div className="cart-panel-box">
          <div className="cart-wrapper">
            <div className="cart-left">
              <div className="cart-left-lft">
                <div className="cartLink">
                  <Link to="/cart">
                    <img src={cartllink1} alt="MenuIcon" /> Shopping Cart
                  </Link>
                  <Link to="/company" className="deactive">
                    <img src={cartllink2} alt="MenuIcon" /> Shipping Company
                  </Link>
                  <Link to="/payment" className="deactive">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
                  </Link>
                  <Link to="/confirmation" className="deactive">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                </div>
              </div>

              <div className="cart-left-rgt">
                <div className="cart-left">
                  {/* Shopping Cart */}
                  {cartItems.length > 0 && (
                    <div className="cart-section">
                      <h2>
                        <span className="Cartitem">
                          {cartItems.length} Items
                        </span>
                      </h2>

                      <div className="order-table-container2">
                        <table className="order-table">
                          <thead>
                            <tr>
                              <th data-label="">
                                <label class="animated-checkbox">
                                  <input
                                    type="checkbox"
                                    onChange={toggleSelectAllCart}
                                    checked={
                                      selectedCartIds.length ===
                                      cartItems.length
                                    }
                                  />
                                  <span className="custom-check"></span>
                                </label>
                              </th>
                              <th className="narrow1" data-label="Product">
                                Product
                              </th>
                              <th data-label="Price">Price</th>
                              <th
                                className="narrow3"
                                data-label="Added Quantity"
                              >
                                Quantity
                              </th>
                              <th data-label="Total">Total</th>
                              <th data-label="Action">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cartItems.map((item) => (
                              <tr key={item.id}>
                                <td data-label="">
                                  <label class="animated-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={selectedCartIds.includes(
                                        item.id
                                      )}
                                      onChange={() =>
                                        handleCartCheckbox(item.id)
                                      }
                                    />
                                    <span className="custom-check"></span>
                                  </label>
                                </td>
                                <td className="narrow1" data-label="Product">
                                  <div className="cartproduct">
                                    <img src={cartIcon} alt="" width="70" />{" "}
                                    {item.name}
                                    {item.noCredit && (
                                      <span className="no-credit">
                                        No Credit Item
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="cartprice" data-label="Price">
                                  ₹ {item.price}
                                </td>
                                <td
                                  className="narrow3"
                                  data-label="Added Quantity"
                                >
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) =>
                                      setCartItems((prev) =>
                                        prev.map((i) =>
                                          i.id === item.id
                                            ? { ...i, qty: +e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td className="cartprice" data-label="Total">
                                  ₹ {item.qty * item.price}
                                </td>
                                <td data-label="Action">
                                  <button onClick={() => moveToSaved(item)}>
                                    {" "}
                                    <img
                                      src={SaveLatericon}
                                      alt="SaveLatericon"
                                    />
                                  </button>
                                  <button
                                    onClick={() => deleteFromCart(item.id)}
                                  >
                                    <img src={Deleteicon} alt="Deleteicon" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="cartSubtotal">
                        <label>
                          Subtotal:
                          <span>₹{calculateCartSubtotal()}</span>
                        </label>

                        <div className="section-buttons">
                          <button className="greenbtn">
                            Save all checked item for later
                          </button>
                          <button className="bluebtn">
                            Save all no credit item for later
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Saved For Later */}
                  {savedItems.length > 0 && (
                    <div className="cart-section">
                      <h2>
                        <span>Saved For Later</span>
                        <span className="Cartitem">
                          {savedItems.length} Items
                        </span>
                      </h2>

                      {/* Category Tabs */}
                      <div className="cart-Category-Tabs">
                        <h3>Selected Categories</h3>

                        {Object.keys(categoryCounts).length > 0 && (
                          <div className="category-tabs">
                            <span
                              className={`tab ${
                                selectedCategory === "All" ? "active" : ""
                              }`}
                              onClick={() => setSelectedCategory("All")}
                            >
                              All ({savedItems.length})
                            </span>
                            {Object.entries(categoryCounts).map(
                              ([cat, count]) => (
                                <span
                                  key={cat}
                                  className={`tab ${
                                    selectedCategory === cat ? "active" : ""
                                  }`}
                                  onClick={() => setSelectedCategory(cat)}
                                >
                                  {cat} ({count})
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Filtered Table */}
                      {filteredSavedItems.length > 0 && (
                        <div className="order-table-container2">
                          <table className="order-table">
                            <thead>
                              <tr>
                                <th>
                                  <label class="animated-checkbox">
                                    <input
                                      type="checkbox"
                                      onChange={toggleSelectAllSaved}
                                      checked={
                                        filteredSavedItems.length > 0 &&
                                        filteredSavedItems.every((item) =>
                                          selectedSavedIds.includes(item.id)
                                        )
                                      }
                                    />
                                    <span className="custom-check"></span>
                                  </label>
                                </th>
                                <th>Product</th>
                                <th>Price</th>
                                <th className="narrow5">Added Quantity</th>
                                <th>Total</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredSavedItems.map((item) => (
                                <tr key={item.id}>
                                  <td data-label="">
                                    <label class="animated-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={selectedSavedIds.includes(
                                          item.id
                                        )}
                                        onChange={() =>
                                          handleSavedCheckbox(item.id)
                                        }
                                      />
                                      <span className="custom-check"></span>
                                    </label>
                                  </td>

                                  <td className="narrow1" data-label="Product">
                                    <div className="cartproduct">
                                      <img src={cartIcon} alt="" width="70" />{" "}
                                      {item.name}
                                    </div>
                                  </td>

                                  <td className="cartprice" data-label="Price">
                                    ₹ {item.price}
                                  </td>

                                  <td
                                    className="narrow5"
                                    data-label="Added Quantity"
                                  >
                                    <span>{item.qty || 1}</span>
                                  </td>
                                  <td className="cartprice" data-label="Total">
                                    ₹{" "}
                                    {(item.price * (item.qty || 1)).toFixed(2)}
                                  </td>
                                  <td data-label="Action">
                                    <button onClick={() => moveToCart(item)}>
                                      {" "}
                                      <img
                                        src={SaveLatericon1}
                                        alt="SaveLatericon1"
                                      />
                                    </button>
                                    <button
                                      onClick={() => deleteFromSaved(item.id)}
                                    >
                                      <img src={Deleteicon} alt="Deleteicon" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="cartSubtotal">
                        <div className="section-buttons">
                          <button className="greenbtn">
                            Move all checked item for cart
                          </button>
                          <button className="bluebtn">
                            Move all no credit item for cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="cart-summary">
              <div className="cart-panel-header">
                <button className="cart-close-btn" onClick={handlegohome}>
                  <FiX />
                </button>
              </div>

              <div className="cart-summary-content">
                <h3>Summary</h3>
                <label>
                  No Credit Item Subtotal:<span>₹ {noCreditTotal}</span>
                </label>
                <label>
                  Other Item Subtotal:<span>₹ {total}</span>
                </label>
                <label>
                  Overdue Amount:<span>₹ 9000</span>
                </label>

                <button className="download-pdf">
                  <BsCloudArrowDownFill /> Download Pdf
                </button>
              </div>

              {/* Cart Footer */}
              <div className="cart-panel-footer">
                <div className="subtotal">
                  Total Payable: <span>₹ {total + 9000}</span>
                </div>
                <button
                  className="checkout-btn Offer-btn"
                  onClick={() => setOfferModalOpen(true)}
                >
                  Apply Offer
                </button>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

      {/* 🟢 Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setOfferModalOpen(false)}
      />
    </div>
  );
};

export default Cart;
