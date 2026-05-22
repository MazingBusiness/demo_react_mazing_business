import React, { useEffect, useState, useRef, useMemo } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import { FiX } from "react-icons/fi";
import CartbtnIcon from "../assets/icons/cartbtnIcon.svg";
import { GoDotFill } from "react-icons/go";

import { getProductDetails, addToCart, updateProductQty } from "../api/apiRequest";

const GenericProductsModal = ({ isOpen, onClose, genericLink }) => {
  if (!isOpen || !genericLink) return null;

  const products = genericLink?.products || [];

  return (
    <div className="product-modal-overlay open" style={{ zIndex: 99999 }}>
      <div
        className="product-modal-box open"
        style={{
          maxWidth: "950px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <button className="product-modal-close" onClick={onClose} type="button">
          <FiX />
        </button>

        <h3 style={{ marginBottom: "15px" }}>{genericLink?.name}</h3>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "15px",
            }}
          >
            {products.map((item) => {
              const imageUrl =
                item?.thumb_img?.file_name ||
                item?.images?.[0]?.file_name ||
                "";

              return (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "10px",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "130px",
                      background: "#f7f7f7",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      marginBottom: "10px",
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item?.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        No Image
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      fontSize: "13px",
                      lineHeight: "18px",
                      minHeight: "38px",
                      marginBottom: "6px",
                    }}
                  >
                    {item?.name}
                  </h4>

                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>
                    Part No: <b>{item?.part_no}</b>
                  </p>

                  <p style={{ fontSize: "13px", fontWeight: 700 }}>
                    ₹{Number(item?.mrp || 0).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductModal = ({ product, isOpen, onClose }) => {
  const modalRef = useRef(null);

  const [productDetails, setProductDetails] = useState(null);
  const [productImages, setProductImages] = useState([]);

  const [quantity, setQuantity] = useState("");

  const [priceState, setPriceState] = useState({
    normal: 0,
    bulk: 0,
  });

  const [qtyAlert, setQtyAlert] = useState("");
  const [checkingPrice, setCheckingPrice] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [genericModalOpen, setGenericModalOpen] = useState(false);
  const [selectedGenericLink, setSelectedGenericLink] = useState(null);

  const qtyTimerRef = useRef(null);
  const lastCheckedQtyRef = useRef(null);

  const fetchSeqRef = useRef(0);
  const qtySeqRef = useRef(0);

  const productId = product?.id;

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

  const bulkQty = Number(productDetails?.piece_by_carton || 0);

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

  const runUpdateProductQty = async (pid, qtyNum) => {
    if (!pid || !qtyNum || qtyNum <= 0) return;

    if (lastCheckedQtyRef.current === `${pid}:${qtyNum}`) return;
    lastCheckedQtyRef.current = `${pid}:${qtyNum}`;

    const mySeq = ++qtySeqRef.current;

    setCheckingPrice(true);

    try {
      const data = await updateProductQty(pid, qtyNum);

      if (mySeq !== qtySeqRef.current) return;

      const msg = String(data?.increasePriceText || data?.msg || "").trim();
      setQtyAlert(msg || "");

      setPriceState((prev) => {
        const fallbackNormal = Number(prev.normal || 0);
        const fallbackBulk = Number(prev.bulk || prev.normal || 0);

        const next = extractPricesFromUpdateQty(data, fallbackNormal, fallbackBulk);

        if (
          Number(next.normal) === Number(prev.normal) &&
          Number(next.bulk) === Number(prev.bulk)
        ) {
          return prev;
        }

        return next;
      });
    } catch (e) {
      console.error("updateProductQty error:", e);
    } finally {
      if (mySeq === qtySeqRef.current) {
        setCheckingPrice(false);
      }
    }
  };

  const handleQuantityChange = (e) => {
    const raw = e.target.value;
    setQuantity(raw);

    const pid = productDetails?.id;
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

  const handleGetDiscount = async () => {
    const pid = productDetails?.id;
    if (!pid) return;

    const targetQty = bulkQty > 0 ? bulkQty : 1;

    setQuantity(String(targetQty));

    if (qtyTimerRef.current) {
      clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    }

    lastCheckedQtyRef.current = null;

    await runUpdateProductQty(pid, targetQty);
  };

  const openGenericProductsModal = (link) => {
    setSelectedGenericLink(link);
    setGenericModalOpen(true);
  };

  const closeGenericProductsModal = () => {
    setSelectedGenericLink(null);
    setGenericModalOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (qtyTimerRef.current) {
      clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    }

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

    setGenericModalOpen(false);
    setSelectedGenericLink(null);
  }, [isOpen, productId]);

  useEffect(() => {
    if (!isOpen || !productId) return;

    const myFetchSeq = fetchSeqRef.current;

    const fetchDetails = async () => {
      try {
        const apiResponseData = await getProductDetails(productId);

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

  useEffect(() => {
    return () => {
      if (qtyTimerRef.current) clearTimeout(qtyTimerRef.current);
      qtyTimerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genericModalOpen) return;

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, genericModalOpen]);

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

  const genericLinks =
    productDetails?.generic_master_id && Array.isArray(productDetails?.generic_links)
      ? productDetails.generic_links
      : [];

  return (
    <>
      <div className={`product-modal-overlay ${isOpen ? "open" : ""}`}>
        <div className={`product-modal-box ${isOpen ? "open" : ""}`} ref={modalRef}>
          <button className="product-modal-close" onClick={onClose} type="button">
            <FiX />
          </button>

          <div className="product-modal-grid">
            <div className="product-modal-content">
              {loadingProduct && (
                <div style={{ padding: 18, fontWeight: 600 }}>Loading product...</div>
              )}

              {!loadingProduct && (
                <>
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
                      <span className="old-price">
                        ₹{Number(productDetails?.mrp || 0).toFixed(2)}
                      </span>

                      <span className="new-price">
                        ₹{Number(unitPrice || 0).toFixed(2)}
                      </span>

                      <span className="unit">/Pc</span>

                      {checkingPrice && (
                        <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600 }}>
                          Updating price...
                        </span>
                      )}
                    </div>

                    <div className="prices">
                      <span className="emcoin" id="spanMCoin">
                        Earn MCoin : {earnedMCoin.toFixed(2)}
                      </span>
                    </div>

                    {genericLinks.length > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          marginBottom: "12px",
                          padding: "10px",
                          border: "1px solid #eee",
                          borderRadius: "10px",
                          background: "#fafafa",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            marginBottom: "8px",
                          }}
                        >
                          {productDetails?.generic_master?.name || "Generic Products"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {genericLinks.map((link) => (
                            <button
                              key={link.id}
                              type="button"
                              onClick={() => openGenericProductsModal(link)}
                              style={{
                                border: "1px solid #e11d48",
                                color: "#e11d48",
                                background: "#fff",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {link.name}
                              {Array.isArray(link.products) && (
                                <span style={{ marginLeft: "5px" }}>
                                  ({link.products.length})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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
                        <span className="highlight">
                          ₹{Number(priceState.bulk || 0).toFixed(2)}
                        </span>{" "}
                        instead of{" "}
                        <span className="highlight">
                          ₹{Number(priceState.normal || 0).toFixed(2)}
                        </span>
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
                        <input
                          type="hidden"
                          name="bulk_price"
                          id="bulk_price"
                          value={priceState.bulk}
                        />
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
                        <img src={CartbtnIcon} alt="cartbtnIcon" className="cartbtnIcon" /> Add to
                        Cart
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <GenericProductsModal
        isOpen={genericModalOpen}
        onClose={closeGenericProductsModal}
        genericLink={selectedGenericLink}
      />
    </>
  );
};
export default ProductModal;