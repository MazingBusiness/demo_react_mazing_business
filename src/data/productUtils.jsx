import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useLocation } from "react-router-dom";

// Assets
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import product1 from "../assets/images/product.jpg";

import {getCatProduct} from "../api/apiRequest";
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

// Products Array
// export const products = [
//   {
//     id: 1,
//     name: "Drill1212 Machine",
//     img: product1,
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4.5,
//     totalRatings: 300,
//     sold: "250/531",
//     discount: "20%",
//     noCredit: true,
//   },
//   {
//     id: 2,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 3,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 4,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 5,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 6,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 7,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 8,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
//   {
//     id: 9,
//     name: "Electric Saw",
//     img: product1,
//     oldPrice: "₹2,500",
//     newPrice: "₹2,000",
//     rating: 3.5,
//     totalRatings: 100,
//     sold: "148/2056",
//     discount: "25%",
//     noCredit: false,
//   },
// ];

// ⭐ Rating Renderer
export const renderRating = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

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

// 📦 Product Image + Icons
export const renderProductImage = (product, onCartClick = () => {}) => {
  return (
    <div className="product-img">
      {product.img ? (
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-product.jpg";
          }}
        />
      ) : (
        <div className="image-placeholder">
          <span>No Image</span>
        </div>
      )}

      <div className="btnGrp">
        <button className="wishlist-btn" aria-label="Add to wishlist">
          <img src={HeartIcon} alt="HeartIcon" />
        </button>

        <button
          className="cart-btn"
          aria-label="Add to cart"
          onClick={(e) => {
            e.stopPropagation(); // prevent click bubbling
            onCartClick(product); // call the modal open function
          }}
        >
          <img src={CartIcon} alt="CartIcon" />
        </button>
      </div>

      {product.noCredit && <div className="no-credit-tag">No Credit Item</div>}
    </div>
  );
};

// ✅ Dummy Component Export (Optional)
const ProductUtils = () => {
  return <div>Helper functions for products (productUtils.jsx)</div>;
};

export default ProductUtils;