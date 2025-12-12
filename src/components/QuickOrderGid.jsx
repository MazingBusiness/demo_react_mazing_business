import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import ProductModal from "../components/ProductModal.jsx";
import { GoDotFill } from "react-icons/go";

import { getQuickOrderProduct } from "../api/apiRequest";
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

import { renderRating } from "../data/QuickOrderUtils.jsx"; // 🔧 or define your own

const QuickOrderGrid = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
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

  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryGroupName, setCategoryGroupName] = useState("");
  const [totalRecord, setTotalRecord] = useState("");
  const [products, setProducts] = useState([]);
  const user = getLoggedInUser();

  // Keep slug/catId in sync with location state
  useEffect(() => {
    if (state) {
      setSlug(state.slug || "");
      setCatId(state.cat_groups || "");
    }
  }, [state]);

  const [sortBy, setSortBy] = useState("Popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const totalPages = Math.ceil(totalRecord / productsPerPage) || 1;

  // We’re currently using API pagination, so use the API’s page data directly
  const currentProducts = products;

  const handleSortChange = (option) => {
    setSortBy(option);
    // TODO: pass sort info to API or sort locally
  };

  const sortOptions = [
    "Popularity",
    "Price: Low to High",
    "Price: High to Low",
  ];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const getQuickOrderProductRecord = async () => {
    try {
      setLoading(true);
      const apiRes = await getQuickOrderProduct(cat_groups, categories, brands, search_text, min_price, max_price, location_id, inhouse_product, currentPage);
      const responseData = await apiRes.json();

      if (responseData.res) {
        const productList = responseData.data?.data || [];
        setTotalRecord(responseData.data?.total || 0);
        const transformedData = productList.map((item) => {
          const noCredit        = item.cash_and_carry_item === 1;
          const fastDeliveryTag = item.fast_delivery_tag === 1;
          const hasWarranty = item.is_warranty === 1;
          const rating =
            item.rating && item.rating !== 0 ? item.rating : 4;
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
              is_warranty: hasWarranty,   // 👈 add this
              noCredit,
              discount: item.discount ? `${item.discount.toString()}%` : "20%",
              user_id: user?.id || null,
              category_group: item.category_group.name,
              category: item.category.name,
              fast_delivery_tag: item.fast_delivery_tag,
              stocks: item.stocks,
              reviews: item.reviews,
            };
          });
        setProducts(transformedData);
      } else {
        NotificationManager.error(
          responseData.msg || "Something went wrong",
          "",
          2000
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      NotificationManager.error("Failed to load products", "", 2000);
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
    if (!product.is_warranty) return null;   // ✅ now this exists
    return (
      <div className="delivery">
        <img
          src={warrantyIcon}
          alt="Warranty"
          loading="lazy"
        />
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
              e.stopPropagation(); // prevent click bubbling
              onCartClick(product); // call the modal open function
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
            <img src={no_image} alt="No Image" loading="lazy" />
          </div>
        )}

        {product.user_id != null && (
          // <div className="btnGrp">
          //   <button className="wishlist-btn" aria-label="Add to wishlist">
          //     <img src={HeartIcon} alt="HeartIcon" />
          //   </button>
          //   <button
          //     className="cart-btn"
          //     aria-label="Add to cart"
          //     onClick={(e) => {
          //       e.stopPropagation();
          //       onCartClick(product);
          //     }}
          //   >
          //     <img src={CartIcon} alt="CartIcon" />
          //   </button>
          // </div>
          <div className="btnGrp">
            {/* <button className="wishlist-btn" aria-label="Add to wishlist">
              <img src={HeartIcon} alt="HeartIcon" />
            </button> */}
            <button
              className="cart-btn"
              aria-label="Add to cart"
              onClick={(e) => {
                e.stopPropagation(); // prevent click bubbling
                onCartClick(product); // call the modal open function
              }}
            >
              <img src={CartIcon} alt="CartIcon" /> Add to Cart
            </button>
          </div>
        )}

        {/* {product.inhouse_product == "1" && (
          <span className="fast-delivery-badge">
            <img src={fastDeliveryIcon} alt="" />
            Fast Delivery
          </span>
        )} */}
      </div>
    );
  };

  // Fetch when catId or page changes
  useEffect(() => {
    getQuickOrderProductRecord();
  }, [currentPage]);

  return (
    <div className="product-section-wrapper">
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
        Power Tools
        <em>
          <GoDotFill />
        </em>
        <span className="current">Air Blower</span>
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

      {/* Loader */}
      {loading && <div className="loader">Loading products…</div>}

      {/* Product Grid */}
      <div className="product-grid Quick-grid">
        {!loading && currentProducts.length === 0 && (
          <div className="no-products">No products found.</div>
        )}

        {currentProducts.map((product) => (
          <div key={product.id} className="product-box">
            <div className="product-card">
              {renderProductImage(product, openModal)}
              <div className="product-info">
                <h3>{product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name}</h3>
                <span>{product.oldPrice}</span>
                {product.user_id != null && (
                  <div className="prices">
                    <span className="old">{product.oldPrice}</span>
                    <span className="new">{product.newPrice}</span>
                  </div>
                )}
                <div className="ratingGrp">
                  {/* <div className="ratingGrpLft">
                    {product.user_id != null && (
                      <div className="discount">OFF {product.discount}</div>
                    )}
                    <div className="rating">
                      {renderRating(product.rating)}
                      <span className="rating-count">
                        ({product.totalRatings})
                      </span>
                    </div>                    
                  </div> */}
                  <div className="ratingGrpLft">
                     {renderWarrantyTag(product)}
                  </div>
                  {fastDeliveryTag(product)}
                </div>
                {product.user_id == null && (
                    <div>
                      <button type="button" className="before-reg-btn" onClick={() => navigate("/register")}>Register to check prices</button>
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-wrapper">
        <button
          className={`pagination-btn nav ${
            currentPage === 1 ? "disabled" : ""
          }`}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        {[Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          const showDots =
            totalPages > 5 &&
            ((pageNum === 2 && currentPage > 3) ||
              (pageNum === totalPages - 1 && currentPage < totalPages - 2));

          if (showDots) {
            return (
              <span key={`dots-${pageNum}`} className="pagination-btn dots">
                ...
              </span>
            );
          }

          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}

        <button
          className={`pagination-btn nav ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
        >
          Next
        </button>
      </div>

      {/* Product Modal */}
      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={closeModal} />
    </div>
  );
};

export default QuickOrderGrid;