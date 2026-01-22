import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import cartIcon from "../assets/images/product.jpg";
import { MdArrowBackIos } from "react-icons/md";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { BiSolidCart } from "react-icons/bi";

import SaveLatericon from "../assets/icons/SaveLatericon.svg";
import SaveLatericon1 from "../assets/icons/SaveLatericon1.svg";
import Deleteicon from "../assets/icons/Deleteicon.svg";
import noImage from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import OfferModal from "../components/OfferModal.jsx";

import { useNavigate } from "react-router-dom";

import { cart, updateQuantity, saveForLater, moveToCart, saveAllNoCreditItems, moveAllNoCreditItems, moveToCartAllSelectedItems, saveForLaterAllSelectedItems, deleteFromSaveForLaterItem, removeOffer, statementDownload } from "../api/apiRequest";

const renderWarrantyTag = (product) => {
  if (!product.is_warranty) return null;   // ✅ now this exists
  return (
    <div className="delivery">
      <img src={warrantyIcon} alt="Warranty" loading="lazy" style={{ width: "50px", height: "auto" }} />
    </div>
  );
};

const fastDeliveryTag = (product) => {
    if (!product.fast_delivery_tag == 1) return null;
    return (
      <div className="delivery">
        <img src={fastDeliveryIcon} alt="Fast Delivery" loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

const getProductImage = (product) => {
  const url = product?.images?.[0]?.file_name;
  if (!url) return noImage;
  if (url.startsWith("http")) return url;
  const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://mazingbusiness.com";
  return `${BACKEND}/${url.replace(/^\/+/, "")}`;
};

const CartSlide = ({ isCartVisible, toggleCart }) => {
  const [cartItems, setCartItems] = useState([]);
  
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState([]);
  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [noCreditItemTotalAmount, setNoCreditItemTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [overDueAmount, setOverDueAmount] = useState(0);
  const [qtyTimers, setQtyTimers] = useState({});
  const [subTotal, setSubTotal] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);      // for cartData()
  const [updatingQty, setUpdatingQty] = useState({});         // { [itemId]: true/false }

  // ✅ THIS replaces initialSavedItems
  const [saveForLaterItems, setSaveForLaterItems] = useState([]);
  const [saveForLaterCount, setSaveForLaterCount] = useState(0);
  const [saveForLaterCategory, setSaveForLaterCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [offerApplied, setofferApplied] = useState(0);
  const [appliedOfferDetails, setAppliedOfferDetails] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/company");
  };

  const cartData = async () => {
    setCartLoading(true);
    try {
      const responseData = await cart();
      if (responseData.res) {
        const cart_item = responseData.cart_item || [];
        const cartSubTotal = Number(responseData.other_item_total_amount || 0);
        const noCreditItemTotalAmount = Number(responseData.no_credit_item_total_amount || 0);
        const overDueAmount = Number(responseData.over_due_amount || 0);
        const totalPayableAmount = Number(responseData.payable_amount || 0);
        const applied_offer_details = responseData.offerDetails || [];

        const save_for_later = responseData.save_for_later || [];
        const save_for_later_category = responseData.save_for_later_category || [];
        const offer = responseData.save_for_later_category || [];
                
        setCartItems(cart_item);
        setCartCount(cart_item.length);

        setCartSubTotal(cartSubTotal);
        setNoCreditItemTotalAmount(noCreditItemTotalAmount);
        setOverDueAmount(overDueAmount);

        setSubTotal(cartSubTotal + noCreditItemTotalAmount);
        // setTotalPayable(cartSubTotal + noCreditItemTotalAmount + overDueAmount);
        setTotalPayable(totalPayableAmount);

        setSaveForLaterItems(save_for_later);
        setSaveForLaterCount(save_for_later.length);
        setSaveForLaterCategory(save_for_later_category);        
        setAppliedOfferDetails(applied_offer_details);        
        setofferApplied(responseData.applied_offer_id != null ? "1" : "0");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  // same structure as initialSavedItems, but safe for missing nested objects
  const initialSavedItems = (saveForLaterItems || []).map((it) => ({
    id: it?.id,
    name: it?.product?.name || it?.product_name || "",
    price: Number(it?.price || it?.product?.unit_price || 0),
    qty: Number(it?.quantity || 0),
    category: it?.product?.category?.name || "",
    image: it?.product?.images?.[0]?.file_name || "",
    cash_and_carry_item: it?.product?.cash_and_carry_item || "0",
  }));
  
  const getImageUrl = (url) => {
    if (!url) return noImage;
    if (url.startsWith("http")) return url;

    const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://mazingbusiness.com";
    return `${BACKEND}/${String(url).replace(/^\/+/, "")}`;
  };

  const [savedItems, setSavedItems] = useState(initialSavedItems);

  const handleQtyChange = (itemId, rawValue) => {
    const newQty = Math.max(1, Number(rawValue) || 1);
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );
    if (qtyTimers[itemId]) clearTimeout(qtyTimers[itemId]);
    setUpdatingQty((p) => ({ ...p, [itemId]: true }));
    const t = setTimeout(async () => {
      try {
        await updateQuantity({ cart_id: itemId, quantity: newQty }); // adjust keys if needed
        // optional: cartData() to sync exact totals from backend
        await cartData();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (err) {
        console.error(err);
        await cartData(); // revert from server on failure
      } finally {
        setUpdatingQty((p) => ({ ...p, [itemId]: false }));
      }
    }, 400);
    setQtyTimers((prev) => ({ ...prev, [itemId]: t }));
  };

  const handleQtyBlur = async (item) => {
    // flush: if debounce pending, clear it and send immediately
    if (qtyTimers[item.id]) {
      clearTimeout(qtyTimers[item.id]);
      setQtyTimers((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    }
    setUpdatingQty((p) => ({ ...p, [item.id]: true }));
    try {
      await updateQuantity({ cart_id: item.id, quantity: item.quantity });
      await cartData();
    } catch (err) {
      console.error(err);
      await cartData();
    } finally {
      setUpdatingQty((p) => ({ ...p, [item.id]: false }));
    }
  };

  useEffect(() => {
    cartData(); // first load when header renders
    const handler = () => cartData(); // when cart-updated happens, refresh
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
    };
  }, []);

  useEffect(() => {
    setSavedItems(initialSavedItems);
  }, [saveForLaterItems]); // or [initialSavedItems]

  useEffect(() => {
    let other = 0;
    let noCredit = 0;
    let payableAmount = 0;
    for (const item of cartItems) {
      const qty = Number(item.quantity || 1);
      const lineTotal = Number(item.price || 0) * qty;

      if (item?.product?.cash_and_carry_item == 1) noCredit += lineTotal;
      else other += lineTotal;
      payableAmount = item.payable_amount;
    }
    setCartSubTotal(other);
    setNoCreditItemTotalAmount(noCredit);

    const st = other + noCredit;
    setSubTotal(st);
  }, [cartItems]);
  
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

  useEffect(() => {
    if (isCartVisible) setSelectedCategory("All");
  }, [isCartVisible]);

  // Save for later with loader start
  // Save for later with loader start
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const moveToSaveForLater = async (cart_id) => {
    if (!cart_id) return console.error("Invalid cart_id:", cart_id);

    try {
      setActionLoading({ id: cart_id, type: "save" });
      await saveForLater({ cart_id: Number(cart_id) });
      await cartData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const moveItemToCart = async (cart_id) => {
    if (!cart_id) return console.error("Invalid cart_id:", cart_id);

    try {
      setActionLoading({ id: cart_id, type: "move" });
      await moveToCart({ cart_id: Number(cart_id) });
      await cartData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

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

  const handleSavedCheckbox2 = (id) => {
    const sid = String(id);
    setSelectedSavedIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const toggleSelectAllCart = () => {
    const currentIds = filteredSavedItems.map((item) => String(item.id)); // ✅ string

    if (currentIds.every((id) => selectedSavedIds.includes(id))) {
      setSelectedSavedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedSavedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const toggleSelectAllSaved = () => {
    const currentIds = filteredSavedItems.map((item) => String(item.id));
    setSelectedSavedIds((prev) => {
      const allSelected = currentIds.every((id) => prev.includes(id));
      return allSelected
        ? prev.filter((id) => !currentIds.includes(id))
        : [...new Set([...prev, ...currentIds])];
    });
  };

  const moveToSaveAllNoCreditItems = async () => {
    await saveAllNoCreditItems();
    await cartData();
  };

  const moveAllNoCreditItemsToCart = async () => {
    await moveAllNoCreditItems();
    await cartData();
  };

  const deleteFromCart = async (id,qty) => {
    await updateQuantity({ cart_id: id, quantity: qty });
    await cartData();
  };

  const deleteFromSaved = async (id) => {
    await deleteFromSaveForLaterItem({ id: id });
    await cartData();
  };

  // const downloadStatement = async (id) => {
  //   await statementDownload();
  // };

  const forceDownload = (fileUrl, fileName = "statement.pdf") => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.setAttribute("download", fileName); // hint to download
    a.setAttribute("target", "_blank");   // fallback if browser ignores download
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadStatement = async () => {
    setDownloading(true);
    try {
      const data = await statementDownload();
      if (!data?.pdf_url) throw new Error("pdf_url not found");

      const fileName = data.pdf_url.split("/").pop() || "statement.pdf";
      forceDownload(data.pdf_url, fileName);
      setDownloading(false);
    } catch (e) {
      console.error(e);
      alert(e.message || "Download failed");
    }
  };

  const handleMoveCheckedToCart = async () => {
    const idsCsv = filteredSavedItems
      .filter((it) => selectedSavedIds.includes(it.id))
      .map((it) => String(it.id))
      .join(",");

    await moveToCartAllSelectedItems({ idsCsv });
    await cartData();
  };

  const handleSaveForLaterAllCheckedToCart = async () => {
    const idsCsv = cartItems
      .filter((it) => selectedSavedIds.includes(String(it.id))) // ✅ match string
      .map((it) => String(it.id))
      .join(",");

    console.log("idsCsv:", idsCsv);

    if (!idsCsv) return; // optional safety

    await saveForLaterAllSelectedItems({ idsCsv });
    await cartData();
  };

  const moveAllSelectedItemToCart = async (cart_ids) => {
    if (!cart_ids) return console.error("Invalid cart_id:", cart_ids);
    await moveToCart({ cart_id:cart_ids });
    await cartData();
  };

  const categoryCounts = savedItems.reduce((acc, item) => {
    const category = item.category || "UNCATEGORIZED";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const removeAppliedOffer = async (offerId) => {
    try {
      const res = await removeOffer(offerId); // or applyOffer({ offer_id: offerId })
      const json = await res.json(); // ✅ must read response body
      if (json?.res === false) {
        alert(json?.msg || "Offer removed failed");
        await cartData();
        return;
      }else{
        alert(json?.msg || "Remove offer.");
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "Something went wrong");
    } finally {
      await cartData(); // ✅ always refresh cart
    }
  };

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
            <div className="backSec">
              <button>
                <MdArrowBackIos /> BACK TO STORE
              </button>
            </div>
            {/* Shopping Cart */}
            {cartItems.length > 0 && (
              <div className="cart-section">
                <h2>
                  <span>
                    Shopping Cart <BiSolidCart />
                  </span>
                  <span className="Cartitem">{cartItems.length} Items</span>
                </h2>
                <div className="cart-table-container">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>
                          {/* <label className="animated-checkbox">
                            <input
                              type="checkbox"
                              onChange={toggleSelectAllCart}
                              checked={
                                selectedCartIds.length === cartItems.length
                              }
                            />
                            <span className="custom-check"></span>
                          </label> */}
                        </th>
                        <th className="narrow1">Product</th>
                        <th>Price</th>
                        <th className="narrow3">Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id} className={item?.applied_offer_id != null ? "tem-row" : ""}>
                          <td data-label="">
                            <label className="animated-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedSavedIds.includes(String(item.id))}
                                onChange={() => handleSavedCheckbox2(String(item.id))}
                              />

                              {/* <input type="checkbox" onChange={toggleSelectAllSaved}
                                checked={
                                  filteredSavedItems.length > 0 &&
                                  filteredSavedItems.every((item) =>
                                    selectedSavedIds.includes(item.id)
                                  )
                                }
                              /> */}
                              <span className="custom-check"></span>
                            </label>
                          </td>
                          <td className="narrow1" data-label="Product">
                            <div className="cartproduct">
                              <img src={getProductImage(item?.product)} alt={item?.product?.name || "Product"} width="70"
                                onError={(e) => {
                                  e.currentTarget.src = noImage;   // ✅ if broken link / 404
                                }}
                              />
                              {" "}
                              {item.product.name}
                              {item.applied_offer_id}
                              {item.product.cash_and_carry_item == 1 && (
                                <span className="no-credit">
                                  No Credit Item
                                </span>
                              )}

                              {item.applied_offer_id != null && (
                                <span className="applied-offer-tag">
                                  {appliedOfferDetails?.offer_name} Offer Applied 
                                </span>
                              )}

                            </div>
                            <div className="ratingGrp">
                              <div className="ratingGrpLft">
                                {renderWarrantyTag(item.product)}
                              </div>
                              {fastDeliveryTag(item.product)}
                            </div>
                          </td>
                          <td className="cartprice" data-label="Price">
                            ₹ {item.price}
                          </td>
                          <td className="narrow3" data-label="Quantity">
                            {/* <input type="number" min="1" value={item.quantity}
                              onChange={(e) => {
                                const newQty = Math.max(1, Number(e.target.value) || 1);
                                setCartItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
                                );
                              }}
                              onBlur={async () => {
                                try {
                                  await updateQuantity({ id: item.id, quantity: item.quantity });
                                  cartData(); // totals refresh
                                } catch (err) {
                                  console.error(err);
                                  cartData(); // revert if failed
                                }
                              }}
                            /> */}
                            <input type="number" min="1" value={item.quantity} onChange={(e) => handleQtyChange(item.id, e.target.value)} onBlur={() => handleQtyBlur(item)} />
                            {updatingQty[item.id] && <span className="qty-loader">Updating...</span>}
                          </td>
                          <td className="cartprice" data-label="Total">
                            ₹ {item.quantity * item.price}
                          </td>
                          <td data-label="Action">
                            <button
                              onClick={() => moveToSaveForLater(item.id)}
                              disabled={actionLoading.id === item.id && actionLoading.type === "save"}
                            >
                              {actionLoading.id === item.id && actionLoading.type === "save" ? (
                                <span className="btn-loader">Saving...</span>
                              ) : (
                                <img src={SaveLatericon} alt="SaveLatericon" />
                              )}
                            </button>
                            <button onClick={() => deleteFromCart(item.id,'0')}>
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
                    <span>₹{subTotal}</span>
                  </label>

                  <div className="section-buttons">
                    <button className="greenbtn" onClick={handleSaveForLaterAllCheckedToCart}>
                      Save all checked item for later
                    </button>
                    <button className="bluebtn" onClick={() => moveToSaveAllNoCreditItems()}>
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
                  <span className="Cartitem">{savedItems.length} Items</span>
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
                </div>

                {/* Filtered Table */}
                {filteredSavedItems.length > 0 && (
                  <div className="cart-table-container">
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>
                            <label className="animated-checkbox">
                              {/* <input type="checkbox" onChange={toggleSelectAllCart}
                                checked={
                                  filteredSavedItems.length > 0 &&
                                  filteredSavedItems.every((item) =>
                                    selectedSavedIds.includes(item.id)
                                  )
                                }
                              /> */}
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
                              <label className="animated-checkbox">
                                <input type="checkbox" checked={selectedSavedIds.includes(item.id)} onChange={() => handleSavedCheckbox(item.id)} />
                                <span className="custom-check"></span>
                              </label>
                            </td>

                            <td className="narrow1" data-label="Product">
                              <div className="cartproduct">
                                <img src={getImageUrl(item.image)} alt={item?.name || "Product"} width="70"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null; // stop infinite loop
                                    e.currentTarget.src = noImage;
                                  }}
                                />
                                {item.name}
                                {item.cash_and_carry_item == 1 && (
                                  <span className="no-credit">
                                    No Credit Item
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="cartprice" data-label="Price">
                              ₹ {item.price}
                            </td>

                            <td className="narrow5" data-label="Added Quantity">
                              <span>{item.qty || 1}</span>
                            </td>
                            <td className="cartprice" data-label="Total">
                              ₹ {(item.price * (item.qty || 1)).toFixed(2)}
                            </td>
                            <td data-label="Action">
                              <button
                                onClick={() => moveItemToCart(item.id)}
                                disabled={actionLoading.id === item.id && actionLoading.type === "move"}
                              >
                                  {actionLoading.id === item.id && actionLoading.type === "move" ? (
                                    <span className="btn-loader">Moving...</span>
                                  ) : (
                                    <img src={SaveLatericon1} alt="SaveLatericon1" />
                                  )}
                              </button>
                              
                              <button onClick={() => deleteFromSaved(item.id)}>
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
                    {/* <button className="greenbtn">
                      Move all checked item for cart
                    </button> */}
                    <button className="greenbtn" onClick={handleMoveCheckedToCart} >
                      Move all checked item for cart
                    </button>
                    <button className="bluebtn"  onClick={() => moveAllNoCreditItemsToCart()}>
                      Move all no credit item for cart
                    </button>
                  </div>
                </div>
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
                No Credit Item Subtotal:<span>₹ {noCreditItemTotalAmount}</span>
              </label>
              <label>
                Other Item Subtotal:<span>₹{cartSubTotal}</span>  
              </label>
              {overDueAmount > 0 && (
                <label>
                  Overdue Amount:<span>₹ {overDueAmount}</span>
                </label>
              )}
              <button className="download-pdf" onClick={() => downloadStatement()}>
                <BsCloudArrowDownFill /> {downloading ? "Downloading..." : "Download Statement"}
              </button>
            </div>

            {/* Cart Footer */}
            <div className="cart-panel-footer">
              <div className="subtotal">
                {}
                Total Payable: <span>₹ {totalPayable}</span>
              </div>

              {offerApplied != 0 ? (
                  <button className="checkout-btn Remove-btn" onClick={() => removeAppliedOffer(appliedOfferDetails?.id)}>
                    Remove Offer {appliedOfferDetails?.offer_name}
                  </button>
                ) : (
                  <button className="checkout-btn Offer-btn" onClick={() => setOfferModalOpen(true)}>
                    Apply Offer
                  </button>
                )}

              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Offer Modal */}
      <OfferModal isOpen={isOfferModalOpen} onClose={() => setOfferModalOpen(false)} onApplied={cartData} />
    </>
  );
};

export default CartSlide;
