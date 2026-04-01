import { useState, useRef, useEffect } from "react";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link , useLocation } from "react-router-dom";
import OfferModal from "../components/OfferModal.jsx";
import { FiTrash2 } from "react-icons/fi";

import Swal from "sweetalert2";
import { 
  cart, 
  removeOffer, 
  statementDownload, 
  updateShippingAddressToCart, 
  orderSubmit, 
  applyMCoin, 
  getMCoin, 
  removeMCoin,
  getAvailableMCoin, 
} from "../api/apiRequest.jsx";

const CartSummary = ({ isCartVisible, onApplied, afterAppliedRefresh, selectedAddressId, canCheckout }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [noCreditItemTotalAmount, setNoCreditItemTotalAmount] = useState(0);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [overDueAmount, setOverDueAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);      // for cartPageData()

  const [offerApplied, setofferApplied] = useState(0);
  const [appliedOfferDetails, setAppliedOfferDetails] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [butnText, setButnText] = useState("Complete");
  const [cartCount, setCartCount] = useState(0);
  const [saveForLaterItems, setSaveForLaterItems] = useState([]);
  const [saveForLaterCount, setSaveForLaterCount] = useState(0);
  const [saveForLaterCategory, setSaveForLaterCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState([]);

  const cartData = async () => {
    setCartLoading(true);
    try {
      const responseData = await cart();
      if (responseData?.res) {
        const cart_item = responseData.cart_item || [];

        const otherTotal = Number(responseData.other_item_total_amount || 0);
        const noCreditTotal = Number(responseData.no_credit_item_total_amount || 0);
        const overDue = Number(responseData.over_due_amount || 0);
        const payable = Number(responseData.payable_amount || 0);

        const offerDetails = responseData.offerDetails ?? null;
        const save_for_later = responseData.save_for_later || [];
        const save_for_later_category = responseData.save_for_later_category || [];



        setCartItems(cart_item);
        setCartCount(cart_item.length);

        setCartSubTotal(otherTotal);
        setNoCreditItemTotalAmount(noCreditTotal);
        setOverDueAmount(overDue);

        const availableMCoin = Number(responseData.availableMCoinBalance || 0);
        const earnMCoin = Number(responseData.earnMCoin || 0);
        setAvailableMCoinBalance(availableMCoin);
        setEarnMCoin(earnMCoin);

        setSubTotal(otherTotal + noCreditTotal);
        setTotalPayable(payable);

        setSaveForLaterItems(save_for_later);
        setSaveForLaterCount(save_for_later.length);
        setSaveForLaterCategory(save_for_later_category);

        setAppliedOfferDetails(offerDetails);
        setofferApplied(responseData.applied_offer_id != null ? "1" : "0");

        // ✅ clean selections that no longer exist (string compare)
        setSelectedCartIds((prev) =>
          prev.filter((id) => cart_item.some((x) => String(x.id) === String(id)))
        );
        setSelectedSavedIds((prev) =>
          prev.filter((id) => save_for_later.some((x) => String(x.id) === String(id)))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

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
        const applied_offer_details = responseData.offerDetails || [];

        const availableMCoin = Number(responseData.availableMCoinBalance || 0);
        const earnMCoin = Number(responseData.earnMCoin || 0);

        const save_for_later = responseData.save_for_later || [];
        const save_for_later_category = responseData.save_for_later_category || [];
        const offer = responseData.save_for_later_category || [];
                
        setCartItems(cart_item);

        setCartSubTotal(cartSubTotal);
        setNoCreditItemTotalAmount(noCreditItemTotalAmount);
        setOverDueAmount(overDueAmount);

        setAvailableMCoinBalance(availableMCoin);
        setEarnMCoin(earnMCoin);

        setSubTotal(cartSubTotal + noCreditItemTotalAmount);
        // setTotalPayable(cartSubTotal + noCreditItemTotalAmount + overDueAmount);
        setTotalPayable(totalPayableAmount);
        setAppliedOfferDetails(applied_offer_details);  
        setofferApplied(responseData.applied_offer_id != null ? "1" : "0");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    cartPageData(); // first load when header renders
    const handler = () => cartPageData(); // when cart-updated happens, refresh
    if(location.pathname == '/cart'){
      canCheckout =  "";
      setButnText("Proceed to shipping");
    } else if(location.pathname == '/company'){
      canCheckout =  "";
      setButnText("Proceed to checkout");
    } else if(location.pathname == '/confirmation'){
      canCheckout = "";
      setButnText("Proceed to confirmation");
    }else if(location.pathname == '/payment'){
      setButnText("Complete");
    }
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
    };
    
  }, []);

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

  // ------ M Coin
  const [availableMCoinBalance, setAvailableMCoinBalance] = useState(0);
  const [earnMCoinBalance, setEarnMCoin] = useState(0);
  const [appliedCoins, setAppliedCoins] = useState("");
  const [savedAppliedCoins, setSavedAppliedCoins] = useState(0);
  const [mCoinLoading, setMCoinLoading] = useState(false);
  const appliedCoinValue = Math.floor((Number(appliedCoins || 0)) / 250);
  const savedAppliedCoinValue = Math.floor(Number(savedAppliedCoins || 0) / 250);
  const [payWithMCoin, setPayWithMCoin] = useState(false);
  
  
  const loadAppliedMCoin = async () => {
    try {
      const res = await getMCoin();
      if (!res?.ok) {
        setSavedAppliedCoins(0);
        return;
      }

      const json = await res.json();
      console.log("getMCoin json:", json);

      const applied = Number(
        json?.data?.coins ??
        json?.data?.applied_m_coins ??
        json?.applied_m_coins ??
        0
      );

      setSavedAppliedCoins(applied > 0 ? applied : 0);
    } catch (e) {
      console.error("getMCoin error:", e);
      setSavedAppliedCoins(0);
    }
  };

  useEffect(() => {
    setPayWithMCoin(Number(savedAppliedCoins) > 0);
  }, [savedAppliedCoins]);

  const handlePayWithMCoinToggle = async (e) => {
    const checked = e.target.checked;
    setPayWithMCoin(checked);
    if (!checked && Number(savedAppliedCoins) > 0) {
      await handleRemoveAppliedCoins();
    }
  };

  const getAvailableMCoinBalance = async () => {
    try {
      const res = await getAvailableMCoin();
      if (!res?.ok) {
        setAvailableMCoinBalance(0);
        return;
      }

      const json = await res.json();
      console.log("getAvailableMCoinBalance json:", json);

      const applied = Number(
        json?.data?.coins ??
        json?.data?.availableMCoinBalance ??
        json?.availableMCoinBalance ??
        0
      );

      setAvailableMCoinBalance(applied > 0 ? applied : 0);
    } catch (e) {
      console.error("getAvailableMCoinBalance error:", e);
      setAvailableMCoinBalance(0);
    }
  };
  
  useEffect(() => {
    loadAppliedMCoin();
  }, []);
  
  const finalTotalPayable = Math.max(
    0,
    Number(totalPayable || 0) - Number(savedAppliedCoinValue || 0)
  );

  useEffect(() => {
    const storedCoins = localStorage.getItem("appliedCoins");
    if (storedCoins) {
      setSavedAppliedCoins(Number(storedCoins));
    }
  }, []);

  const handleCoinChange = async(e) => {
    let value = e.target.value;
    if (value === "") {
      setAppliedCoins("");
      return;
    }
    value = Number(value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > availableMCoinBalance) {
      value = availableMCoinBalance;
    }
    setAppliedCoins(value);
    // await getAvailableMCoinBalance();
  };

  const handleApplyCoins = async () => {
    if (mCoinLoading) return;
    const coinCount = Number(appliedCoins || 0);
    if (!coinCount || coinCount <= 0) {
      showToast("error", "Please enter valid coins");
      return;
    }
    await getAvailableMCoinBalance();
    if (coinCount > availableMCoinBalance) {
      showToast("error", "Cannot exceed available balance");
      return;
    }
    const rupeeValue = Math.floor(coinCount / 250);
    if (rupeeValue <= 0) {
      showToast("error", "Coins too low");
      return;
    }
    if (rupeeValue > Number(totalPayable || 0)) {
      showToast("error", "Cannot exceed total payable");
      return;
    }
    try {
      setMCoinLoading(true);
      const res = await applyMCoin({ applied_m_coins: coinCount });
      const json = await res.json();
      if (json?.res === false) {
        showToast("error", json?.msg || "Failed to apply");
        return;
      } else {
        showToast("success", json?.msg || "Successfully applied M Coin.");
        setSavedAppliedCoins(coinCount);
        setAppliedCoins("");
        await getAvailableMCoinBalance();
        setPayWithMCoin(true);
      }
      
    } catch (e) {
      console.error(e);
      showToast("error", "Apply failed");
    } finally {
      setMCoinLoading(false);
    }
  };
  
  const handleRemoveAppliedCoins = async () => {
    try {
      setMCoinLoading(true);
      const res = await removeMCoin();
      if (!res?.ok) {
        let msg = "Failed to remove applied M Coin";
        try {
          const errJson = await res.json();
          msg = errJson?.msg || errJson?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const json = await res.json().catch(() => ({}));

      if (json?.res === false) {
        showToast("error", json?.msg || "Failed to remove applied M Coin");
        return;
      }
      showToast("success", json?.msg || "Applied M Coin removed");
      setSavedAppliedCoins(0);
      setAppliedCoins("");
      await loadAppliedMCoin();
      await getAvailableMCoinBalance();
      await cartData();
    } catch (e) {
      console.error("removeMCoin error:", e);
      showToast("error", e?.message || "Failed to remove applied M Coin");
    } finally {
      setMCoinLoading(false);
    }
  };
  // ----------------------------------------------

  

  // Save for later with loader start
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  const navigate = useNavigate();
  const location = useLocation();
  const isPaymentPage = location.pathname === "/payment";

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    if(location.pathname == "/company"){
      const addressId = Number(selectedAddressId);
      // ✅ address select validation
      if (!selectedAddressId || Number(selectedAddressId) <= 0) {
        alert("Please select shipping address");
        return;
      }
      
    }
    
    setCheckoutLoading(true);
    try {
      if(location.pathname == "/company"){
        // ✅ call API
        const addressId = Number(selectedAddressId);
        const res = await updateShippingAddressToCart(addressId);

        // If your function returns JSON directly:
        const json = res?.res !== undefined ? res : await res.json?.();

        if (!json?.res) {
          alert(json?.msg || "Failed to update shipping address");
          return;
        }
      }

      // ✅ success -> navigate
      if (isPaymentPage) {
      }else if(location.pathname == '/company'){
        navigate("/confirmation");
      } else if(location.pathname == '/confirmation'){
        const res = await orderSubmit();
        const json = res?.res !== undefined ? res : await res.json?.();
        navigate("/payment", { state: { orderRes: json } });
        // navigate("/payment");
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "Something went wrong");
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isCartVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartVisible]);

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

  // Show Message
  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const removeAppliedOffer = async (offerId) => {
    try {
      const res = await removeOffer(offerId); // or applyOffer({ offer_id: offerId })
      const json = await res.json(); // ✅ must read response body
      if (json?.res === false) {
        alert(json?.msg || "Offer removed failed");
        await onApplied?.();
        return;
      }else{
        setofferApplied("0");
        alert(json?.msg || "Remove offer.");
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "Something went wrong");
    } finally {
      await onApplied?.(); // ✅ always refresh cart
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const noCreditTotal = cartItems .filter((i) => i.noCredit) .reduce((sum, item) => sum + item.price, 0);  

  return (
    <>
      <div className="cart-summary">
        <div className="cart-panel-header">
          {/* <button className="cart-close-btn" onClick={handlegohome}>
            <FiX />
          </button> */}
        </div>

        <div className="cart-summary">
          {/* <div className="cart-panel-header">
            <button className="cart-close-btn" onClick={toggleCart}>
              <FiX />
            </button>
          </div> */}

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

            <div className="mcoin-balance">
              <div>
                <span className="label">You Can Earn M Coins with this order</span>
                <strong>{earnMCoinBalance}</strong>
              </div>
              <div className="value">
                ₹{Math.floor(earnMCoinBalance / 250)}
              </div>
            </div>
            {availableMCoinBalance > 0 && (
              <>
                <div className="pay-mcoin-toggle">
                  <label className="pay-mcoin-checkbox" style={{width:'62%'}}>
                    <input
                      type="checkbox"
                      checked={payWithMCoin}
                      onChange={handlePayWithMCoinToggle}
                      disabled={mCoinLoading}
                    />
                    <span>Pay With M Coin</span>
                  </label>
                </div>

                {payWithMCoin && (
                  <div className="mcoin-card">
                    <div className="mcoin-header">
                      <h4>M Coin Wallet</h4>
                      <p>Use your coins and save more on this order</p>
                    </div>

                    <div className="mcoin-balance">
                      <div>
                        <span className="label">Available Coins</span>
                        <strong>{availableMCoinBalance}</strong>
                      </div>
                      <div className="value">
                        ₹{Math.floor(availableMCoinBalance / 250)}
                      </div>
                    </div>

                    {savedAppliedCoins > 0 ? (
                      <div className="mcoin-applied">
                        <div className="mcoin-applied-left">
                          <span className="label">Applied Coins</span>
                          <strong className="coins">{savedAppliedCoins} Coins</strong>
                          <div className="value">₹{savedAppliedCoinValue}</div>
                        </div>

                        <button
                          type="button"
                          className="mcoin-delete-btn"
                          onClick={handleRemoveAppliedCoins}
                          disabled={mCoinLoading}
                        >
                          {mCoinLoading ? (
                            <span className="mcoin-delete-loader"></span>
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="mcoin-apply">
                        <label htmlFor="mcoinInput" className="mcoin-label">
                          Apply Coins
                          <span>₹{appliedCoinValue}</span>
                        </label>

                        <div className="mcoin-input-row">
                          <input
                            id="mcoinInput"
                            type="number"
                            className="mcoin-input"
                            placeholder="Enter coins"
                            value={appliedCoins}
                            onChange={handleCoinChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyCoins();
                              }
                            }}
                            min={0}
                            max={availableMCoinBalance}
                          />

                          <button
                            type="button"
                            onClick={handleApplyCoins}
                            disabled={mCoinLoading}
                          >
                            {mCoinLoading ? "Applying..." : "Apply"}
                          </button>
                        </div>

                        <small>Max: {availableMCoinBalance} coins</small>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <button className="download-pdf" onClick={downloadStatement}>
              <BsCloudArrowDownFill />{" "}
              {downloading ? "Downloading..." : "Download Statement"}
            </button>
          </div>
        </div>
        {/* Cart Footer */}
            <div className="cart-panel-footer">
              <div className="subtotal">
                <div className="subtotal-main">
                  {savedAppliedCoinValue > 0 && (
                    <div
                      style={{
                        display: "block",
                        width: "100%",
                        color: "#077807",
                        marginTop: "6px",
                        fontSize: "13px",
                        lineHeight: "18px",
                      }}
                    >
                      M Coin Discount Applied: - ₹ {savedAppliedCoinValue}
                    </div>
                  )}
                </div>
              </div>
              <div className="subtotal">
                <div className="subtotal-main">
                  Total Payable: <span>₹ {finalTotalPayable}</span>
                </div>
              </div>
              <button
                className={`checkout-btn ${canCheckout && !checkoutLoading ? "" : "disabled"}`}
                onClick={handleCheckout}
                disabled={!canCheckout || checkoutLoading}
              >
                {butnText}
                {checkoutLoading && <span className="btn-loader" />}
              </button>
            </div>
      </div>
    </>
  );
};
export default CartSummary;
