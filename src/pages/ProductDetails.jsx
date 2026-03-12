import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { useParams, useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import { getLoggedInUser } from "../utils/authUtils";
import { productDetails } from "../api/apiRequest";
import ProductModal from "../components/ProductModal";

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
      stars.push(
        <FaRegStar key={`empty-${i}`} className="star-icon empty-star" />
      );
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
        value: product?.est_shipping_days
          ? `${product.est_shipping_days} Days`
          : "",
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

  // ✅ direct and safe price mapping
  const formattedMrp =
    user_id != null && product?.mrp
      ? `₹${Number(product.mrp).toFixed(2)}`
      : "";

  const formattedDiscountPrice =
    user_id != null && product?.discount_price
      ? `₹${Number(product.discount_price).toFixed(2)}`
      : "";
  
  const formattedBulkDiscountPrice =
    user_id != null && product?.bulk_discount_price
      ? `₹${Number(product.bulk_discount_price).toFixed(2)}`
      : "";

  const pieceByCarton =
    user_id != null && product?.piece_by_carton
      ? `${product.piece_by_carton}`
      : "";
  const unitLabel = product?.unit ? `/${product.unit}` : "/Pc";

  const fetchProduct = async () => {
    setLoading(true);
    setErr("");
    setProduct(null);
    setApiAttributes([]);

    try {
      const cleanSlug = decodeURIComponent(String(slug || "").trim());
      if (!cleanSlug) throw new Error("Slug missing in URL");

      const payload = await productDetails(cleanSlug);

      const ok =
        payload?.res === true || payload?.res === 1 || payload?.res === "true";

      if (!ok) throw new Error(payload?.msg || "API returned res=false");

      const p = Array.isArray(payload?.data) ? payload.data[0] : null;
      if (!p) throw new Error("Product not found in payload.data[0]");

      console.log("API product data:", p); // debug
      console.log("MRP:", p?.mrp);
      console.log("Discount Price:", p?.discount_price);

      setProduct(p);
      setApiAttributes(
        Array.isArray(payload?.attributes) ? payload.attributes : []
      );
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

              {/* ✅ Price section only for logged-in users */}
              {user_id != null && (
                <>
                  <div className="product-modal-info">
                    <div className="product-price">
                      <span className="old-price">{formattedMrp}</span>
                      <span className="new-price">{formattedDiscountPrice}</span>
                      <span className="unit">{unitLabel}</span>
                    </div>
                  </div>
                  <div className="bulk-discount">
                  <p>
                    <span className="red">Bulk Quantity Discount:</span> Purchase{" "}
                    {pieceByCarton} or more and get each for{" "}
                    <span className="highlight">{formattedBulkDiscountPrice}</span>{" "}
                    instead of{" "}
                    <span className="highlight">{formattedDiscountPrice}</span>
                  </p>
                </div>
                </>
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

                {user_id != null ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={loading || !product?.id}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegisterToCheckPrices}
                    className="before-reg-btn"
                  >
                    Register to check prices
                  </button>
                )}
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
    </MainLayout>
  );
};

export default ProductDetails;