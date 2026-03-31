import { useState, useEffect, useRef, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { MdArrowBackIos } from "react-icons/md";
import { BsCloudArrowDownFill } from "react-icons/bs";
import { BiSolidCart } from "react-icons/bi";

import SaveLatericon from "../assets/icons/SaveLatericon.svg";
import SaveLatericon1 from "../assets/icons/SaveLatericon1.svg";
import Deleteicon from "../assets/icons/Deleteicon.svg";
import noImage from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import OfferModal from "../components/OfferModal.jsx";
import { useNavigate } from "react-router-dom";

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

const getProductImage = (product) => {
  const url = product?.images?.[0]?.file_name;
  if (!url) return noImage;
  if (String(url).startsWith("http")) return url;
  const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://mazingbusiness.com";
  return `${BACKEND}/${String(url).replace(/^\/+/, "")}`;
};

const CartSlide = ({ isCartVisible, toggleCart }) => {
  const [cartItems, setCartItems] = useState([]);

  // ✅ always store selected ids as STRING to avoid mismatch
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState([]);

  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [noCreditItemTotalAmount, setNoCreditItemTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [overDueAmount, setOverDueAmount] = useState(0);

  const [subTotal, setSubTotal] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  const [cartLoading, setCartLoading] = useState(false);
  const [updatingQty, setUpdatingQty] = useState({}); // { [id]: true/false }

  const [saveForLaterItems, setSaveForLaterItems] = useState([]);
  const [saveForLaterCount, setSaveForLaterCount] = useState(0);
  const [saveForLaterCategory, setSaveForLaterCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [offerApplied, setofferApplied] = useState(0);
  const [appliedOfferDetails, setAppliedOfferDetails] = useState(null);

  const [downloading, setDownloading] = useState(false);
  const [movingLoading, setMovingLoading] = useState(false);
  const [noCreditLoading, setNoCreditLoading] = useState(false);
  const [saveNoCreditLoading, setSaveNoCreditLoading] = useState(false);
  const [saveCheckedLoading, setSaveCheckedLoading] = useState(false);

  // ------ M Coin
  const [availableMCoinBalance, setAvailableMCoinBalance] = useState(0);
  const [earnMCoinBalance, setEarnMCoin] = useState(0);
  const [appliedCoins, setAppliedCoins] = useState("");
  const [savedAppliedCoins, setSavedAppliedCoins] = useState(0);
  const [mCoinLoading, setMCoinLoading] = useState(false);
  const appliedCoinValue = Math.floor((Number(appliedCoins || 0)) / 250);
  const savedAppliedCoinValue = Math.floor(Number(savedAppliedCoins || 0) / 250);
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
        // availableMCoinBalance
      }
      setSavedAppliedCoins(coinCount);
      setAppliedCoins("");
      await getAvailableMCoinBalance();
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

  // ✅ updateProductQty alerts
  const [qtyAlertsById, setQtyAlertsById] = useState({});

  const navigate = useNavigate();

  /** ✅ debounce + avoid stale */
  const cartItemsRef = useRef([]);
  const qtyTimersRef = useRef({}); // { [cartId]: timeoutId }
  const lastCheckedQtyRef = useRef({}); // { [cartId]: qty }
  const checkingAllRef = useRef(false);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(qtyTimersRef.current || {}).forEach((t) => clearTimeout(t));
      qtyTimersRef.current = {};
    };
  }, []);

  const handleCheckout = () => {
    navigate("/company");
  };

  const getImageUrl = (url) => {
    if (!url) return noImage;
    if (String(url).startsWith("http")) return url;
    const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://mazingbusiness.com";
    return `${BACKEND}/${String(url).replace(/^\/+/, "")}`;
  };

  /** ✅ saved items derived from API */
  const [savedItems, setSavedItems] = useState([]);

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

  /** ✅ updateProductQty checker */
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

  /** ✅ initial load + listen global event */
  useEffect(() => {
    cartData();
    const handler = () => cartData();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  /** ✅ check qty alerts on page load / cart refresh (rate-limit safe) */
  useEffect(() => {
    if (!cartItems?.length) return;
    if (checkingAllRef.current) return;

    checkingAllRef.current = true;

    (async () => {
      try {
        for (const it of cartItems) {
          const qty = Number(it?.quantity || 1);
          const lastQty = lastCheckedQtyRef.current[it.id];

          // ✅ skip if same qty already checked
          if (lastQty === qty) continue;

          await checkQtyAlert(it);
          lastCheckedQtyRef.current[it.id] = qty;

          // ✅ small delay to avoid 429
          await new Promise((r) => setTimeout(r, 250));
        }
      } finally {
        checkingAllRef.current = false;
      }
    })();
  }, [cartItems]);

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

    const st = other + noCredit;
    setSubTotal(st);
  }, [cartItems]);

  /** ✅ body scroll lock */
  useEffect(() => {
    document.body.style.overflow = isCartVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartVisible]);

  useEffect(() => {
    if (isCartVisible) setSelectedCategory("All");
  }, [isCartVisible]);

  // ✅ per-row button loader
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  /** ✅ qty handlers (debounced) + updateProductQty call */
  const handleQtyChange = (itemId, rawValue) => {
    const newQty = Math.max(1, Number(rawValue) || 1);

    // update UI immediately
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );

    // clear old timer
    if (qtyTimersRef.current[itemId]) {
      clearTimeout(qtyTimersRef.current[itemId]);
      delete qtyTimersRef.current[itemId];
    }

    setUpdatingQty((p) => ({ ...p, [itemId]: true }));

    qtyTimersRef.current[itemId] = setTimeout(async () => {
      try {
        await updateQuantity({ cart_id: itemId, quantity: newQty });

        // ✅ updateProductQty message
        const currentItem = (cartItemsRef.current || []).find((x) => x.id === itemId);
        if (currentItem) {
          await checkQtyAlert({ ...currentItem, quantity: newQty });
          lastCheckedQtyRef.current[itemId] = newQty;
        }

        await cartData();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (err) {
        console.error(err);
        await cartData();
      } finally {
        setUpdatingQty((p) => ({ ...p, [itemId]: false }));
        if (qtyTimersRef.current[itemId]) {
          clearTimeout(qtyTimersRef.current[itemId]);
          delete qtyTimersRef.current[itemId];
        }
      }
    }, 500);
  };

  const handleQtyBlur = async (item) => {
    const itemId = item?.id;
    if (!itemId) return;

    // flush pending debounce
    if (qtyTimersRef.current[itemId]) {
      clearTimeout(qtyTimersRef.current[itemId]);
      delete qtyTimersRef.current[itemId];
    }

    setUpdatingQty((p) => ({ ...p, [itemId]: true }));
    try {
      await updateQuantity({ cart_id: itemId, quantity: Number(item.quantity || 1) });

      await checkQtyAlert(item);
      lastCheckedQtyRef.current[itemId] = Number(item.quantity || 1);

      await cartData();
    } catch (err) {
      console.error(err);
      await cartData();
    } finally {
      setUpdatingQty((p) => ({ ...p, [itemId]: false }));
    }
  };

  /** ✅ Save/Move single */
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

  /** ✅ selection */
  const handleCartCheckbox = (id) => {
    const cid = String(id);
    setSelectedCartIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  };

  const handleSavedCheckbox = (id) => {
    const sid = String(id);
    setSelectedSavedIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const toggleSelectAllCart = () => {
    if (!cartItems.length) return;
    const allIds = cartItems.map((x) => String(x.id));
    const allSelected = allIds.every((id) => selectedCartIds.includes(id));
    setSelectedCartIds(allSelected ? [] : allIds);
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

  /** ✅ bulk actions */
  const moveToSaveAllNoCreditItems = async () => {
    setSaveNoCreditLoading(true);
    try {
      await saveAllNoCreditItems();
      await cartData();
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
      await cartData();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to move no-credit items.");
    } finally {
      setNoCreditLoading(false);
    }
  };

  const deleteFromCart = async (id, qty) => {
    await updateQuantity({ cart_id: id, quantity: Number(qty) });
    await cartData();
  };

  const deleteFromSaved = async (id) => {
    await deleteFromSaveForLaterItem({ id });
    await cartData();
  };

  /** ✅ statement download */
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
    const idsCsv = filteredSavedItems
      .filter((it) => selectedSavedIds.includes(String(it.id)))
      .map((it) => String(it.id))
      .join(",");

    if (!idsCsv) return;

    setMovingLoading(true);
    try {
      await moveToCartAllSelectedItems({ idsCsv });
      await cartData();
      setSelectedSavedIds([]);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to move items.");
    } finally {
      setMovingLoading(false);
    }
  };

  const handleSaveForLaterAllCheckedToCart = async () => {
    // ✅ FIX: use selectedCartIds (not saved)
    const idsCsv = (cartItems || [])
      .filter((it) => selectedCartIds.includes(String(it.id)))
      .map((it) => String(it.id))
      .join(",");

    if (!idsCsv) return;

    setSaveCheckedLoading(true);
    try {
      await saveForLaterAllSelectedItems({ idsCsv });
      await cartData();
      setSelectedCartIds([]);
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
        showToast("error", json?.msg || "Offer remove failed");
        await cartData();
        return;
      }
      showToast("success", json?.msg || "Offer removed.");
    } catch (e) {
      console.error(e);
      showToast("error", json?.msg || "Something went wrong");
    } finally {
      await cartData();
    }
  };

  const filteredSavedItems =
    selectedCategory === "All"
      ? savedItems
      : savedItems.filter(
          (item) => (item.category || "UNCATEGORIZED") === selectedCategory
        );

  // Show Message
  const showToast = (icon, title) => {
    Swal.fire({
      target: document.body,
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      customClass: {
        container: "swal-toast-container",
        popup: "swal-toast-popup",
      },
    });
  };

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
              <button type="button" onClick={toggleCart}>
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
                        <th className="narrow1">Product</th>
                        <th>Price</th>
                        <th className="narrow3">Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {cartItems.map((item) => (
                        <tr
                          key={item.id}
                          className={item?.applied_offer_id != null ? "tem-row" : ""}
                        >
                          <td data-label="">
                            <label className="animated-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedCartIds.includes(String(item.id))}
                                onChange={() => handleCartCheckbox(item.id)}
                              />
                              <span className="custom-check"></span>
                            </label>
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
                              {" "}
                              {item?.product?.name}

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

                                    return itemMCoin;
                                  })()}
                                </strong>
                              </span>

                              {item?.product?.cash_and_carry_item == 1 && (
                                <span className="no-credit">No Credit Item</span>
                              )}

                              {item?.applied_offer_id != null && (
                                <span className="applied-offer-tag">
                                  {appliedOfferDetails?.offer_name} Offer Applied
                                </span>
                              )}
                            </div>

                            <div className="ratingGrp">
                              <div className="ratingGrpLft">
                                {renderWarrantyTag(item?.product)}
                              </div>
                              {fastDeliveryTag(item?.product)}
                            </div>

                            {/* ✅ updateProductQty ALERT */}
                            {qtyAlertsById[item.id] && (
                              <div
                                style={{
                                  marginTop: "6px",
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
                              <>₹ {item.price}</>
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
                            ₹ {Number(item.quantity || 1) * Number(item.price || 0)}
                          </td>

                          <td data-label="Action">
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
                    Subtotal: <span>₹{subTotal}</span>
                  </label>

                  <div className="section-buttons">
                    <button
                      className="greenbtn"
                      onClick={handleSaveForLaterAllCheckedToCart}
                      disabled={!selectedCartIds.length}
                    >
                      {saveCheckedLoading ? "Saving..." : "Save all checked item for later"}
                    </button>

                    <button className="bluebtn" onClick={moveToSaveAllNoCreditItems}>
                      {saveNoCreditLoading ? "Saving..." : "Save all no credit item for later"}
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

                {/* Filtered Table */}
                {filteredSavedItems.length > 0 && (
                  <div className="cart-table-container">
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>
                            <label className="animated-checkbox">
                              <input
                                type="checkbox"
                                onChange={toggleSelectAllSaved}
                                checked={
                                  filteredSavedItems.length > 0 &&
                                  filteredSavedItems.every((x) =>
                                    selectedSavedIds.includes(String(x.id))
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
                              ₹ {item.price}
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
                                disabled={
                                  actionLoading.id === item.id &&
                                  actionLoading.type === "move"
                                }
                              >
                                {actionLoading.id === item.id &&
                                actionLoading.type === "move" ? (
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
              <div className="mcoin-balance">
            <div>
              <span className="label">You Can Earn M Coins with this order</span>
              <strong>{earnMCoinBalance}</strong>
            </div>
            <div className="value">
              ₹{Math.floor(earnMCoinBalance / 250)}
            </div>
          </div>
            <br/>
            {/* <hr/><br/> */}
              {availableMCoinBalance > 0 && (
                <div className="mcoin-card">
                  <div className="mcoin-header">
                    <h4>M Coin Wallet</h4>
                    <p>Use your coins and save more on this order</p>
                  </div>

                  {/* Available Coins */}
                  <div className="mcoin-balance">
                    <div>
                      <span className="label">Available Coins</span>
                      <strong>{availableMCoinBalance}</strong>
                    </div>
                    <div className="value">
                      ₹{Math.floor(availableMCoinBalance / 250)}
                    </div>
                  </div>

                  {/* Applied Section */}
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
                              e.preventDefault(); // 🔥 important (form submit avoid)
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
              <button className="download-pdf" onClick={downloadStatement}>
                <BsCloudArrowDownFill />{" "}
                {downloading ? "Downloading..." : "Download Statement"}
              </button>
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

      {/* Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setOfferModalOpen(false)}
        onApplied={cartData}
      />
    </>
  );
};

export default CartSlide;