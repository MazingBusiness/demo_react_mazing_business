import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { FiX } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";
import no_image from "../assets/images/no-image.png";
import CartIcon from "../assets/icons/CartIcon.svg";

import { getLoggedInUser } from "../utils/authUtils";
import { addToCart, productDetails } from "../api/apiRequest";
import ProductModal from "../components/ProductModal";

/*
const GenericProductsModal = ({ isOpen, onClose, genericLink }) => {
  if (!isOpen || !genericLink) return null;

  const products = Array.isArray(genericLink?.products) ? genericLink.products : [];

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
                item?.thumb_img?.file_name || item?.images?.[0]?.file_name || "";

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
*/

const GenericProductsModal = ({ isOpen, onClose, genericLink }) => {
  const [quantities, setQuantities] = useState({});
  const [bulkDiscountApplied, setBulkDiscountApplied] = useState({});
  const [addingId, setAddingId] = useState(null);

  if (!isOpen || !genericLink) return null;

  const products = Array.isArray(genericLink?.products) ? genericLink.products : [];

  const getProductQty = (item) => Number(quantities[item?.id] || item?.min_qty || 1);
  const getItemPrice = (item) => Number(item?.discount_price || item?.price || item?.mrp || 0);
  const getItemMrp = (item) => Number(item?.mrp || item?.unit_price || getItemPrice(item) || 0);
  const getItemBulkQty = (item) => Number(item?.piece_by_carton || item?.min_qty || 10);
  const getItemBulkPrice = (item) =>
    Number(item?.bulk_discount_price || item?.bulk_price || getItemPrice(item));

  const updateGenericQty = (item, nextQty) => {
    const safeQty = Math.max(1, Number(nextQty) || 1);
    setQuantities((prev) => ({ ...prev, [item.id]: safeQty }));
  };

  const handleGenericAddToCart = async (item) => {
    try {
      const qty = getProductQty(item);
      const type =
        bulkDiscountApplied[item.id] || qty >= getItemBulkQty(item)
          ? "bulk"
          : "piece";

      setAddingId(item.id);
      const res = await addToCart({ product_id: item.id, quantity: qty, type });
      window.dispatchEvent(new Event("cart-updated"));
      alert(res?.msg || "Added to cart");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div
      className="product-modal-overlay open"
      style={{
        zIndex: 99999,
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
      }}
    >
      <div
        className="product-modal-box open"
        style={{
          maxWidth: "1180px",
          width: "95%",
          maxHeight: "90vh",
          overflow: "hidden",
          padding: 0,
          borderRadius: "10px",
          background: "#fff",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            padding: "18px 34px",
            background: "#f2f4f7",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#30343b" }}>
              {genericLink?.name || "Generic Products"}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
              Verified compatible products
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            style={{
              width: "36px",
              height: "36px",
              border: 0,
              background: "transparent",
              color: "#606875",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flex: "0 0 auto",
            }}
          >
            <FiX />
          </button>
        </div>

        {products.length === 0 ? (
          <p style={{ padding: "24px 34px", margin: 0 }}>No products found.</p>
        ) : (
          <div
            style={{
              maxHeight: "calc(90vh - 82px)",
              overflowY: "auto",
              padding: "28px 34px 34px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(235px, 1fr))",
              gap: "22px",
              background: "#fff",
            }}
          >
            {products.map((item) => {
              const imageUrl =
                item?.thumb_img?.file_name || item?.images?.[0]?.file_name || no_image;
              const qty = getProductQty(item);
              const normalPrice = getItemPrice(item);
              const mrp = getItemMrp(item);
              const bulkQty = getItemBulkQty(item);
              const bulkPrice = getItemBulkPrice(item);
              const useBulkDiscount =
                bulkDiscountApplied[item.id] || (bulkQty > 0 && qty >= bulkQty);
              const price = useBulkDiscount ? bulkPrice : normalPrice;
              const subtotal = price * Number(qty || 1);
              const hasFastDelivery = Number(item?.fast_delivery_tag) === 1;
              const hasWarranty = Number(item?.is_warranty) === 1;
              const earnedMCoin =
                price * Number(item?.c_instock_m_coin || 0) * Number(qty || 1);

              return (
                <div
                  key={item.id}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                    border: "1px solid #f1f3f6",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#fff",
                    boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleGenericAddToCart(item)}
                    disabled={addingId === item.id}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "12px",
                      zIndex: 2,
                      height: "38px",
                      padding: "0 16px",
                      border: "1px solid #d9dee6",
                      borderRadius: "999px",
                      background: "#fff",
                      color: "#111827",
                      fontSize: "14px",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: addingId === item.id ? "not-allowed" : "pointer",
                      opacity: addingId === item.id ? 0.7 : 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <img src={CartIcon} alt="" style={{ width: "15px", height: "15px" }} />
                    {addingId === item.id ? "Adding..." : "Add to Cart"}
                  </button>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "190px",
                      background: "#fbfcfe",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      marginBottom: "16px",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={item?.name || "Product"}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = no_image;
                      }}
                    />

                    {(hasFastDelivery || hasWarranty) && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          bottom: "12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "6px",
                        }}
                      >
                        {hasFastDelivery && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              minHeight: "32px",
                              padding: "6px 12px",
                              borderRadius: "0 16px 16px 0",
                              background: "#00d52f",
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 800,
                            }}
                          >
                            <img
                              src={fastDeliveryIcon}
                              alt=""
                              style={{ width: "16px", height: "16px", filter: "brightness(0) invert(1)" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            Fast Delivery
                          </span>
                        )}

                        {hasWarranty && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              minHeight: "32px",
                              padding: "6px 12px",
                              borderRadius: "0 16px 16px 0",
                              background: "#00d52f",
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 800,
                            }}
                          >
                            <img
                              src={warrantyIcon}
                              alt=""
                              style={{ width: "16px", height: "16px", borderRadius: "50%" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            Warranty
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <h4
                    style={{
                      fontSize: "15px",
                      lineHeight: "20px",
                      minHeight: "42px",
                      margin: "0 0 8px",
                      color: "#111827",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {item?.name?.length > 70 ? `${item.name.substring(0, 70)}...` : item?.name}
                  </h4>

                  <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: "12px", fontWeight: 700 }}>
                    Part No: <b>{item?.part_no}</b>
                  </p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                    <span
                      style={{
                        color: "#b9b9b9",
                        fontSize: "16px",
                        fontWeight: 800,
                        textDecoration: "line-through",
                      }}
                    >
                      ₹{mrp.toFixed(2)}
                    </span>
                    <span style={{ color: "#008b12", fontSize: "18px", fontWeight: 900 }}>
                      ₹{price.toFixed(2)}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 14px", color: "#004d84", fontSize: "13px", fontWeight: 800 }}>
                    Earn MCoin : {earnedMCoin.toFixed(2)}
                  </p>

                  <p style={{ margin: "0 0 14px", color: "#111827", fontSize: "13px", fontWeight: 800 }}>
                    Subtotal : ₹{subtotal.toFixed(2)}
                  </p>

                  <div style={{ marginTop: "auto" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "42px 1fr 42px",
                        alignItems: "center",
                        height: "38px",
                        overflow: "hidden",
                        borderRadius: "5px",
                        background: "#eef0f2",
                        marginBottom: "12px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateGenericQty(item, qty - 1)}
                        style={{
                          height: "100%",
                          border: 0,
                          background: "transparent",
                          color: "#6b7280",
                          fontSize: "18px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => updateGenericQty(item, e.target.value)}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: 0,
                          background: "transparent",
                          color: "#111827",
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: 800,
                          outline: "none",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => updateGenericQty(item, qty + 1)}
                        style={{
                          height: "100%",
                          border: 0,
                          background: "transparent",
                          color: "#6b7280",
                          fontSize: "18px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <p
                        style={{
                          margin: 0,
                          color: "#111827",
                          fontSize: "11px",
                          lineHeight: "15px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        Bulk Discount: Buy {bulkQty} pcs and get at ₹{bulkPrice.toFixed(2)}/-
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setBulkDiscountApplied((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }))
                        }
                        style={{
                          flex: "0 0 auto",
                          minHeight: "32px",
                          border: 0,
                          borderRadius: "5px",
                          padding: "7px 10px",
                          background: useBulkDiscount ? "#008b12" : "#004d84",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {useBulkDiscount ? "Discount Applied" : "Get Discount"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const user = getLoggedInUser();
  const user_id = user?.id || null;

  const [activeTab, setActiveTab] = useState("specs");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [product, setProduct] = useState(null);
  const [apiAttributes, setApiAttributes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useMainBulkDiscount, setUseMainBulkDiscount] = useState(false);

  const [genericModalOpen, setGenericModalOpen] = useState(false);
  const [selectedGenericLink, setSelectedGenericLink] = useState(null);

  const renderRating = (rating) => {
    const r = Number(rating || 0);
    const stars = [];
    const fullStars = Math.floor(r);
    const hasHalfStar = r % 1 >= 0.5;

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

  const computedRating = useMemo(() => {
    if (!product) return 0;

    const apiRating = Number(product.rating || 0);
    if (apiRating > 0) return apiRating;

    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    if (!reviews.length) return 0;

    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return sum / reviews.length;
  }, [product]);

  const totalRatings = useMemo(() => {
    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
    return reviews.length;
  }, [product]);

  const specs = useMemo(() => {
    if (!product) return [];

    const rows = [
      { label: "Part Number", value: product?.part_no },
      { label: "HSN Code", value: product?.hsncode },
      { label: "GST Rate", value: product?.tax ? `${product.tax}%` : "" },
      { label: "Group", value: product?.category_group?.name || "" },
      { label: "Category", value: product?.category?.name || "" },
      { label: "Part No", value: product?.part_no || "" },
      { label: "Unit", value: product?.unit || "" },

      ...(user_id != null
        ? [{ label: "MRP", value: product?.mrp ? `₹ ${product.mrp}` : "" }]
        : []),

      {
        label: "Shipping Days",
        value: product?.est_shipping_days ? `${product.est_shipping_days} Days` : "",
      },
      {
        label: "Warranty",
        value: String(product?.is_warranty) === "1" ? "Yes" : "No",
      },
      {
        label: "Warranty Duration",
        value: product?.warranty_duration
          ? `${product.warranty_duration} Months`
          : "",
      },
    ];

    return rows.filter((r) => String(r.value || "").trim() !== "");
  }, [product, user_id]);

  const productName = product?.name || "Product";
  const descriptionText = product?.description || "";

  const mainImage =
    product?.thumb_img?.file_name || product?.images?.[0]?.file_name || "";

  const crumbGroup = product?.category_group?.name || "Category Group";
  const crumbCategory = product?.category?.name || "Category";

  const formattedMrp =
    user_id != null && product?.mrp ? `₹${Number(product.mrp).toFixed(2)}` : "";

  const normalProductPrice = Number(product?.discount_price || 0);
  const bulkProductPrice = Number(product?.bulk_discount_price || normalProductPrice || 0);
  const displayedProductPrice = useMainBulkDiscount ? bulkProductPrice : normalProductPrice;

  const formattedDiscountPrice =
    user_id != null && normalProductPrice
      ? `₹${normalProductPrice.toFixed(2)}`
      : "";

  const formattedDisplayedPrice =
    user_id != null && displayedProductPrice
      ? `₹${displayedProductPrice.toFixed(2)}`
      : "";

  const formattedBulkDiscountPrice =
    user_id != null && product?.bulk_discount_price
      ? `₹${Number(product.bulk_discount_price).toFixed(2)}`
      : "";

  const earnMCoin =
    Number(displayedProductPrice || 0) * Number(product?.c_instock_m_coin || 0);

  const pieceByCarton =
    user_id != null && product?.piece_by_carton ? `${product.piece_by_carton}` : "";

  const unitLabel = product?.unit ? `/${product.unit}` : "/Pc";

  const offerList = Array.isArray(product?.offer) ? product.offer : [];
  const now = new Date();

  const hasActiveOffer = offerList.some((offerItem) => {
    const start = offerItem?.offer_validity_start
      ? new Date(String(offerItem.offer_validity_start).replace(" ", "T"))
      : null;

    const end = offerItem?.offer_validity_end
      ? new Date(String(offerItem.offer_validity_end).replace(" ", "T"))
      : null;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    return now >= start && now <= end;
  });

  const isNoCreditItem = Number(product?.cash_and_carry_item || 0) === 1;

  const genericLinks =
    product?.generic_master_id && Array.isArray(product?.generic_links)
      ? product.generic_links
      : [];

  const mainProducts = Array.isArray(product?.generic_master_product)
    ? product.generic_master_product
    : product?.generic_master_product
      ? [product.generic_master_product]
      : [];

  const hasMainProduct =
    product?.generic_master_links_id && mainProducts.length > 0;

  const openGenericProductsModal = (link) => {
    setSelectedGenericLink(link);
    setGenericModalOpen(true);
  };

  const closeGenericProductsModal = () => {
    setSelectedGenericLink(null);
    setGenericModalOpen(false);
  };

  const fetchProduct = async () => {
    setLoading(true);
    setErr("");
    setProduct(null);
    setApiAttributes([]);
    setUseMainBulkDiscount(false);

    try {
      const cleanSlug = decodeURIComponent(String(slug || "").trim());
      if (!cleanSlug) throw new Error("Slug missing in URL");

      const payload = await productDetails(cleanSlug);

      const ok =
        payload?.res === true || payload?.res === 1 || payload?.res === "true";

      if (!ok) throw new Error(payload?.msg || "API returned res=false");

      const p = Array.isArray(payload?.data) ? payload.data[0] : null;
      if (!p) throw new Error("Product not found in payload.data[0]");

      setProduct(p);
      setApiAttributes(Array.isArray(payload?.attributes) ? payload.attributes : []);
    } catch (e) {
      setErr(e?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product?.id) return;
    setIsModalOpen(true);
  };

  const handleRegisterToCheckPrices = () => {
    navigate("/login");
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="product-details-conte">
          <div className="product-details">
            <div className="product-details-left">
              <div className="breadcrumb">
                {crumbGroup}
                <em>
                  <GoDotFill />
                </em>
                {crumbCategory}
                <em>
                  <GoDotFill />
                </em>
                <span className="current">{productName}</span>
              </div>

              {loading ? (
                <div style={{ padding: 20 }}>Loading...</div>
              ) : err ? (
                <div style={{ padding: 20, color: "red" }}>{err}</div>
              ) : (
                <>
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={productName}
                      className="main-product-img"
                      style={{ cursor: user_id != null ? "pointer" : "default" }}
                      onClick={() => {
                        if (user_id != null && product?.id) {
                          setIsModalOpen(true);
                        }
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/500x500?text=No+Image";
                      }}
                    />
                  ) : (
                    <div style={{ padding: 20 }}>No Image</div>
                  )}

                  {hasActiveOffer && (
                    <div className="offer-tag-product-details">
                      Special Offer Item
                    </div>
                  )}

                  {isNoCreditItem && (
                    <div className="no-credit-tag-product-details">
                      No Credit Item
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="product-details-right">
              <div className="product-modal-info-top">
                <div className="product-modal-info-top-lft">
                  <h2>{loading ? "Loading..." : productName}</h2>

                  <div className="product-rating">
                    {renderRating(computedRating)}
                    <span className="rating-count">{totalRatings} Reviews</span>
                  </div>
                </div>

                <div className="delivery">
                  {product?.fast_delivery_tag == 1 && (
                    <>
                      <img
                        src={fastDeliveryIcon}
                        alt="Fast Delivery"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <p>
                        Estimate Shipping Time{" "}
                        <span>
                          {product?.est_shipping_days
                            ? `${product.est_shipping_days} Days`
                            : "5-6 Days"}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {user_id != null ? (
                <>
                  <div className="product-modal-info">
                    <div className="product-price">
                      <span className="old-price">{formattedMrp}</span>
                      <span className="new-price">{formattedDisplayedPrice}</span>
                      <span className="unit">{unitLabel}</span>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={loading || !product?.id}
                        className="add-to-cart-btn-product-details"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  <span className="emcoinDetails">Earn MCoin : {earnMCoin} * X</span>

                  {(genericLinks.length > 0 || hasMainProduct) && (
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
                        {product?.generic_master?.name || "Generic Products"}
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

                        {hasMainProduct && (
                          <button
                            type="button"
                            onClick={() =>
                              openGenericProductsModal({
                                id: "main-product",
                                name: "Main Product",
                                products: mainProducts,
                              })
                            }
                            style={{
                              border: "1px solid #2563eb",
                              color: "#2563eb",
                              background: "#fff",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Main Product ({mainProducts.length})
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {product?.is_warranty == 1 && (
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
                          {product?.warranty_duration} Months Warranty
                        </span>
                      </p>
                    </div>
                  )}

                  {product?.stocks != null && (
                    <div className="product-stock">
                      {(product?.stocks || []).map((warehouse) => (
                        <div className="stock-item" key={warehouse.warehouse_id}>
                          {warehouse.warehouse_name} <span>{warehouse.qty}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bulk-discount">
                    <p>
                      <span className="red">Bulk Quantity Discount:</span> Purchase{" "}
                      {pieceByCarton} or more and get each for{" "}
                      <span className="highlight">{formattedBulkDiscountPrice}</span>{" "}
                      instead of{" "}
                      <span className="highlight">{formattedDiscountPrice}</span>
                      <span className="emcoin">Earn MCoin : {earnMCoin} * X</span>
                    </p>

                    <button
                      className="discount-btn"
                      type="button"
                      onClick={() => setUseMainBulkDiscount(true)}
                    >
                      Get Discount
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterToCheckPrices}
                  className="before-reg-btn"
                  style={{ margin: "10px" }}
                >
                  Register to check prices
                </button>
              )}

              <div
                className="tabs-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <div className="tabs" style={{ margin: 0 }}>
                  <button
                    className={activeTab === "specs" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("specs")}
                    type="button"
                  >
                    Specifications
                  </button>

                  <button
                    className={activeTab === "desc" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("desc")}
                    type="button"
                  >
                    Descriptions
                  </button>
                </div>
              </div>

              {activeTab === "specs" ? (
                <div className="specs-table">
                  <div className="specs-grid">
                    {loading ? (
                      <div style={{ padding: 12 }}>Loading...</div>
                    ) : (
                      <>
                        {specs.map((row, idx) => (
                          <div className="spec-row" key={idx}>
                            <h3>{row.label}</h3>
                            <p>{String(row.value)}</p>
                          </div>
                        ))}

                        {apiAttributes.map((a, idx) => (
                          <div className="spec-row" key={`attr-${idx}`}>
                            <h3>{a.attribute_name}</h3>
                            <p>{a.attribute_value}</p>
                          </div>
                        ))}

                        {user_id == null && (
                          <div className="spec-row spec-row-full">
                            <button
                              type="button"
                              onClick={handleRegisterToCheckPrices}
                              className="before-reg-btn"
                            >
                              Register to check prices
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="desc-section">
                  {loading ? (
                    <div style={{ padding: 12 }}>Loading...</div>
                  ) : (
                    <p style={{ margin: 0 }}>
                      {descriptionText || "No description available."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && user_id != null && (
        <ProductModal
          open={isModalOpen}
          onClose={closeModal}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          show={isModalOpen}
          setShow={setIsModalOpen}
          productId={product?.id}
          id={product?.id}
          slug={slug}
          product={product}
          selectedProduct={product}
          item={product}
          onOpen={() => setIsModalOpen(true)}
          onRequestClose={closeModal}
        />
      )}

      <GenericProductsModal
        isOpen={genericModalOpen}
        onClose={closeGenericProductsModal}
        genericLink={selectedGenericLink}
      />
    </MainLayout>
  );
};

export default ProductDetails;
