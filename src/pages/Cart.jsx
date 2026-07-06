import { useState, useRef, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { FiTrash2 } from "react-icons/fi";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";

import SaveLatericon from "../assets/icons/SaveLatericon.svg";
import SaveLatericon1 from "../assets/icons/SaveLatericon1.svg";
import Deleteicon from "../assets/icons/Deleteicon.svg";

import cartllink1 from "../assets/icons/cartllink1.svg";
import cartllink2 from "../assets/icons/cartllink2b.svg";
import cartllink3 from "../assets/icons/cartllink3b.svg";
import cartllink4 from "../assets/icons/cartllink4b.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import noImage from "../assets/images/no-image.png";

import OfferModal from "../components/OfferModal.jsx";
import CartSummary from "../components/CartSummary.jsx";

import Swal from "sweetalert2";

import {
  cart,
  updateQuantity,
  saveForLater,
  moveToCart,
  saveAllNoCreditItems,
  moveAllNoCreditItems,
  moveToCartAllSelectedItems,
  saveForLaterAllSelectedItems,
  deleteFromSaveForLaterItem,
  removeOffer,
  statementDownload,
  updateProductQty,
  updateCartItemPrice,
  applyMCoin, 
  getMCoin, 
  removeMCoin,
  getAvailableMCoin, 
} from "../api/apiRequest";

// ✅ helper: read staff id safely from localStorage
function getStoredStaffId() {
  const raw = localStorage.getItem("mazingBusinessStaffId");
  if (!raw) return "";

  let val = "";
  try {
    val = JSON.parse(raw); // if stored using JSON.stringify(...)
  } catch {
    val = raw;
  }

  const decoded = safeBase64Decode(val);

  // if decode succeeded return decoded, else return original string
  return decoded ? String(decoded) : String(val || "");
}

function safeBase64Decode(input) {
  if (!input) return "";

  try {
    // remove quotes if any
    const s = String(input).trim().replace(/^"|"$/g, "");

    // handle base64url (sometimes "-" "_" instead of "+" "/")
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");

    // add missing padding
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");

    return atob(padded);
  } catch (e) {
    // not valid base64 or decode failed
    return "";
  }
}

/** ✅ helpers (no hooks here) */
const renderWarrantyTag = (product) => {
  if (!product?.is_warranty) return null;
  return (
    <div className="delivery">
      <img
        src={warrantyIcon}
        alt="Warranty"
        loading="lazy"
        style={{ width: "50px", height: "auto" }}
      />
    </div>
  );
};

const fastDeliveryTag = (product) => {
  if (Number(product?.fast_delivery_tag) !== 1) return null;
  return (
    <div className="delivery">
      <img
        src={fastDeliveryIcon}
        alt="Fast Delivery"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
};

const twoDecimal = (value) => {
  const numeric = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
};

const Cart = ({ isCartVisible, toggleCart }) => {

  const [cartItems, setCartItems] = useState([]);
  const [selectedCartIds, setSelectedCartIds] = useState([]);   // ✅ cart selection
  const [selectedSavedIds, setSelectedSavedIds] = useState([]); // ✅ saved selection

  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [noCreditItemTotalAmount, setNoCreditItemTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [overDueAmount, setOverDueAmount] = useState(0);

  const [subTotal, setSubTotal] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  const [cartLoading, setCartLoading] = useState(false);
  const [updatingQty, setUpdatingQty] = useState({}); // { [cartId]: true/false }

  const [saveForLaterItems, setSaveForLaterItems] = useState([]);
  const [saveForLaterCount, setSaveForLaterCount] = useState(0);
  const [saveForLaterCategory, setSaveForLaterCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All"); // ✅ normalize

  const [offerApplied, setofferApplied] = useState(0);
  const [appliedOfferDetails, setAppliedOfferDetails] = useState(null); // can be object
  const [downloading, setDownloading] = useState(false);

  const [movingLoading, setMovingLoading] = useState(false);
  const [noCreditLoading, setNoCreditLoading] = useState(false);
  const [saveNoCreditLoading, setSaveNoCreditLoading] = useState(false);
  const [saveCheckedLoading, setSaveCheckedLoading] = useState(false);

  const [qtyAlertsById, setQtyAlertsById] = useState({});
  const [savedItems, setSavedItems] = useState([]);

  

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

  // ------ M Coin
  const [availableMCoinBalance, setAvailableMCoinBalance] = useState(0);
  const [mCoinRedeemPoint, setMCoinRedeemPoint] = useState(0);
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
      // await cartData();
    } catch (e) {
      console.error("removeMCoin error:", e);
      showToast("error", e?.message || "Failed to remove applied M Coin");
    } finally {
      setMCoinLoading(false);
    }
  };
  // ----------------------------------------------
  
  
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

  const navigate = useNavigate();

  // Edit Price -----
  const staffId = useMemo(() => getStoredStaffId(), []);
  const PRICE_EDIT_STAFF = useMemo(() => new Set(["180", "169", "25606"]), []);
  const canEditPrice = PRICE_EDIT_STAFF.has(String(staffId || ""));
  const [editPriceById, setEditPriceById] = useState({});      // { [itemId]: "123" }
  const [priceUpdatingById, setPriceUpdatingById] = useState({}); // { [itemId]: true/false }
  useEffect(() => {
    const map = {};
    cartItems.forEach((it) => (map[it.id] = String(it.price ?? "")));
    setEditPriceById(map);
  }, [cartItems]);

  // Create handler for Update button
  const handleUpdatePrice = async (itemId) => {
    const priceStr = editPriceById[itemId];
    const priceNum = Number(priceStr);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      alert("Enter valid price");
      return;
    }
    try {
      setPriceUpdatingById((p) => ({ ...p, [itemId]: true }));
      await updateCartItemPrice({ id: itemId, price: priceNum });
      // ✅ update UI locally (or call your fetchCart())
      setCartItems((prev) =>
        prev.map((x) => (x.id === itemId ? { ...x, price: priceNum } : x))
      );
    } catch (err) {
      console.error(err);
      alert(err?.message || "Price update failed");
    } finally {
      setPriceUpdatingById((p) => ({ ...p, [itemId]: false }));
    }
  };
  // Edit Price End ---------

  /**
   * ✅ refs for debounce + latest cartItems
   */
  const cartItemsRef = useRef([]);
  const qtyTimersRef = useRef({}); // { [cartId]: timeoutId }

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // ✅ cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(qtyTimersRef.current || {}).forEach((t) => clearTimeout(t));
      qtyTimersRef.current = {};
    };
  }, []);

  const cartPageData = async () => {
    setCartLoading(true);
    try {
      const responseData = await cart();
      if (responseData?.res) {
        const cart_item = responseData.cart_item || [];

        const otherTotal = Number(responseData.other_item_total_amount || 0);
        const noCreditTotal = Number(responseData.no_credit_item_total_amount || 0);
        const overDue = Number(responseData.over_due_amount || 0);
        const payable = Number(responseData.payable_amount || 0);

        // could be object or array based on your backend
        const offerDetails = responseData.offerDetails ?? null;

        const save_for_later = responseData.save_for_later || [];
        const save_for_later_category = responseData.save_for_later_category || [];

        const availableMCoin = Number(responseData.availableMCoinBalance || 0);
        const earnMCoin = Number(responseData.earnMCoin || 0);

        const redeemPointRaw = responseData?.m_coin_redeem_point;
        const redeemPoint =
          redeemPointRaw !== null &&
          redeemPointRaw !== undefined &&
          redeemPointRaw !== ""
            ? Number(redeemPointRaw)
            : null;

        // ✅ set only from API
        setMCoinRedeemPoint(
          redeemPoint && !Number.isNaN(redeemPoint) && redeemPoint > 0
            ? redeemPoint
            : null
        );

        setAvailableMCoinBalance(availableMCoin);
        setMCoinRedeemPoint(mCoinRedeemPoint);
        setEarnMCoin(earnMCoin);

        setCartItems(cart_item);
        setCartCount(cart_item.length);

        setCartSubTotal(otherTotal);
        setNoCreditItemTotalAmount(noCreditTotal);
        setOverDueAmount(overDue);

        setSubTotal(otherTotal + noCreditTotal);
        setTotalPayable(payable);

        setSaveForLaterItems(save_for_later);
        setSaveForLaterCount(save_for_later.length);
        setSaveForLaterCategory(save_for_later_category);

        setAppliedOfferDetails(offerDetails);
        setofferApplied(responseData.applied_offer_id != null ? "1" : "0");

        // ✅ if cart changed, clean selections that no longer exist
        setSelectedCartIds((prev) => prev.filter((id) => cart_item.some((x) => String(x.id) === String(id))));
        setSelectedSavedIds((prev) => prev.filter((id) => save_for_later.some((x) => String(x.id) === String(id))));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  const checkQtyAlert = async (item) => {
    try {
      const productId = item?.product?.id || item?.product_id;
      const qty = Number(item?.quantity || 1);
      if (!productId || qty <= 0) return;

      const data = await updateProductQty(productId, qty);
      const msg = (data?.increasePriceText || "").trim();

      setQtyAlertsById((prev) => {
        if (msg) return { ...prev, [item.id]: msg };
        if (!prev[item.id]) return prev;
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (e) {
      console.error("checkQtyAlert error:", e);
    }
  };

  /** ✅ Build savedItems from API */
  useEffect(() => {
    const initialSavedItems = (saveForLaterItems || []).map((it) => ({
      id: it?.id,
      name: it?.product?.name || it?.product_name || "",
      price: Number(it?.price || it?.product?.unit_price || 0),
      qty: Number(it?.quantity || 0),
      category: it?.product?.category?.name || "UNCATEGORIZED",
      image: it?.product?.images?.[0]?.file_name || "",
      cash_and_carry_item: it?.product?.cash_and_carry_item || "0",
    }));
    setSavedItems(initialSavedItems);
  }, [saveForLaterItems]);

  const getImageUrl = (url) => {
    if (!url) return noImage;
    if (String(url).startsWith("http")) return url;
    const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://mazingbusiness.com";
    return `${BACKEND}/${String(url).replace(/^\/+/, "")}`;
  };

  const getProductImage = (product) => {
    const url = product?.images?.[0]?.file_name;
    if (!url) return noImage;
    if (String(url).startsWith("http")) return url;
    const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://mazingbusiness.com";
    return `${BACKEND}/${String(url).replace(/^\/+/, "")}`;
  };

  /**
   * ✅ Debounced quantity update
   */
  const handleQtyChange = (itemId, rawValue) => {
    const newQty = Math.max(1, Number(rawValue) || 1);

    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );

    if (qtyTimersRef.current[itemId]) {
      clearTimeout(qtyTimersRef.current[itemId]);
      delete qtyTimersRef.current[itemId];
    }

    setUpdatingQty((p) => ({ ...p, [itemId]: true }));

    qtyTimersRef.current[itemId] = setTimeout(async () => {
      try {
        await updateQuantity({ cart_id: itemId, quantity: newQty });

        const currentItem = (cartItemsRef.current || []).find((x) => x.id === itemId);
        if (currentItem) {
          await checkQtyAlert({ ...currentItem, quantity: newQty });
        }

        await cartPageData();
      } catch (err) {
        console.error(err);
        await cartPageData();
      } finally {
        setUpdatingQty((p) => ({ ...p, [itemId]: false }));
        if (qtyTimersRef.current[itemId]) {
          clearTimeout(qtyTimersRef.current[itemId]);
          delete qtyTimersRef.current[itemId];
        }
      }
    }, 700);
  };

  /**
   * ✅ Blur flushes pending debounce (if exists). No double call.
   */
  const handleQtyBlur = async (item) => {
    const itemId = item?.id;
    if (!itemId) return;

    if (qtyTimersRef.current[itemId]) {
      clearTimeout(qtyTimersRef.current[itemId]);
      delete qtyTimersRef.current[itemId];

      setUpdatingQty((p) => ({ ...p, [itemId]: true }));
      try {
        await updateQuantity({ cart_id: itemId, quantity: Number(item.quantity || 1) });
        await checkQtyAlert(item);
        await cartPageData();
      } catch (err) {
        console.error(err);
        await cartPageData();
      } finally {
        setUpdatingQty((p) => ({ ...p, [itemId]: false }));
      }
    }
  };

  /** ✅ initial load */
  useEffect(() => {
    cartPageData();
  }, []);

  /** ✅ compute totals locally for UI */
  useEffect(() => {
    let other = 0;
    let noCredit = 0;

    for (const item of cartItems) {
      const qty = Number(item?.quantity || 1);
      const lineTotal = Number(item?.price || 0) * qty;

      if (Number(item?.product?.cash_and_carry_item) === 1) noCredit += lineTotal;
      else other += lineTotal;
    }

    setCartSubTotal(other);
    setNoCreditItemTotalAmount(noCredit);
    setSubTotal(other + noCredit);
  }, [cartItems]);

  useEffect(() => {
    if (isCartVisible) setSelectedCategory("All");
  }, [isCartVisible]);

  // Save for later with loader start
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  const moveToSaveForLater = async (cart_id) => {
    if (!cart_id) return console.error("Invalid cart_id:", cart_id);
    try {
      setActionLoading({ id: cart_id, type: "save" });
      await saveForLater({ cart_id: Number(cart_id) });
      await cartPageData();
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
      await cartPageData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const moveToSaveAllNoCreditItems = async () => {
    setSaveNoCreditLoading(true);
    try {
      await saveAllNoCreditItems();
      await cartPageData();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to save no-credit items.");
    } finally {
      setSaveNoCreditLoading(false);
    }
  };

  const moveAllNoCreditItemsToCart = async () => {
    setNoCreditLoading(true);
    try {
      await moveAllNoCreditItems();
      await cartPageData();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to move no-credit items.");
    } finally {
      setNoCreditLoading(false);
    }
  };

  const deleteFromCart = async (id, qty) => {
    await updateQuantity({ cart_id: id, quantity: Number(qty) }); // ✅ number
    await cartPageData();
  };

  const deleteFromSaved = async (id) => {
    await deleteFromSaveForLaterItem({ id });
    await cartPageData();
  };

  const handleCheckout = () => navigate("/company");

  // ✅ cart checkbox handler
  const handleCartCheckbox = (id) => {
    const cid = String(id);
    setSelectedCartIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  };

  // ✅ saved checkbox handler
  const handleSavedCheckbox = (id) => {
    const sid = String(id);
    setSelectedSavedIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const toggleSelectAllCart = () => {
    if (!cartItems.length) return;
    if (selectedCartIds.length === cartItems.length) setSelectedCartIds([]);
    else setSelectedCartIds(cartItems.map((item) => String(item.id)));
  };

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

  const handleMoveCheckedToCart = async () => {
    const idsCsv = (savedItems || [])
      .filter((it) => selectedSavedIds.includes(String(it.id)))
      .map((it) => String(it.id))
      .join(",");

    if (!idsCsv) return;

    setMovingLoading(true);
    try {
      await moveToCartAllSelectedItems({ idsCsv });
      await cartPageData();
      setSelectedSavedIds([]); // ✅ clear after move
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to move items.");
    } finally {
      setMovingLoading(false);
    }
  };

  // ✅ SAVE checked CART items for later (FIXED)
  const handleSaveForLaterAllCheckedToCart = async () => {
    const idsCsv = (cartItems || [])
      .filter((it) => selectedCartIds.includes(String(it.id))) // ✅ FIX
      .map((it) => String(it.id))
      .join(",");

    if (!idsCsv) return;

    setSaveCheckedLoading(true);
    try {
      await saveForLaterAllSelectedItems({ idsCsv });
      await cartPageData();
      setSelectedCartIds([]); // ✅ clear after save
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to save items for later.");
    } finally {
      setSaveCheckedLoading(false);
    }
  };

  const categoryCounts = (savedItems || []).reduce((acc, item) => {
    const category = item.category || "UNCATEGORIZED";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const removeAppliedOffer = async (offerId) => {
    try {
      const res = await removeOffer(offerId);
      const json = await res.json();
      if (json?.res === false) {
        alert(json?.msg || "Offer remove failed");
        await cartPageData();
        return;
      }
      alert(json?.msg || "Offer removed.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Something went wrong");
    } finally {
      await cartPageData();
    }
  };

  const filteredSavedItems =
    selectedCategory === "All"
      ? savedItems
      : savedItems.filter(
          (item) => (item.category || "UNCATEGORIZED") === selectedCategory
        );

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
                  <Link className="deactive">
                    <img src={cartllink2} alt="MenuIcon" /> Shipping Company
                  </Link>
                  <Link className="deactive">
                    <img src={cartllink4} alt="MenuIcon" /> Confirmation
                  </Link>
                  <Link className="deactive">
                    <img src={cartllink3} alt="MenuIcon" /> Payment
                  </Link>
                </div>
              </div>

              <div className="cart-left-rgt">
                <div className="cart-left">
                  {/* Shopping Cart */}
                  {cartItems.length > 0 && (
                    <div className="cart-section">
                      <h2>
                        <span className="Cartitem">{cartItems.length} Items</span>
                      </h2>

                      <div className="order-table-container2">
                        <table className="order-table">
                          <thead>
                            <tr>
                              <th data-label="">
                                <label className="animated-checkbox">
                                  <input
                                    type="checkbox"
                                    onChange={toggleSelectAllCart}
                                    checked={
                                      cartItems.length > 0 &&
                                      selectedCartIds.length === cartItems.length
                                    }
                                  />
                                  <span className="custom-check"></span>
                                </label>
                              </th>
                              <th className="narrow1" data-label="Product">
                                Product
                              </th>
                              <th data-label="Price">Price</th>
                              <th className="narrow3" data-label="Added Quantity">
                                Quantity
                              </th>
                              <th data-label="Total">Total</th>
                              <th data-label="Action">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {cartItems.map((item) => (
                              <tr
                                key={item.id}
                                className={item?.applied_offer_id != null ? "tem-row" : ""}
                              >
                                <td data-label="">
                                  {item?.product?.is_reward_product == 0 && (
                                    <label className="animated-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={selectedCartIds.includes(String(item.id))} // ✅ FIX
                                        onChange={() => handleCartCheckbox(item.id)}        // ✅ FIX
                                      />
                                      <span className="custom-check"></span>
                                    </label>
                                  )}
                                </td>

                                <td className="narrow1" data-label="Product">
                                  <div className="cartproduct">
                                    <img
                                      src={getProductImage(item?.product)}
                                      alt={item?.product?.name || "Product"}
                                      width="70"
                                      onError={(e) => {
                                        e.currentTarget.src = noImage;
                                      }}
                                    />
      
                                    <div className="cartproduct-details">
                                      <span className="product-name">{item?.product?.name}</span>
                                      {item?.product?.is_reward_product == 0 && (
                                        <span className="m-coin">
                                          Earn M Coin :{" "}
                                          <strong>
                                            {(() => {
                                              const lineAmount =
                                                Number(item.price || 0) * Number(item.quantity || 1);
        
                                              const itemMCoin =
                                                Number(item?.product?.current_stock) === 1
                                                  ? Number(item?.product?.c_instock_m_coin || 0) * lineAmount
                                                  : Number(item?.product?.c_m_coin || 0) * lineAmount;
        
                                              return twoDecimal(itemMCoin);
                                            })()}
                                          </strong>
                                        </span>
                                      )}
      
                                      {item?.product?.cash_and_carry_item == 1 && (
                                        <span className="no-credit">No Credit Item</span>
                                      )}
      
                                      {item?.applied_offer_id != null && (
                                        <span className="applied-offer-tag">
                                          {appliedOfferDetails?.offer_name} Offer Applied
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="ratingGrp">
                                    {item.applied_offer_id != null && (
                                      <span
                                        className="applied-offer-tag"
                                        style={{ position: "static" }}
                                      >
                                        {appliedOfferDetails?.offer_name} Offer Applied
                                      </span>
                                    )}
                                    <div className="ratingGrpLft">
                                      {renderWarrantyTag(item.product)}
                                    </div>
                                    {fastDeliveryTag(item.product)}
                                  </div>

                                  {/* ✅ RED ALERT BOX */}
                                  {item?.product?.is_reward_product == 0 && qtyAlertsById[item.id] && (
                                    <div className="ratingGrp">
                                      {qtyAlertsById[item.id] && (
                                        <div
                                          style={{
                                            marginTop: "2px",
                                            padding: "6px 8px",
                                            border: "1px solid #ff4d4f",
                                            background: "#fff1f0",
                                            color: "#ff4d4f",
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600,
                                          }}
                                        >
                                          {qtyAlertsById[item.id]}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td className="cartprice" data-label="Price">
                                  {canEditPrice ? (
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                      <span>₹</span>

                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editPriceById[item.id] ?? ""}
                                        onChange={(e) =>
                                          setEditPriceById((p) => ({ ...p, [item.id]: e.target.value }))
                                        }
                                        style={{ width: 90, padding: "6px 8px" }}
                                      />

                                      <button type="button" onClick={() => handleUpdatePrice(item.id)} disabled={!!priceUpdatingById[item.id]}
                                        style={{
                                          padding: "6px 10px",
                                          borderRadius: 6,
                                          border: "1px solid #ddd",
                                          cursor: "pointer",
                                          background: "aqua"
                                        }}
                                      >
                                        {priceUpdatingById[item.id] ? "Updating..." : "Update"}
                                      </button>
                                    </div>
                                  ) : (
                                    <>₹ {twoDecimal(item.price)}</>
                                  )}
                                </td>

                                <td className="narrow3" data-label="Quantity">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                    onBlur={() => handleQtyBlur(item)}
                                  />
                                  {updatingQty[item.id] && (
                                    <span className="qty-loader">Updating...</span>
                                  )}
                                </td>

                                <td className="cartprice" data-label="Total">
                                  ₹ {twoDecimal(Number(item.quantity || 1) * Number(item.price || 0))}
                                </td>

                                <td data-label="Action">
                                  {item?.product?.is_reward_product == 0 && (
                                    <button
                                      onClick={() => moveToSaveForLater(item.id)}
                                      disabled={
                                        actionLoading.id === item.id &&
                                        actionLoading.type === "save"
                                      }
                                    >
                                      {actionLoading.id === item.id &&
                                      actionLoading.type === "save" ? (
                                        <span className="btn-loader">Saving...</span>
                                      ) : (
                                        <img src={SaveLatericon} alt="SaveLatericon" />
                                      )}
                                    </button>
                                  )}

                                  <button onClick={() => deleteFromCart(item.id, 0)}>
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
                          <span>₹{twoDecimal(subTotal)}</span>
                        </label>

                        <div className="section-buttons">
                          <button
                            className="greenbtn"
                            onClick={handleSaveForLaterAllCheckedToCart}
                            disabled={!selectedCartIds.length}
                          >
                            {saveCheckedLoading
                              ? "Saving..."
                              : "Save all checked item for later"}
                          </button>

                          <button
                            className="bluebtn"
                            onClick={moveToSaveAllNoCreditItems}
                          >
                            {saveNoCreditLoading
                              ? "Saving..."
                              : "Save all no credit item for later"}
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

                      <div className="cart-Category-Tabs">
                        <h3>Selected Categories</h3>

                        {Object.keys(categoryCounts).length > 0 && (
                          <div className="category-tabs">
                            <span
                              className={`tab ${selectedCategory === "All" ? "active" : ""}`}
                              onClick={() => setSelectedCategory("All")}
                            >
                              All ({savedItems.length})
                            </span>

                            {Object.entries(categoryCounts).map(([cat, count]) => (
                              <span
                                key={cat}
                                className={`tab ${selectedCategory === cat ? "active" : ""}`}
                                onClick={() => setSelectedCategory(cat)}
                              >
                                {cat} ({count})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {filteredSavedItems.length > 0 && (
                        <div className="cart-table-container">
                          <table className="order-table">
                            <thead>
                              <tr>
                                <th>
                                  <label className="animated-checkbox">
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
                                      <input
                                        type="checkbox"
                                        checked={selectedSavedIds.includes(String(item.id))}
                                        onChange={() => handleSavedCheckbox(item.id)}
                                      />
                                      <span className="custom-check"></span>
                                    </label>
                                  </td>

                                  <td className="narrow1" data-label="Product">
                                    <div className="cartproduct">
                                      <img
                                        src={getImageUrl(item.image)}
                                        alt={item?.name || "Product"}
                                        width="70"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = noImage;
                                        }}
                                      />
                                      {item.name}
                                      {item.cash_and_carry_item == 1 && (
                                        <span className="no-credit">No Credit Item</span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="cartprice" data-label="Price">
                                    ₹ {twoDecimal(item.price)}
                                  </td>

                                  <td className="narrow5" data-label="Added Quantity">
                                    <span>{item.qty || 1}</span>
                                  </td>

                                  <td className="cartprice" data-label="Total">
                                    ₹ {(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
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
                          <button
                            className="greenbtn"
                            onClick={handleMoveCheckedToCart}
                            disabled={!selectedSavedIds.length}
                          >
                            {movingLoading ? "Moving..." : "Move all checked item for cart"}
                          </button>

                          <button className="bluebtn" onClick={moveAllNoCreditItemsToCart}>
                            {noCreditLoading ? "Moving..." : "Move all no credit item for cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="cart-summary">
              <div className="cart-panel-header">{/* optional */}</div>

              <div className="cart-summary-content">
                <h3>Summary</h3>

                <label>
                  No Credit Item Subtotal:<span>₹ {twoDecimal(noCreditItemTotalAmount)}</span>
                </label>

                <label>
                  Other Item Subtotal:<span>₹{twoDecimal(cartSubTotal)}</span>
                </label>

                {overDueAmount > 0 && (
                  <label>
                    Overdue Amount:<span>₹ {twoDecimal(overDueAmount)}</span>
                  </label>
                )}

                <div className="mcoin-balance">
                  <div>
                    <span className="label">You Can Earn M Coins with this order</span>
                    <strong>{twoDecimal(earnMCoinBalance)}</strong>
                  </div>
                  <div className="value">
                    ₹{twoDecimal(Math.floor(earnMCoinBalance / 250))}
                  </div>
                </div>
                {/* <hr/><br/> */}
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
                              <strong>{twoDecimal(availableMCoinBalance)}</strong>
                            </div>
                            <div className="value">
                              ₹{twoDecimal(Math.floor(availableMCoinBalance / 250))}
                            </div>
                          </div>
    
                          {savedAppliedCoins > 0 ? (
                            <div className="mcoin-applied">
                              <div className="mcoin-applied-left">
                                <span className="label">Applied Coins</span>
                                <strong className="coins">{twoDecimal(savedAppliedCoins)} Coins</strong>
                                <div className="value">₹{twoDecimal(savedAppliedCoinValue)}</div>
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
                                <span>₹{twoDecimal(appliedCoinValue)}</span>
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
    
                              <small>Max: {twoDecimal(availableMCoinBalance)} coins</small>
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
                      M Coin Discount Applied: - ₹ {twoDecimal(savedAppliedCoinValue)}
                    </div>
                  )}
                </div>
              </div>
              <div className="subtotal">
                <div className="subtotal-main">
                  Total Payable: <span>₹ {twoDecimal(finalTotalPayable)}</span>
                </div>
              </div>
              {offerApplied != 0 ? (
                <button
                  className="checkout-btn Remove-btn"
                  onClick={() => removeAppliedOffer(appliedOfferDetails?.id)}
                >
                  Remove Offer {appliedOfferDetails?.offer_name}
                </button>
              ) : (
                <button
                  className="checkout-btn Offer-btn"
                  onClick={() => setOfferModalOpen(true)}
                >
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
      </MainLayout>

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setOfferModalOpen(false)}
        onApplied={cartPageData}
      />
    </div>
  );
};

export default Cart;
