import React, { useEffect, useState, useRef, useMemo } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import { FiHeart, FiX } from "react-icons/fi";
import CartbtnIcon from "../assets/icons/cartbtnIcon.svg";
import { GoDotFill } from "react-icons/go";

import { getProductDetails, addToCart, updateProductQty } from "../api/apiRequest";

const ProductModal = ({ product, isOpen, onClose }) => {
  const modalRef = useRef(null);

  const [productDetails, setProductDetails] = useState(null);
  const [productImages, setProductImages] = useState([]);

  // qty
  const [quantity, setQuantity] = useState("");

  // ✅ price state (base + server-adjusted)
  const [priceState, setPriceState] = useState({
    normal: 0,
    bulk: 0,
  });

  // ✅ alert message
  const [qtyAlert, setQtyAlert] = useState("");

  // ✅ loader when price is being checked
  const [checkingPrice, setCheckingPrice] = useState(false);

  // ✅ loader when product is loading (prevents showing stale info)
  const [loadingProduct, setLoadingProduct] = useState(false);

  // debounce refs
  const qtyTimerRef = useRef(null);
  const lastCheckedQtyRef = useRef(null);

  // ✅ guards to ignore old async responses
  const fetchSeqRef = useRef(0);
  const qtySeqRef = useRef(0);

  const productId = product?.id;

  // ratings static
  const rating = 3.5;
  const totalRatings = 12;

  const renderRating = (ratingValue) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon full-star" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star-icon half-star" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star-icon empty-star" />);
    }

    return stars;
  };

  // ✅ derive bulkQty from productDetails
  const bulkQty = Number(productDetails?.piece_by_carton || 0);

  // ✅ compute selected price + total
  const { type, unitPrice, totalPrice } = useMemo(() => {
    const qtyNum = Math.max(0, Number(quantity) || 0);

    const useBulk = bulkQty > 0 && qtyNum >= bulkQty;
    const chosenType = useBulk ? "bulk" : "piece";

    const normal = Number(priceState.normal || 0);
    const bulk = Number(priceState.bulk || normal);

    const chosenUnit = useBulk ? bulk : normal;

    return {
      type: chosenType,
      unitPrice: chosenUnit,
      totalPrice: qtyNum > 0 ? (qtyNum * chosenUnit).toFixed(2) : "",
    };
  }, [quantity, bulkQty, priceState.normal, priceState.bulk]);

  // ✅ helper to safely pick server prices from updateProductQty response
  const extractPricesFromUpdateQty = (data, fallbackNormal, fallbackBulk) => {
    const normalCandidates = [
      data?.discount_price,
      data?.unit_price,
      data?.price,
      data?.new_price,
      data?.product_price,
      data?.updated_price,
      data?.final_price,
    ];

    const bulkCandidates = [
      data?.bulk_discount_price,
      data?.bulk_price,
      data?.bulk_unit_price,
      data?.updated_bulk_price,
    ];

    const normal =
      Number(normalCandidates.find((v) => v !== undefined && v !== null && v !== "")) ||
      fallbackNormal;

    const bulk =
      Number(bulkCandidates.find((v) => v !== undefined && v !== null && v !== "")) ||
      fallbackBulk ||
      normal;

    return { normal, bulk };
  };

  // ✅ call updateProductQty (debounced) whenever qty changes
  const runUpdateProductQty = async (pid, qtyNum) => {
    if (!pid || !qtyNum || qtyNum <= 0) return;

    // prevent duplicate check for same qty
    if (lastCheckedQtyRef.current === `${pid}:${qtyNum}`) return;
    lastCheckedQtyRef.current = `${pid}:${qtyNum}`;

    // ✅ seq guard (ignore old responses)
    const mySeq = ++qtySeqRef.current;

    setCheckingPrice(true);
    try {
      const data = await updateProductQty(pid, qtyNum);

      // ✅ ignore if a newer qty request already happened
      if (mySeq !== qtySeqRef.current) return;

      const msg = String(data?.increasePriceText || data?.msg || "").trim();
      setQtyAlert(msg || "");

      setPriceState((prev) => {
        const fallbackNormal = Number(prev.normal || 0);
        const fallbackBulk = Number(prev.bulk || prev.normal || 0);

        const next = extractPricesFromUpdateQty(data, fallbackNormal, fallbackBulk);

        if (Number(next.normal) === Number(prev.normal) && Number(next.bulk) === Number(prev.bulk)) {
          return prev;
        }
        return next;
      });
    } catch (e) {
      // if ignored due to seq, do nothing
      console.error("updateProductQty error:", e);
    } finally {
      // ✅ only stop loader if this is still latest request
      if (mySeq === qtySeqRef.current) {
        setCheckingPrice(false);
      }
    }
  };

  const handleQuantityChange = (e) => {
    const raw = e.target.value;
    setQuantity(raw);

    const pid = productDetails?.id; // only after details loaded
    const qtyNum = Math.max(0, Number(raw) || 0);

    if (qtyTimerRef.current) {
      clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    }

    qtyTimerRef.current = setTimeout(() => {
      runUpdateProductQty(pid, qtyNum);
    }, 450);
  };

  const handleQuantityBlur = () => {
    const pid = productDetails?.id;
    const qtyNum = Math.max(0, Number(quantity) || 0);

    if (qtyTimerRef.current) {
      clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    }

    runUpdateProductQty(pid, qtyNum);
  };

  // ✅ Get Discount button handler
  const handleGetDiscount = async () => {
    const pid = productDetails?.id;
    if (!pid) return;

    const targetQty = bulkQty > 0 ? bulkQty : 1;

    setQuantity(String(targetQty));

    if (qtyTimerRef.current) {
      clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    }

    // reset last check so same qty can re-check for new product
    lastCheckedQtyRef.current = null;

    await runUpdateProductQty(pid, targetQty);
  };

  // ✅ IMPORTANT: reset modal state immediately when opening a new product
  useEffect(() => {
    if (!isOpen) return;

    // clear debounce timers immediately
    if (qtyTimerRef.current) {
      clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    }

    // reset guards and UI state (prevents old product flash)
    fetchSeqRef.current += 1;
    qtySeqRef.current += 1;
    lastCheckedQtyRef.current = null;

    setLoadingProduct(true);
    setProductDetails(null);
    setProductImages([]);
    setQuantity("");
    setQtyAlert("");
    setCheckingPrice(false);
    setPriceState({ normal: 0, bulk: 0 });
  }, [isOpen, productId]);

  // ✅ fetch product details when modal opens
  useEffect(() => {
    if (!isOpen || !productId) return;

    const myFetchSeq = fetchSeqRef.current;

    const fetchDetails = async () => {
      try {
        const apiResponseData = await getProductDetails(productId);

        // ✅ ignore if product changed while fetching
        if (myFetchSeq !== fetchSeqRef.current) return;

        if (apiResponseData?.res) {
          const list = apiResponseData?.data || [];
          const firstProduct = Array.isArray(list) ? list[0] : list;

          setProductDetails(firstProduct);
          setProductImages(firstProduct?.images || []);

          const initialNormal = Number(firstProduct?.discount_price || 0);
          const initialBulk = Number(firstProduct?.bulk_discount_price || initialNormal);

          setPriceState({
            normal: initialNormal,
            bulk: initialBulk,
          });

          const minQty = Number(firstProduct?.min_qty || 1);
          setQuantity(String(minQty));

          // initial server sync (guarded)
          lastCheckedQtyRef.current = null;
          await runUpdateProductQty(firstProduct?.id, minQty);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (myFetchSeq === fetchSeqRef.current) {
          setLoadingProduct(false);
        }
      }
    };

    fetchDetails();
  }, [isOpen, productId]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (qtyTimerRef.current) clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    };
  }, []);

  // outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAddToCart = async () => {
    try {
      const pid = productDetails?.id;
      const qty = Number(quantity);

      if (!pid) return alert("Product not loaded");
      if (!qty || qty <= 0) return alert("Enter valid quantity");

      const res = await addToCart({ product_id: pid, quantity: qty, type });

      window.dispatchEvent(new Event("cart-updated"));
      alert(res?.msg || "Added to cart");

      setQuantity("");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to add to cart");
    }
  };

  if (!isOpen || !product) return null;

  const earnedMCoin =
    (Number(unitPrice) || 0) *
    (Number(productDetails?.c_instock_m_coin) || 0) *
    (Number(quantity) || 0);

  return (
    <div className={`product-modal-overlay ${isOpen ? "open" : ""}`}>
      <div className={`product-modal-box ${isOpen ? "open" : ""}`} ref={modalRef}>
        <button className="product-modal-close" onClick={onClose} type="button">
          <FiX />
        </button>

        <div className="product-modal-grid">
          <div className="product-modal-content">
            {/* ✅ optional loading state to avoid showing wrong content */}
            {loadingProduct && (
              <div style={{ padding: 18, fontWeight: 600 }}>
                Loading product...
              </div>
            )}

            {!loadingProduct && (
              <>
                {/* Left - Carousel */}
                <div className="product-modal-carousel">
                  <div className="breadcrumb">
                    {productDetails?.category_group?.name}
                    <em>
                      <GoDotFill />
                    </em>
                    {productDetails?.category?.name}
                  </div>

                  <Carousel
                    showThumbs
                    showArrows
                    showStatus={false}
                    showIndicators={false}
                    infiniteLoop
                    renderArrowPrev={(onClickHandler, hasPrev, label) =>
                      hasPrev && (
                        <button
                          type="button"
                          onClick={onClickHandler}
                          title={label}
                          className="custom-arrow prev-arrow"
                        >
                          &#10094;
                        </button>
                      )
                    }
                    renderArrowNext={(onClickHandler, hasNext, label) =>
                      hasNext && (
                        <button
                          type="button"
                          onClick={onClickHandler}
                          title={label}
                          className="custom-arrow next-arrow"
                        >
                          &#10095;
                        </button>
                      )
                    }
                    renderThumbs={() =>
                      (productImages || []).map((img, idx) => (
                        <div className="custom-thumb" key={idx}>
                          <img src={img.file_name} alt={`thumb-${idx}`} />
                        </div>
                      ))
                    }
                  >
                    {(productImages || []).map((thumbImg, idx) => (
                      <div key={idx}>
                        <img src={thumbImg.file_name} alt={`Slide ${idx}`} />
                      </div>
                    ))}
                  </Carousel>
                </div>

                {/* Right - Info */}
                <div className="product-modal-info">
                  <div className="product-modal-info-top">
                    <div className="product-modal-info-top-lft">
                      <h2>{productDetails?.name}</h2>
                      <div className="product-rating">
                        {renderRating(rating)}
                        <span className="rating-count">{totalRatings} Reviews</span>
                      </div>
                    </div>

                    {productDetails?.fast_delivery_tag == 1 && (
                      <div className="delivery">
                        <img
                          src={fastDeliveryIcon}
                          alt="Fast Delivery"
                          loading="lazy"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <p>
                          Estimate Shipping Time <span>5-6 Days</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="product-price">
                    <span className="old-price">₹{Number(productDetails?.mrp || 0).toFixed(2)}</span>

                    <span className="new-price">₹{Number(unitPrice || 0).toFixed(2)}</span>

                    <span className="unit">/Pc</span>

                    {checkingPrice && (
                      <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600 }}>
                        Updating price...
                      </span>
                    )}
                  </div>
                  <div className="prices">
                    <span className="emcoin" id="spanMCoin">Earn MCoin : {earnedMCoin.toFixed(2)}</span>
                  </div>

                  {!!qtyAlert && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "6px 8px",
                        border: "1px solid #ff4d4f",
                        background: "#fff1f0",
                        color: "#ff4d4f",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {qtyAlert}
                    </div>
                  )}

                  {productDetails?.stocks != null && (
                    <div className="product-stock">
                      {(productDetails?.stocks || []).map((warehouse) => (
                        <div className="stock-item" key={warehouse.warehouse_id}>
                          {warehouse.warehouse_name} <span>{warehouse.qty}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {productDetails?.is_warranty == 1 && (
                    <div className="warranty-div">
                      <p className="warranty-text">
                        <img
                          src={warrantyIcon}
                          alt="Warranty"
                          loading="lazy"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <span className="highlight">
                          {"    "}
                          {productDetails?.warranty_duration} Months Warranty
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="bulk-discount">
                    <p>
                      <span className="red">Bulk Quantity Discount:</span> Purchase{" "}
                      {productDetails?.piece_by_carton} or more and get each for{" "}
                      <span className="highlight">₹{Number(priceState.bulk || 0).toFixed(2)}</span>{" "}
                      instead of{" "}
                      <span className="highlight">₹{Number(priceState.normal || 0).toFixed(2)}</span>
                    </p>

                    <button className="discount-btn" type="button" onClick={handleGetDiscount}>
                      Get Discount
                    </button>
                  </div>

                  <div className="quantity-section">
                    <div>
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
                        min="1"
                      />
                    </div>

                    <div>
                      <label>Total Price</label>
                      <input
                        type="text"
                        id="total_price"
                        name="total_price"
                        placeholder="Amount"
                        value={totalPrice}
                        disabled
                      />

                      <input type="hidden" name="bulk_qty" id="bulk_qty" value={bulkQty} />
                      <input type="hidden" name="bulk_price" id="bulk_price" value={priceState.bulk} />
                      <input type="hidden" name="price" id="price" value={unitPrice} />
                      <input type="hidden" name="type" id="type" value={type} />
                      <input
                        type="hidden"
                        name="product_id"
                        id="product_id"
                        value={productDetails?.id || ""}
                      />
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="add-to-cart" onClick={handleAddToCart} type="button">
                      <img src={CartbtnIcon} alt="cartbtnIcon" className="cartbtnIcon" /> Add to Cart
                    </button>

                    {/* <button className="modal-wishlist-btn" type="button">
                      <FiHeart />
                    </button> */}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;