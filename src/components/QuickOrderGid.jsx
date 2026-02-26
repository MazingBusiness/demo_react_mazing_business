import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/HrIcon3.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import ProductModal from "../components/ProductModal.jsx";
import { GoDotFill } from "react-icons/go";

import { getQuickOrderProduct } from "../api/apiRequest";
import { getLoggedInUser } from "../utils/authUtils";

import { renderRating } from "../data/QuickOrderUtils.jsx";

const QuickOrderGrid = (props) => {
  const { filters } = props;
  const { state } = useLocation();
  const navigate = useNavigate();
  const loaderRef = useRef(null);

  const initialSlug = state?.slug || "";
  const initialCatGroups = state?.cat_groups || "";
  const initialCategories = state?.categories || "";
  const initialBrands = state?.brands || "";
  const initialSearchText = state?.search_text || "";
  const initialMinPrice = state?.min_price || "";
  const initialMaxPrice = state?.max_price || "";
  const initialLocationId = state?.location_id || "";
  const initialInhouseProduct = state?.inhouse_product || "";

  const [slug, setSlug] = useState(initialSlug);
  const [cat_groups, setCatgroup] = useState(initialCatGroups);
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);
  const [search_text, setSearchText] = useState(initialSearchText);
  const [min_price, setMinPrice] = useState(initialMinPrice);
  const [max_price, setMaxPrice] = useState(initialMaxPrice);
  const [location_id, setLocationId] = useState(initialLocationId);
  const [inhouse_product, setInhouseProduct] = useState(initialInhouseProduct);

  const [categoryName, setCategoryName] = useState("");
  const [categoryGroupName, setCategoryGroupName] = useState("");
  const user = getLoggedInUser();

  // ----- Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const productsPerPage = 16;
  const [hasMore, setHasMore] = useState(true);
  // ---------------------

  // Keep slug/catId in sync with location state
  useEffect(() => {
    if (state) {
      setSlug(state.slug || "");
      // NOTE: you had setCatId here but no state exists; keeping your original intention:
      setCatgroup(state.cat_groups || "");
    }
  }, [state]);

  const [price_sort, setPriceSort] = useState("Popularity");

  const currentProducts = products;

  const handleSortChange = (value) => {
    setPriceSort(value);
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
  };

  // ✅ Modal State FIX
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (product) => {
    // ✅ set product first then open
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    // ✅ close first, then clear product to avoid stale flash
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const getQuickOrderProductRecord = async (page = 1) => {
    try {
      setLoading(true);

      const apiRes = await getQuickOrderProduct(
        filters.cat_groups,
        filters.categories,
        filters.brands,
        filters.search_text,
        filters.min_price,
        filters.max_price,
        filters.location_id,
        filters.inhouse_product,
        price_sort,
        filters.delivery,
        page
      );

      const responseData = await apiRes.json();

      if (responseData.res) {
        const productList = responseData.data?.data || [];
        const total = responseData.data?.total || 0;

        setTotalRecord(total);

        const transformedData = productList.map((item) => {
          const noCredit = item.cash_and_carry_item === 1;
          const fastDeliveryTagVal = item.fast_delivery_tag === 1;
          const hasWarranty = item.is_warranty === 1;

          const rating = item.rating && item.rating !== 0 ? item.rating : 4;
          const totalRatings =
            Array.isArray(item.reviews) && item.reviews.length > 0
              ? item.reviews.length
              : 20;

          return {
            id: item.id,
            name: item.name,
            img: item.thumb_img?.file_name || no_image,
            oldPrice: item.mrp ? `₹${parseFloat(item.mrp).toFixed(2)}` : "₹0.00",
            newPrice: item.discount_price
              ? `₹${parseFloat(String(item.discount_price).replace(/₹/g, "")).toFixed(2)}`
              : "₹0.00",
            rating,
            totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
              Math.random() * 200 + 50
            )}`,
            fastDeliveryTag: fastDeliveryTagVal,
            is_warranty: hasWarranty,
            noCredit,
            discount: item.discount ? `${item.discount}%` : "20%",
            user_id: user?.id || null,
            category_group: item.category_group?.name,
            category: item.category?.name,
            fast_delivery_tag: item.fast_delivery_tag,
            stocks: item.stocks,
            reviews: item.reviews,
          };
        });

        setProducts((prev) =>
          page === 1 ? transformedData : [...prev, ...transformedData]
        );

        const computedTotalPages = Math.ceil(total / productsPerPage) || 1;
        setHasMore(page < computedTotalPages);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fastDeliveryTag = (product) => {
    if (!product.fastDeliveryTag) return null;
    return (
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
    );
  };

  const renderWarrantyTag = (product) => {
    if (!product.is_warranty) return null;
    return (
      <div className="delivery">
        <img src={warrantyIcon} alt="Warranty" loading="lazy" />
      </div>
    );
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
            onClick={(e) => {
              e.stopPropagation();
              onCartClick(product);
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
            <button
              className="cart-btn"
              aria-label="Add to cart"
              onClick={(e) => {
                e.stopPropagation();
                onCartClick(product);
              }}
              type="button"
            >
              <img src={CartIcon} alt="CartIcon" /> Add to Cart
            </button>
          </div>
        )}
      </div>
    );
  };

  // Called function with current page for pagination
  useEffect(() => {
    getQuickOrderProductRecord(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    filters.cat_groups,
    filters.categories,
    filters.brands,
    filters.search_text,
    filters.min_price,
    filters.max_price,
    filters.location_id,
    filters.inhouse_product,
    price_sort,
    filters.delivery,
  ]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // When filters change, reset and fetch page 1
  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    getQuickOrderProductRecord(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.cat_groups,
    filters.categories,
    filters.brands,
    filters.search_text,
    filters.min_price,
    filters.max_price,
    filters.location_id,
    filters.inhouse_product,
    price_sort,
    filters.delivery,
  ]);

  return (
    <div className="product-section-wrapper">
      <div className="product-header">
        <div className="product-count">
          Result: <strong>{totalRecord} Products</strong>
        </div>
        <div className="sort-by">{/* sorting UI if needed */}</div>
      </div>

      <div className="product-grid Quick-grid">
        {!loading && currentProducts.length === 0 && (
          <div className="no-products">No products found.</div>
        )}

        {currentProducts.map((product) => (
          <div key={product.id} className="product-box">
            <div className="product-card">
              {renderProductImage(product, openModal)}
              <div className="product-info">
                <h3 title={product.name}>
                  {product.name.length > 25
                    ? product.name.substring(0, 25) + "..."
                    : product.name}
                </h3>

                {product.user_id != null && (
                  <div className="prices">
                    <span className="old">{product.oldPrice}</span>
                    <span className="new">{product.newPrice}</span>
                  </div>
                )}

                <div className="ratingGrp">
                  <div className="ratingGrpLft">{renderWarrantyTag(product)}</div>
                  {fastDeliveryTag(product)}
                </div>

                {product.user_id == null && (
                  <div>
                    <button
                      type="button"
                      className="before-reg-btn"
                      onClick={() => navigate("/register")}
                    >
                      Register to check prices
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll loader */}
      <div ref={loaderRef} style={{ height: 1 }} />
      {loading && (
        <div className="loader">
          {currentPage === 1 ? "Loading products…" : "Loading products…"}
        </div>
      )}
      {!hasMore && !loading && products.length > 0 && (
        <div className="no-more">You reached the end.</div>
      )}

      {/* ✅ Product Modal (FIXED) */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          key={selectedProduct.id} // ✅ force remount to avoid old data flash
          product={selectedProduct}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default QuickOrderGrid;