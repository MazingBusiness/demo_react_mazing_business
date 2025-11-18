import React, { useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import fastDeliveryIcon from "../../assets/icons/fast-delivery.svg";
import HeartIcon from "../../assets/icons/love.svg";
import DeleteIcon from "../../assets/icons/Delete2.svg";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import product1 from "../../assets/images/product.jpg";
import product2 from "../../assets/images/product.jpg";

const initialProducts = [
  {
    id: 1,
    name: "Drill Machine",
    img: product1,
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 300,
    sold: "250/531",
    discount: "20%",
  },
  {
    id: 2,
    name: "Cutting Tool",
    img: product2,
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
];

const renderRating = (rating) => {
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

const ProfileWishlist = () => {
  const [products, setProducts] = useState(initialProducts);

  const handleDelete = (id) => {
    const updated = products.filter((product) => product.id !== id);
    setProducts(updated);
  };

  const renderProductImage = (product) => (
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
          aria-label="Delete"
          onClick={() => handleDelete(product.id)}
        >
          <img src={DeleteIcon} alt="DeleteIcon" />
        </button>
      </div>
    </div>
  );

  return (
    <UserProfileLayout>
      <div className="wishlist-container">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <h2>My Wishlist</h2>
          </div>
        </div>
        <div className="wishlist-grid">
          {products.length === 0 ? (
            <p className="Nofound">No wishlist items found.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-box">
                <div className="product-card">
                  {renderProductImage(product)}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="prices">
                      <span className="old">{product.oldPrice}</span>
                      <span className="new">{product.newPrice}</span>
                    </div>
                    <div className="ratingGrp">
                      <div className="ratingGrpLft">
                        <div className="discount">OFF {product.discount}</div>
                        <div className="rating">
                          {renderRating(product.rating)}
                          <span className="rating-count">
                            ({product.totalRatings})
                          </span>
                        </div>
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
                      <div
                        className="progress"
                        style={{
                          width: `${Math.random() * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="sold">Sold: {product.sold}</div>
                    <button className="AddCart">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileWishlist;
