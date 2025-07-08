import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import cartIcon from "../assets/images/product.jpg";

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

const CartSlide = ({ isCartVisible, toggleCart }) => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [savedItems, setSavedItems] = useState(initialSavedItems);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState([]);

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
    <>
      <div
        className={`cart-overlay ${isCartVisible ? "cart-overlay-show" : ""}`}
        onClick={toggleCart}
      ></div>

      <div className={`cart-panel ${isCartVisible ? "slide-in" : "slide-out"}`}>
        <div className="cart-wrapper">
          <div className="cart-left">
            {/* Shopping Cart */}
            {cartItems.length > 0 && (
              <div className="cart-section">
                <h2>Shopping Cart</h2>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          onChange={toggleSelectAllCart}
                          checked={selectedCartIds.length === cartItems.length}
                        />
                      </th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedCartIds.includes(item.id)}
                            onChange={() => handleCartCheckbox(item.id)}
                          />
                        </td>
                        <td>
                          <img src={cartIcon} alt="" width="40" /> {item.name}{" "}
                          {item.noCredit && (
                            <span className="no-credit">No Credit Item</span>
                          )}
                        </td>
                        <td>₹ {item.price}</td>
                        <td>
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
                        <td>₹ {item.qty * item.price}</td>
                        <td>
                          <button onClick={() => moveToSaved(item)}>🔍</button>
                          <button onClick={() => deleteFromCart(item.id)}>
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Saved For Later */}
            {savedItems.length > 0 && (
              <div className="cart-section">
                <h2>Saved For Later</h2>

                {/* Category Tabs */}
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
                    {Object.entries(categoryCounts).map(([cat, count]) => (
                      <span
                        key={cat}
                        className={`tab ${
                          selectedCategory === cat ? "active" : ""
                        }`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat} ({count})
                      </span>
                    ))}
                  </div>
                )}

                {/* Filtered Table */}
                {filteredSavedItems.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>
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
                        </th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSavedItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedSavedIds.includes(item.id)}
                              onChange={() => handleSavedCheckbox(item.id)}
                            />
                          </td>
                          <td>
                            <img src={cartIcon} alt="" width="40" /> {item.name}
                          </td>
                          <td>₹ {item.price}</td>
                          <td>
                            <button onClick={() => moveToCart(item)}>⬆️</button>
                            <button onClick={() => deleteFromSaved(item.id)}>
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Right Summary */}
          <div className="cart-summary">
            <div className="cart-panel-header">
              <button className="cart-close-btn" onClick={toggleCart}>
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

              <button className="download-pdf">Download Pdf</button>
            </div>

            {/* Cart Footer */}
            <div className="cart-panel-footer">
              <div className="subtotal">
                <p className="payable">Total Payable: ₹ {total + 9000}</p>
              </div>
              <button className="checkout-btn">Go to Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSlide;
