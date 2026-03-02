import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import { productDetails } from "../api/apiRequest";

// ✅ Use the SAME ProductModal file used in QuickOrder
import ProductModal from "../components/ProductModal";

const ProductDetails = () => {
  const { slug } = useParams();

  const [activeTab, setActiveTab] = useState("specs");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [product, setProduct] = useState(null);
  const [apiAttributes, setApiAttributes] = useState([]);

  // ✅ Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ⭐ Rating UI
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

  // ✅ Compute rating if product.rating = 0
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

  // ✅ Specs
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
      { label: "MRP", value: product?.mrp ? `₹ ${product.mrp}` : "" },
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
  }, [product]);

  const productName = product?.name || "Product";
  const descriptionText = product?.description || "";

  // ✅ image
  const mainImage =
    product?.thumb_img?.file_name || product?.images?.[0]?.file_name || "";

  const crumbGroup = product?.category_group?.name || "Category Group";
  const crumbCategory = product?.category?.name || "Category";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ✅ Add to Cart -> open modal
  const handleAddToCart = () => {
    if (!product?.id) {
      console.log("No product id yet:", product);
      return;
    }
    console.log("Opening modal for product:", product.id);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="product-details-conte">
          <div className="product-details">
            {/* Left */}
            <div className="product-details-left">
              <div className="breadcrumb">
                {crumbGroup}
                <em><GoDotFill /></em>
                {crumbCategory}
                <em><GoDotFill /></em>
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
                      style={{ cursor: "pointer" }}
                      onClick={() => product?.id && setIsModalOpen(true)}
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

            {/* Right */}
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

              {/* Tabs + button */}
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

                {/* ✅ FORCE: only disable while loading or no product */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={loading || !product?.id}
                  className="add-to-cart-btn"
                >
                  Add to Cart
                </button>
              </div>

              {/* Content */}
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
                      {descriptionText ? descriptionText : "No description available."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ProductModal (compat mode: pass all common props) */}
      {isModalOpen && (
        <ProductModal
          // Most common
          open={isModalOpen}
          onClose={closeModal}

          // Other common variations
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          show={isModalOpen}
          setShow={setIsModalOpen}

          // Product identifiers
          productId={product?.id}
          id={product?.id}
          slug={slug}

          // Some modals expect full product object
          product={product}
          selectedProduct={product}
          item={product}

          // optional callbacks
          onOpen={() => setIsModalOpen(true)}
          onRequestClose={closeModal}
        />
      )}

      <style>{`
        .add-to-cart-btn{
          background: #0b3b73;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          font-weight: 700;
          min-width: 190px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .add-to-cart-btn:disabled{
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </MainLayout>
  );
};

export default ProductDetails;