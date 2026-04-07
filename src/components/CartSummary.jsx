import { useState, useEffect } from "react";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
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

const CartSummary = ({
  isCartVisible,
  onApplied,
  afterAppliedRefresh,
  selectedAddressId,
  canCheckout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPaymentPage = location.pathname === "/payment";

  const [cartItems, setCartItems] = useState([]);
  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [noCreditItemTotalAmount, setNoCreditItemTotalAmount] = useState(0);
  const [overDueAmount, setOverDueAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const [offerApplied, setofferApplied] = useState(0);
  const [appliedOfferDetails, setAppliedOfferDetails] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [butnText, setButnText] = useState("Complete");
  const [cartCount, setCartCount] = useState(0);
  const [saveForLaterItems, setSaveForLaterItems] = useState([]);
  const [saveForLaterCount, setSaveForLaterCount] = useState(0);
  const [saveForLaterCategory, setSaveForLaterCategory] = useState([]);
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState([]);

  // ✅ only from cart API
  const [mCoinRedeemPoint, setMCoinRedeemPoint] = useState(null);

  const [availableMCoinBalance, setAvailableMCoinBalance] = useState(0);
  const [earnMCoinBalance, setEarnMCoin] = useState(0);
  const [appliedCoins, setAppliedCoins] = useState("");
  const [savedAppliedCoins, setSavedAppliedCoins] = useState(0);
  const [mCoinLoading, setMCoinLoading] = useState(false);
  const [payWithMCoin, setPayWithMCoin] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // ✅ no hardcoded redeem point, only safe guard
  const hasValidRedeemPoint = Number(mCoinRedeemPoint) > 0;

  const getCoinValueInRupees = (coins) => {
    if (!hasValidRedeemPoint) return 0;
    return Math.floor(Number(coins || 0) / Number(mCoinRedeemPoint));
  };

  const appliedCoinValue = getCoinValueInRupees(appliedCoins);
  const savedAppliedCoinValue = getCoinValueInRupees(savedAppliedCoins);

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

        const redeemPointRaw = responseData?.m_coin_redeem_point;
        const redeemPoint =
          redeemPointRaw !== null &&
          redeemPointRaw !== undefined &&
          redeemPointRaw !== ""
            ? Number(redeemPointRaw)
            : null;

        setCartItems(cart_item);
        setCartCount(cart_item.length);

        setCartSubTotal(otherTotal);
        setNoCreditItemTotalAmount(noCreditTotal);
        setOverDueAmount(overDue);

        setAvailableMCoinBalance(Number(responseData.availableMCoinBalance || 0));
        setEarnMCoin(Number(responseData.earnMCoin || 0));

        // ✅ set only from API
        setMCoinRedeemPoint(
          redeemPoint && !Number.isNaN(redeemPoint) && redeemPoint > 0
            ? redeemPoint
            : null
        );

        setSubTotal(otherTotal + noCreditTotal);
        setTotalPayable(payable);

        setSaveForLaterItems(save_for_later);
        setSaveForLaterCount(save_for_later.length);
        setSaveForLaterCategory(save_for_later_category);

        setAppliedOfferDetails(offerDetails);
        setofferApplied(responseData.applied_offer_id != null ? "1" : "0");

        setSelectedCartIds((prev) =>
          prev.filter((id) => cart_item.some((x) => String(x.id) === String(id)))
        );
        setSelectedSavedIds((prev) =>
          prev.filter((id) =>
            save_for_later.some((x) => String(x.id) === String(id))
          )
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

      if (responseData?.res) {
        const cart_item = responseData.cart_item || [];
        const cartSubTotal = Number(responseData.other_item_total_amount || 0);
        const noCreditItemTotalAmount = Number(
          responseData.no_credit_item_total_amount || 0
        );
        const overDueAmount = Number(responseData.over_due_amount || 0);
        const totalPayableAmount = Number(responseData.payable_amount || 0);
        const applied_offer_details = responseData.offerDetails || [];

        const redeemPointRaw = responseData?.m_coin_redeem_point;
        const redeemPoint =
          redeemPointRaw !== null &&
          redeemPointRaw !== undefined &&
          redeemPointRaw !== ""
            ? Number(redeemPointRaw)
            : null;

        setCartItems(cart_item);
        setCartCount(cart_item.length);

        setCartSubTotal(cartSubTotal);
        setNoCreditItemTotalAmount(noCreditItemTotalAmount);
        setOverDueAmount(overDueAmount);

        setAvailableMCoinBalance(Number(responseData.availableMCoinBalance || 0));
        setEarnMCoin(Number(responseData.earnMCoin || 0));

        // ✅ set only from API
        setMCoinRedeemPoint(
          redeemPoint && !Number.isNaN(redeemPoint) && redeemPoint > 0
            ? redeemPoint
            : null
        );

        setSubTotal(cartSubTotal + noCreditItemTotalAmount);
        setTotalPayable(totalPayableAmount);
        setAppliedOfferDetails(applied_offer_details);
        setofferApplied(responseData.applied_offer_id != null ? "1" : "0");

        setSaveForLaterItems(responseData.save_for_later || []);
        setSaveForLaterCount((responseData.save_for_later || []).length);
        setSaveForLaterCategory(responseData.save_for_later_category || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    cartPageData();

    const handler = () => cartPageData();

    if (location.pathname === "/cart") {
      canCheckout = "";
      setButnText("Proceed to shipping");
    } else if (location.pathname === "/company") {
      canCheckout = "";
      setButnText("Proceed to checkout");
    } else if (location.pathname === "/confirmation") {
      canCheckout = "";
      setButnText("Proceed to confirmation");
    } else if (location.pathname === "/payment") {
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

    for (const item of cartItems) {
      const qty = Number(item.quantity || 1);
      const lineTotal = Number(item.price || 0) * qty;

      if (item?.product?.cash_and_carry_item == 1) noCredit += lineTotal;
      else other += lineTotal;
    }

    setCartSubTotal(other);
    setNoCreditItemTotalAmount(noCredit);
    setSubTotal(other + noCredit);
  }, [cartItems]);

  const loadAppliedMCoin = async () => {
    try {
      const res = await getMCoin();
      if (!res?.ok) {
        setSavedAppliedCoins(0);
        return;
      }

      const json = await res.json();

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

  const handleCoinChange = (e) => {
    let value = e.target.value;

    if (value === "") {
      setAppliedCoins("");
      return;
    }

    value = Number(value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > availableMCoinBalance) value = availableMCoinBalance;

    setAppliedCoins(value);
  };

  const handleApplyCoins = async () => {
    if (mCoinLoading) return;

    if (!hasValidRedeemPoint) {
      showToast("error", "M Coin redeem point not available");
      return;
    }

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

    const rupeeValue = getCoinValueInRupees(coinCount);

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
      }

      showToast("success", json?.msg || "Successfully applied M Coin.");
      setSavedAppliedCoins(coinCount);
      setAppliedCoins("");
      await getAvailableMCoinBalance();
      setPayWithMCoin(true);
      await cartData();
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

  const handleCheckout = async () => {
    if (checkoutLoading) return;

    if (location.pathname === "/company") {
      if (!selectedAddressId || Number(selectedAddressId) <= 0) {
        alert("Please select shipping address");
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      if (location.pathname === "/company") {
        const addressId = Number(selectedAddressId);
        const res = await updateShippingAddressToCart(addressId);
        const json = res?.res !== undefined ? res : await res.json?.();

        if (!json?.res) {
          alert(json?.msg || "Failed to update shipping address");
          return;
        }
      }

      if (isPaymentPage) {
      } else if (location.pathname === "/company") {
        navigate("/confirmation");
      } else if (location.pathname === "/confirmation") {
        const res = await orderSubmit();
        const json = res?.res !== undefined ? res : await res.json?.();
        navigate("/payment", { state: { orderRes: json } });
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
    a.setAttribute("download", fileName);
    a.setAttribute("target", "_blank");
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
    } catch (e) {
      console.error(e);
      alert(e.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const removeAppliedOffer = async (offerId) => {
    try {
      const res = await removeOffer(offerId);
      const json = await res.json();

      if (json?.res === false) {
        alert(json?.msg || "Offer removed failed");
        await onApplied?.();
        return;
      }

      setofferApplied("0");
      alert(json?.msg || "Remove offer.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Something went wrong");
    } finally {
      await onApplied?.();
    }
  };

  return (
    <>
      <div className="cart-summary">
        <div className="cart-panel-header"></div>

        <div className="cart-summary">
          <div className="cart-summary-content">
            <h3>Summary</h3>

            <label>
              No Credit Item Subtotal:<span>₹ {noCreditItemTotalAmount}</span>
            </label>

            <label>
              Other Item Subtotal:<span>₹ {cartSubTotal}</span>
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
                ₹{getCoinValueInRupees(earnMCoinBalance)}
              </div>
            </div>

            {availableMCoinBalance > 0 && (
              <>
                <div className="pay-mcoin-toggle">
                  <label className="pay-mcoin-checkbox" style={{ width: "62%" }}>
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
                        ₹{getCoinValueInRupees(availableMCoinBalance)}
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
                            disabled={mCoinLoading || !hasValidRedeemPoint}
                          >
                            {mCoinLoading ? "Applying..." : "Apply"}
                          </button>
                        </div>

                        <small>
                          Max: {availableMCoinBalance} coins
                          {!hasValidRedeemPoint ? " | Redeem point loading..." : ""}
                        </small>
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
            className={`checkout-btn ${
              canCheckout && !checkoutLoading ? "" : "disabled"
            }`}
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