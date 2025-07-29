import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {getCatProduct} from "../api/apiRequest";
// import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

// import { products, renderRating, renderProductImage } from "../data/productUtils.jsx";

import ProductModal from "../components/ProductModal.jsx";

import { GoDotFill } from "react-icons/go";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";

import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

const ProductGrid = () => {
  // Get the value from
  const { state } = useLocation();
  const initialSlug = state?.slug || "";
  const initialCatId = state?.cat_id || "";
  const [slug, setSlug] = useState(initialSlug);
  const [cat_id, setCatId] = useState(initialCatId);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryGroupName, setCategoryGroupName] = useState("");
  const [totalRecord, setTotalRecord] = useState("");
  const [products, setProducts] = useState([]);
  const user = getLoggedInUser();
  useEffect(() => {
    setSlug(state.slug);
    setCatId(state.cat_id);
  }, [state]);

  const [sortBy, setSortBy] = useState("Popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  // const totalPages = Math.ceil(products.length / productsPerPage);
  const totalPages = Math.ceil(totalRecord / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  // const currentProducts = products.slice(startIndex, endIndex);
  const currentProducts = products;

  const handleSortChange = (option) => {
    setSortBy(option);
  };

  const sortOptions = [
    "Popularity",
    "Price: Low to High",
    "Price: High to Low",
  ];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const getCatProductRecord = async () => {
    try {
      setLoading(true); // 👈 Show loader before API call
      const apiRes = await getCatProduct(cat_id, currentPage);
      const responseData = await apiRes.json();
      if (responseData.res) {
        const categoryData = responseData.categoryData;
        const productList = responseData.data.data || [];

        setCategoryName(categoryData?.name || "");
        setCategoryGroupName(categoryData?.category_group?.name || "");
        setTotalRecord(responseData.data.total || 0);
        // setProducts(productList); // 👈 store products
        // console.log(productList);

        const transformedData =productList.map((item) => {
          // console.log(item.thumb_img?.file_name);
          // const details = item || {};
          const noCredit = item.cash_and_carry_item == 1;
          const fastDeliveryTag = item.fast_delivery_tag == 1;
          const rating = item.rating && item.rating !== 0 ? item.rating : 4;
          const totalRatings = Array.isArray(item.reviews) && item.reviews.length > 0 ? item.reviews.length : 20;
          return {
            id: item.id,
            name: item.name,
            img: item.thumb_img?.file_name || no_image,
            oldPrice: item.mrp ? `₹${parseFloat(item.mrp.toString()).toFixed(2)}` : "₹0.00",
            newPrice: item.discount_price ? `₹${parseFloat(item.discount_price.toString().replace(/₹/g, '')).toFixed(2)}` : "₹0.00",
            // oldPrice: item.mrp ? parseFloat(item.mrp).replace(/₹/g, '').toFixed(2) : "0.00",            
            // newPrice: item.discount_price ? parseFloat(item.discount_price.toString().replace(/₹/g, '')).toFixed(2) : "0.00",
            rating: rating,
            totalRatings: totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(Math.random() * 200 + 50)}`,
            fastDeliveryTag: fastDeliveryTag,
            noCredit: noCredit,
            discount: item.discount ? `${item.discount.toString()}%` : "20%",
            user_id: user?.id || null,
          };
        });
        setProducts(transformedData);
      } else {
        NotificationManager.error(responseData.msg || "Something went wrong", "", 2000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      NotificationManager.error("Failed to load offers", "", 2000);
    } finally {
      setLoading(false); // 👈 Hide loader after response or error
    }
  };

  const renderProductImage = (product, onCartClick = () => {}) => {
      return (
        <div className="product-img">
          {product.img ? (
            <img src={product.img} alt={product.name} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-product.jpg"; }} />
          ) : (
            <div className="image-placeholder">
              <span>No Image</span>
              <img src={no_image} alt="No Image" loading="lazy" />
            </div>
          )}
          {product.user_id != null && (
            <>
              <div className="btnGrp">
                <button className="wishlist-btn" aria-label="Add to wishlist">
                  <img src={HeartIcon} alt="HeartIcon" />
                </button>
                {/* <button className="cart-btn" aria-label="Add to cart">
                  <img src={CartIcon} alt="HeartIcon" />
                </button> */}
                <button className="cart-btn" aria-label="Add to cart"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent click bubbling
                    onCartClick(product); // call the modal open function
                  }}
                >
                  <img src={CartIcon} alt="CartIcon" />
                </button>
              </div>
            </>
          )}
        </div>
      );
    };

  useEffect(() => {
    if (cat_id) {
      getCatProductRecord();
    }
  }, [cat_id, currentPage]);

  return (
    <div className="product-section-wrapper">
      {/* Loder */}
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
          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} >
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
        {currentProducts.map((product) => (
          <div key={product.id} className="product-box">
            <div className="product-card">
              {renderProductImage(product, openModal)}
              <div className="product-info">
                {/* <h3>{product.name}</h3> */}
                <h3>
                  {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
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
                    {/* <div className="rating">
                      {renderRating(product.rating)}
                      <span className="rating-count">
                        ({product.totalRatings})
                      </span>
                    </div> */}
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
                  {/* <div
                    className="progress"
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div> */}
                  <div
                    className="progress"
                    style={{ width: `100%` }}
                  ></div>
                </div>
                {/* <div className="sold">Sold: {product.sold}</div> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {/* <div className="pagination-wrapper">
        <button className="pagination-btn nav disabled">Previous</button>
        <button className="pagination-btn active">1</button>
        <button className="pagination-btn">2</button>
        <span className="pagination-btn dots">...</span>
        <button className="pagination-btn">4</button>
        <button className="pagination-btn">5</button>
        <button className="pagination-btn nav">Next</button>
      </div> */}
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

        {[...Array(totalPages)].map((_, index) => {
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

        <button className={`pagination-btn nav ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
        >
          Next
        </button>
      </div>

      {/* 🟢 Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProductGrid;
