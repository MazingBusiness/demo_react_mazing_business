import React, { useEffect, useRef } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import { FiHeart, FiX } from "react-icons/fi";

import product1 from "../assets/images/Image.png";
import image2 from "../assets/images/Image.png";
import image3 from "../assets/images/Image.png";
import image4 from "../assets/images/Image.png";
import image5 from "../assets/images/Image.png";

import CartbtnIcon from "../assets/icons/cartbtnIcon.svg";

import { GoDotFill } from "react-icons/go";

const ProductModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  const images = [product1, image2, image3, image4, image5];
  const rating = 3.5;
  const totalRatings = 12;

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

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`product-modal-overlay ${isOpen ? "open" : ""}`}>
      <div
        className={`product-modal-box ${isOpen ? "open" : ""}`}
        ref={modalRef}
      >
        <button className="product-modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="product-modal-grid">
          <div className="product-modal-content">
            {/* Left - Carousel */}
            <div className="product-modal-carousel">
              {/* Breadcrumb */}
              <div className="breadcrumb">
                Offer Price Items
                <em>
                  <GoDotFill />
                </em>
                Power Tools
                <em>
                  <GoDotFill />
                </em>
                <span className="current">HiKOKI</span>
              </div>

              <Carousel
                showThumbs
                showArrows
                showStatus={false}
                showIndicators={false}
                infiniteLoop
                renderArrowPrev={(onClickHandler, hasPrev, label) =>
                  hasPrev && (
                    <button
                      type="button"
                      onClick={onClickHandler}
                      title={label}
                      className="custom-arrow prev-arrow"
                    >
                      &#10094;
                    </button>
                  )
                }
                renderArrowNext={(onClickHandler, hasNext, label) =>
                  hasNext && (
                    <button
                      type="button"
                      onClick={onClickHandler}
                      title={label}
                      className="custom-arrow next-arrow"
                    >
                      &#10095;
                    </button>
                  )
                }
                renderThumbs={() =>
                  images.map((img, idx) => (
                    <div className="custom-thumb" key={idx}>
                      <img src={img} alt={`thumb-${idx}`} />
                    </div>
                  ))
                }
              >
                {images.map((img, idx) => (
                  <div key={idx}>
                    <img src={img} alt={`Slide ${idx}`} />
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Right - Info */}
            <div className="product-modal-info">
              <div className="product-modal-info-top">
                <div className="product-modal-info-top-lft">
                  <h2>Product Name</h2>

                  <div className="product-rating">
                    {renderRating(rating)}
                    <span className="rating-count">{totalRatings} Reviews</span>
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
                  <p>
                    Estimate Shipping Time <span>5-6 Days</span>
                  </p>
                </div>
              </div>

              <div className="product-price">
                <span className="old-price">₹2,000</span>
                <span className="new-price">₹1,800</span>
                <span className="unit">/Pc</span>
              </div>

              <div className="product-stock">
                <div className="stock-item">
                  Mumbai <span>20</span>
                </div>
                <div className="stock-item">
                  Kolkata <span>10</span>
                </div>
                <div className="stock-item">
                  Gujarat <span>05</span>
                </div>
              </div>

              <div className="bulk-discount">
                <p>
                  <span className="red">Bulk Quantity Discount:</span> Purchase
                  13 or more and get each for{" "}
                  <span className="highlight">₹1,700</span> instead of{" "}
                  <span className="highlight">₹1,800</span>
                </p>
                <button className="discount-btn">Get Discount</button>
              </div>

              <div className="quantity-section">
                <div>
                  <label>Quantity</label>
                  <input type="number" placeholder="Enter quantity" />
                </div>
                <div>
                  <label>Total Price</label>
                  <input type="text" placeholder="Amount" disabled />
                </div>
              </div>

              <div className="action-buttons">
                <button className="add-to-cart">
                  <img
                    src={CartbtnIcon}
                    alt="cartbtnIcon"
                    className="cartbtnIcon"
                  />{" "}
                  Add to Cart
                </button>
                <button className="modal-wishlist-btn">
                  <FiHeart />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
