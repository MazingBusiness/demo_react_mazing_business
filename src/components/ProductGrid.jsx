import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { getCatProduct } from "../api/apiRequest";
import ProductModal from "../components/ProductModal.jsx";

import { GoDotFill } from "react-icons/go";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";

import { getLoggedInUser } from "../utils/authUtils";
// import { NotificationManager } from "react-notifications"; // if you use it

const ProductGrid = () => {
  const { state } = useLocation();

  const [slug, setSlug] = useState(state?.slug || "");
  const [cat_id, setCatId] = useState(state?.cat_id || "");

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false); // prevent double api calls

  const [categoryName, setCategoryName] = useState("");
  const [categoryGroupName, setCategoryGroupName] = useState("");

  const [totalRecord, setTotalRecord] = useState(0);
  const [products, setProducts] = useState([]);

  const user = getLoggedInUser();

  // Sort (kept as is)
  const [sortBy, setSortBy] = useState("Popularity");
  const sortOptions = ["Popularity", "Price: Low to High", "Price: High to Low"];

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const [hasMore, setHasMore] = useState(true);
  const [lastPage, setLastPage] = useState(null);

  // IntersectionObserver target
  const loaderRef = useRef(null);

  // Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  // when route state changes
  useEffect(() => {
    setSlug(state?.slug || "");
    setCatId(state?.cat_id || "");

    // reset list for new category
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setLastPage(null);
    setTotalRecord(0);
  }, [state]);

  const handleSortChange = (option) => {
    setSortBy(option);
    // Optional: if your API supports sort, reset and reload
    // setProducts([]); setCurrentPage(1); setHasMore(true);
  };

  const renderProductImage = (product, onCartClick = () => {}) => {
    return (
      <div className="product-img">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = no_image;
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
            <img src={no_image} alt="No Image" loading="lazy" />
          </div>
        )}

        {product.user_id != null && (
          <div className="btnGrp">
            <button className="wishlist-btn" aria-label="Add to wishlist">
              <img src={HeartIcon} alt="HeartIcon" />
            </button>

            <button
              className="cart-btn"
              aria-label="Add to cart"
              onClick={(e) => {
                e.stopPropagation();
                onCartClick(product);
              }}
            >
              <img src={CartIcon} alt="CartIcon" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const transformProducts = (productList) => {
    const safeList = Array.isArray(productList) ? productList : [];

    return safeList.map((item) => {
      const noCredit = item.cash_and_carry_item == 1;
      const fastDeliveryTag = item.fast_delivery_tag == 1;

      const rating = item.rating && item.rating !== 0 ? item.rating : 4;
      const totalRatings =
        Array.isArray(item.reviews) && item.reviews.length > 0
          ? item.reviews.length
          : 20;

      return {
        id: item.id,
        name: item.name,
        img: item.thumb_img?.file_name || no_image,
        oldPrice: item.mrp
          ? `₹${parseFloat(item.mrp.toString()).toFixed(2)}`
          : "₹0.00",
        newPrice: item.discount_price
          ? `₹${parseFloat(
              item.discount_price.toString().replace(/₹/g, "")
            ).toFixed(2)}`
          : "₹0.00",
        rating,
        totalRatings,
        sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
          Math.random() * 200 + 50
        )}`,
        fastDeliveryTag,
        noCredit,
        discount: item.discount ? `${item.discount.toString()}%` : "20%",
        user_id: user?.id || null,
      };
    });
  };

  const getCatProductRecord = useCallback(
    async (page) => {
      if (!cat_id) return;
      if (loadingRef.current) return; // block duplicates
      if (!hasMore && page !== 1) return;

      try {
        loadingRef.current = true;
        setLoading(true);

        const apiRes = await getCatProduct(cat_id, page);
        const responseData = await apiRes.json();

        if (responseData?.res) {
          const categoryData = responseData.categoryData;
          const productList = responseData?.data?.data || [];

          setCategoryName(categoryData?.name || "");
          setCategoryGroupName(categoryData?.category_group?.name || "");
          setTotalRecord(responseData?.data?.total || 0);

          // pagination meta
          const lp = responseData?.data?.last_page || null;
          setLastPage(lp);

          const transformedData = transformProducts(productList);

          setProducts((prev) => {
            if (page === 1) return transformedData;
            return [...(Array.isArray(prev) ? prev : []), ...transformedData];
          });

          // hasMore
          if (lp != null) {
            setHasMore(page < Number(lp));
          } else {
            // fallback: stop if empty response
            setHasMore(transformedData.length > 0);
          }
        } else {
          // if you use notification manager:
          // NotificationManager.error(responseData?.msg || "Something went wrong", "", 2000);
          console.error(responseData?.msg || "Something went wrong");
          setHasMore(false);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        // NotificationManager.error("Failed to load products", "", 2000);
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [cat_id, hasMore]
  );

  // initial + page loads
  useEffect(() => {
    if (cat_id) getCatProductRecord(currentPage);
  }, [cat_id, currentPage, getCatProductRecord]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !loadingRef.current) {
          setCurrentPage((p) => p + 1);
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore]);

  return (
    <div className="product-section-wrapper">
      {/* Loader */}
      {loading && (
        <div className="blur-loader-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        Home
        <em>
          <GoDotFill />
        </em>
        All Category
        <em>
          <GoDotFill />
        </em>
        {categoryGroupName}
        <em>
          <GoDotFill />
        </em>
        <span className="current">{categoryName}</span>
      </div>

      {/* Result and Sort */}
      <div className="product-header">
        <div className="product-count">
          Result: <strong>{totalRecord} Products</strong>
        </div>

        <div className="sort-by">
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {(Array.isArray(products) ? products : []).map((product) => (
          <div key={product.id} className="product-box">
            <div className="product-card">
              {renderProductImage(product, openModal)}

              <div className="product-info">
                <h3>
                  {product.name?.length > 30
                    ? `${product.name.substring(0, 30)}...`
                    : product.name}
                </h3>

                {product.user_id != null && (
                  <div className="prices">
                    <span className="old">{product.oldPrice}</span>
                    <span className="new">{product.newPrice}</span>
                  </div>
                )}

                <div className="ratingGrp">
                  <div className="ratingGrpLft">
                    <div className="discount">OFF {product.discount}</div>
                  </div>

                  <div className="delivery">
                    <img
                      src={fastDeliveryIcon}
                      alt="Fast Delivery"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Infinite scroll sentinel */}
      <div ref={loaderRef} style={{ height: 1 }} />

      {/* Optional: end message */}
      {!loading && !hasMore && products.length > 0 && (
        <div style={{ textAlign: "center", padding: 16, opacity: 0.7 }}>
          You’ve reached the end.
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: 16, opacity: 0.7 }}>
          No products found.
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProductGrid;