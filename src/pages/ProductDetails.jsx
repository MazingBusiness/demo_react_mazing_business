import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { FiSettings, FiX } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";
import no_image from "../assets/images/no-image.png";
import mazingLogoSort from "../assets/images/MazingLogoSort.jpg";
import CartIcon from "../assets/icons/CartIcon.svg";
import promo3 from "../assets/images/promo3.jpg";

import { getLoggedInUser } from "../utils/authUtils";
import {
  addToCart,
  getGenericProducts,
  getMasterProducts,
  productDetails,
} from "../api/apiRequest";
import ProductModal, { GenericProductsModal as ProductCompatibleProductsModal } from "../components/ProductModal";

import ProductDetailsBottom from "../components/ProductDetailsBottom";
import TopSellingProducts from "../components/TopSellingProducts";
import RelatedProductsSlider from "../components/RelatedProductsSlider";
import RecentlyViewedSlider from "../components/RecentlyViewedSlider";
import SimilerCategoryProducts from "../components/SimilerCategoryProducts";

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
    <div className="product-modal-overlay open generic-products-modal-overlay">
      <div className="product-modal-box open generic-products-modal-box">
        <div className="generic-products-modal-header">
          <div>
            <h3 className="generic-products-modal-title">
              {genericLink?.name || "Generic Products"}
            </h3>
            <p className="generic-products-modal-subtitle">
              Verified compatible products
            </p>
          </div>

          <button onClick={onClose} type="button" aria-label="Close" className="generic-products-modal-close">
            <FiX />
          </button>
        </div>

        {products.length === 0 ? (
          <p className="generic-products-empty">No products found.</p>
        ) : (
          <div className="generic-products-grid">
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
                <div key={item.id} className="generic-product-card">
                  <button
                    type="button"
                    onClick={() => handleGenericAddToCart(item)}
                    disabled={addingId === item.id}
                    className="generic-product-add-btn"
                  >
                    <img src={CartIcon} alt="" className="generic-product-add-icon" />
                    {addingId === item.id ? "Adding..." : "Add to Cart"}
                  </button>

                  <div className="generic-product-image-wrap">
                    <img
                      src={imageUrl}
                      alt={item?.name || "Product"}
                      className="generic-product-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = no_image;
                      }}
                    />

                    {(hasFastDelivery || hasWarranty) && (
                      <div className="generic-product-tags">
                        {hasFastDelivery && (
                          <span className="generic-product-tag">
                            <img
                              src={fastDeliveryIcon}
                              alt=""
                              className="generic-product-tag-icon generic-product-tag-icon-invert"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            Fast Delivery
                          </span>
                        )}

                        {hasWarranty && (
                          <span className="generic-product-tag">
                            <img
                              src={warrantyIcon}
                              alt=""
                              className="generic-product-tag-icon generic-product-tag-icon-round"
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

                  <h4 className="generic-product-name">
                    {item?.name?.length > 70 ? `${item.name.substring(0, 70)}...` : item?.name}
                  </h4>

                  <p className="generic-product-part">
                    Part No: <b>{item?.part_no}</b>
                  </p>

                  <div className="generic-product-price">
                    <span className="generic-product-mrp">₹{mrp.toFixed(2)}</span>
                    <span className="generic-product-active-price">₹{price.toFixed(2)}</span>
                  </div>

                  <p className="generic-product-mcoin">Earn MCoin : {earnedMCoin.toFixed(2)}</p>

                  <p className="generic-product-subtotal">Subtotal : ₹{subtotal.toFixed(2)}</p>

                  <div className="generic-product-footer">
                    <div className="generic-product-qty-cart">
                      <button
                        type="button"
                        onClick={() => updateGenericQty(item, qty - 1)}
                        className="generic-product-qty-btn"
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => updateGenericQty(item, e.target.value)}
                        className="generic-product-qty-input"
                      />

                      <button
                        type="button"
                        onClick={() => updateGenericQty(item, qty + 1)}
                        className="generic-product-qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="generic-product-bulk-actions">
                      <p className="generic-product-bulk-text">
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
                        className={
                          useBulkDiscount
                            ? "generic-product-bulk-btn discount-applied"
                            : "generic-product-bulk-btn"
                        }
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
  const [productVariations, setProductVariations] = useState([]);
  const [selectedVariationValues, setSelectedVariationValues] = useState({});
  const [allVarientProducts, setAllVarientProducts] = useState([]);
  const [genericMasters, setGenericMasters] = useState([]);
  const [loadingGenericProducts, setLoadingGenericProducts] = useState(false);
  const [genericFetchCompleted, setGenericFetchCompleted] = useState(false);
  const [masterProducts, setMasterProducts] = useState([]);
  const [loadingMasterProducts, setLoadingMasterProducts] = useState(false);
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

  const reviewItems = useMemo(() => {
    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

    return reviews.map((review, index) => {
      const companyName = String(review?.company_name ?? "").trim();
      const rawDate =
        review?.created_at || review?.date || review?.reviewed_at || "";
      const parsedDate = rawDate ? new Date(rawDate) : null;

      return {
        id: review?.id || `review-${index}`,
        companyName,
        rating: Math.min(5, Math.max(0, Number(review?.rating || 0))),
        comment:
          review?.comment ||
          review?.review ||
          review?.description ||
          review?.message ||
          "",
        date:
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : rawDate,
      };
    });
  }, [product]);

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviewItems.filter(
        (review) => Math.round(review.rating) === stars
      ).length;

      return {
        stars,
        count,
        percentage: totalRatings ? Math.round((count / totalRatings) * 100) : 0,
      };
    });
  }, [reviewItems, totalRatings]);

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

  const genericLinks = genericMasters.flatMap((master) =>
    Array.isArray(master?.generic_links) ? master.generic_links : []
  );
  const hasGenericMasters = genericLinks.length > 0;
  const compatibleCategories = hasGenericMasters
    ? genericMasters.flatMap((master) =>
        (Array.isArray(master?.generic_links) ? master.generic_links : []).map((link) => ({
        id: `generic-link-${link.id}`,
        name: link?.name || "Products",
        product_count: Number(
          link?.product_count ?? (Array.isArray(link?.products) ? link.products.length : 0)
        ),
        products: Array.isArray(link?.products) ? link.products : [],
        downloadable: true,
        download_type: "generic",
        master_product_id: product?.id,
        generic_masters_id: master?.id,
        generic_links_id: link?.id,
      }))
    )
    : masterProducts.map((master) => ({
        id: `master-${master.id}`,
        name: master?.name || "Products",
        product_count: Array.isArray(master?.master_products)
          ? master.master_products.length
          : 0,
        products: Array.isArray(master?.master_products) ? master.master_products : [],
        downloadable: true,
        download_type: "master",
        master_product_id: product?.id,
        generic_masters_id:
          master?.generic_masters_id ??
          master?.generic_master_id ??
          master?.id,
        generic_links_id:
          master?.generic_links_id ??
          master?.generic_link_id ??
          master?.generic_master_link_id ??
          master?.generic_links?.[0]?.id,
      }));
  const hasCompatibleCategories = compatibleCategories.length > 0;
  const relatedProducts = useMemo(() => {
    const links = genericMasters.flatMap((master) =>
      Array.isArray(master?.generic_links) ? master.generic_links : []
    );
    const items =
      links.length > 0
        ? links.flatMap((link) => (Array.isArray(link?.products) ? link.products : []))
        : masterProducts.flatMap((master) =>
            Array.isArray(master?.master_products) ? master.master_products : []
          );

    return Array.from(
      new Map(
        items
          .filter((item) => item?.id)
          .map((item) => [String(item.id), item])
      ).values()
    );
  }, [genericMasters, masterProducts]);

  const openCompatibleProductsModal = () => {
    setSelectedGenericLink({
      id: "compatible-products",
      name: "Compatible Spare Parts",
      subtitle: product?.name
        ? `Verified components for ${product.name}`
        : "Verified components for this product",
      categories: compatibleCategories,
    });
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
    setProductVariations([]);
    setSelectedVariationValues({});
    setAllVarientProducts([]);
    setGenericMasters([]);
    setLoadingGenericProducts(false);
    setUseMainBulkDiscount(false);

    try {
      const cleanSlug = String(slug || "").trim();
      if (!cleanSlug) throw new Error("Slug missing in URL");

      const payload = await productDetails(cleanSlug);

      const ok =
        payload?.res === true || payload?.res === 1 || payload?.res === "true";

      if (!ok) throw new Error(payload?.msg || "API returned res=false");

      const p = Array.isArray(payload?.data) ? payload.data[0] : null;
      if (!p) throw new Error("Product not found in payload.data[0]");

      setProduct(p);
      setApiAttributes(Array.isArray(payload?.attributes) ? payload.attributes : []);
      setProductVariations(
        Array.isArray(payload?.product_variations) ? payload.product_variations : []
      );
      setSelectedVariationValues(payload?.selected_values || {});
      setAllVarientProducts(
        Array.isArray(payload?.all_varient_products)
          ? payload.all_varient_products
          : Array.isArray(payload?.all_variant_products)
            ? payload.all_variant_products
            : []
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

  useEffect(() => {
    if (!product?.id) return;

    let ignore = false;

    const fetchGenericProducts = async () => {
      setLoadingGenericProducts(true);
      setGenericFetchCompleted(false);
      setGenericMasters([]);

      try {
        const response = await getGenericProducts(product.id);

        if (ignore) return;

        const masters = Array.isArray(response?.generic_masters)
          ? response.generic_masters
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setGenericMasters(response?.res ? masters : []);
      } catch (e) {
        if (!ignore) {
          console.error("Generic products fetch error:", e);
          setGenericMasters([]);
        }
      } finally {
        if (!ignore) {
          setLoadingGenericProducts(false);
          setGenericFetchCompleted(true);
        }
      }
    };

    fetchGenericProducts();

    return () => {
      ignore = true;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id || !genericFetchCompleted) return;

    const genericLinks = genericMasters.flatMap((master) =>
      Array.isArray(master?.generic_links) ? master.generic_links : []
    );

    if (genericLinks.length > 0) {
      setLoadingMasterProducts(false);
      setMasterProducts([]);
      return;
    }

    let ignore = false;

    const fetchMasterProducts = async () => {
      setLoadingMasterProducts(true);
      setMasterProducts([]);

      try {
        const response = await getMasterProducts(product.id);

        if (ignore) return;

        const masters = Array.isArray(response?.generic_masters)
          ? response.generic_masters
          : [];

        setMasterProducts(response?.res ? masters : []);
      } catch (e) {
        if (!ignore) {
          console.error("Master products fetch error:", e);
          setMasterProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoadingMasterProducts(false);
        }
      }
    };

    fetchMasterProducts();

    return () => {
      ignore = true;
    };
  }, [product?.id, genericFetchCompleted, genericMasters]);

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
                <div className="product-details-loading">Loading...</div>
              ) : err ? (
                <div className="product-details-error">{err}</div>
              ) : (
                <>
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={productName}
                      className={`main-product-img ${user_id != null ? "main-product-img-clickable" : ""}`}
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
                    <div className="product-no-image">No Image</div>
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

                  {loadingGenericProducts && (
                    <div className="product-details-info-panel">
                      <p className="product-details-info-panel-title">
                        Loading generic products...
                      </p>
                    </div>
                  )}

                  {!loadingGenericProducts && hasCompatibleCategories && (
                    <button
                      type="button"
                      onClick={openCompatibleProductsModal}
                      className="product-modal-compatible-btn"
                    >
                      <FiSettings />
                      <span>
                        {hasGenericMasters
                          ? "Buy Related Products"
                          : "Buy Related Products"}
                      </span>
                    </button>
                  )}

                  {loadingMasterProducts && !hasGenericMasters && (
                    <div className="product-details-info-panel">
                      <p className="product-details-info-panel-title">
                        Loading master products...
                      </p>
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
                  className="before-reg-btn before-reg-btn--spaced"
                >
                  Register to check prices
                </button>
              )}
            </div>
          </div>

          <div className="product-details-page product-details-live-bottom">
            <div className="product-details-sidebar-column">
              <TopSellingProducts />

              <div className="promo-card style3">
                <img src={promo3} alt="Promo 3" />
                <div className="promo-content">
                  <h3>
                    Power Meets Precision Get the Job Done with HiKOKI
                  </h3>
                  <p>
                    Take control of your projects with the HiKOKI DV13VSS
                    Impact Drill – your reliable partner for drilling
                    through wood, steel, and concrete with ease.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/quick-order")}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
            
            <section className="product-main product-details-tab-panel">
              <div className="tabs-row">
                <div className="tabs product-detail-tabs">
                  <button
                    className={activeTab === "specs" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("specs")}
                    type="button"
                  >
                    Specification
                  </button>
                  
                  <button
                    className={activeTab === "desc" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("desc")}
                    type="button"
                  >
                    Description
                  </button>

                  

                  <button
                    className={activeTab === "reviews" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("reviews")}
                    type="button"
                  >
                    Reviews
                  </button>
                </div>
              </div>

              {activeTab === "specs" ? (
                <div className="specs-table">
                  <div className="specs-grid">
                    {loading ? (
                      <div className="product-details-loading-sm">Loading...</div>
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
              ) : activeTab === "desc" ? (
                <div className="desc-section">
                  {loading ? (
                    <div className="product-details-loading-sm">Loading...</div>
                  ) : (
                    <p>
                      {descriptionText || "No description available."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="tab-reviews-section product-reviews-tab">
                  <div className="average-rating">
                    <h4>Average Rating</h4>

                    <div className="average-rating-inner">
                      <div className="avg-rating-score">
                        <div className="avg-rating-score-inner">
                          <span className="score">
                            {computedRating.toFixed(1)}
                          </span>

                          <span className="score-lft">
                            <span className="stars">
                              {renderRating(computedRating)}
                            </span>
                            <span className="total-reviews">
                              {totalRatings} Reviews
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="rating-bars">
                        {ratingDistribution.map((rating) => (
                          <div key={rating.stars} className="bar-row">
                            <span className="bar-label">{rating.stars}.0</span>
                            <div className="bar-container">
                              <div className="bar-bg">
                                <div
                                  className="bar-fill"
                                  style={{ width: `${rating.percentage}%` }}
                                />
                              </div>
                              <span className="percentage">
                                {rating.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="reviews-section">
                    <h4>Customer Feedback</h4>

                    {reviewItems.length > 0 ? (
                      reviewItems.map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-content">
                            <div className="review-content-top">
                              <span className="review-content-top-lft">
                                <img
                                  src={mazingLogoSort}
                                  alt="Mazing Business"
                                  className="avatar review-company-logo"
                                />

                                <span>
                                  <h5>{review.companyName || "Customer"}</h5>
                                  {review.date && (
                                    <span className="date">{review.date}</span>
                                  )}
                                </span>
                              </span>

                              <span className="review-stars">
                                {renderRating(review.rating)}
                              </span>
                            </div>

                            <p>{review.comment || "No review comment provided."}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="product-reviews-empty">
                        No reviews available for this product.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {relatedProducts.length > 0 && (
                <div className="detalisSliderPart product-related-products">
                  <RelatedProductsSlider
                    products={relatedProducts}
                    title="Related Products"
                    enableAddToCart
                  />
                </div>
              )}

              {user_id != null && (
                <>
                  <RecentlyViewedSlider />
                  <SimilerCategoryProducts
                    categoryId={product?.category_id || product?.category?.id}
                  />
                </>
              )}
            </section>
          </div>

          {Array.isArray(allVarientProducts) && allVarientProducts.length > 0 && (
            <div className="product-details-bottom">
              <ProductDetailsBottom
                product={product}
                productVariations={productVariations}
                selectedVariationValues={selectedVariationValues}
                allVarientProducts={allVarientProducts}
              />
            </div>
          )}

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

      <ProductCompatibleProductsModal
        isOpen={genericModalOpen}
        onClose={closeGenericProductsModal}
        genericLink={selectedGenericLink}
      />

    </MainLayout>
  );
};

export default ProductDetails;
