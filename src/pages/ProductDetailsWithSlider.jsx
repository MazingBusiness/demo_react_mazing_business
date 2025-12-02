import React, { useEffect, useRef, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import { FiHeart, FiX } from "react-icons/fi";

import Bigtick from "../assets/images/BigImage.svg";

import promo3 from "../assets/images/promo3.jpg";

import {
  products,
  renderRating,
  renderProductImage,
} from "../data/productDetailUtils.jsx";

import CartIcon from "../assets/icons/CartIcon.svg";

import product1 from "../assets/images/Image.png";
import image2 from "../assets/images/Image.png";
import image3 from "../assets/images/Image.png";
import image4 from "../assets/images/Image.png";
import image5 from "../assets/images/Image.png";
import MainLayout from "../layouts/MainLayout";

import CartbtnIcon from "../assets/icons/cartIconplus.svg";

import user1 from "../assets/images/user1.png";
import user2 from "../assets/images/user2.png";
import user3 from "../assets/images/user3.png";
import user4 from "../assets/images/user4.png";

import { GoDotFill } from "react-icons/go";
import RelatedProductsSlider from "../components/RelatedProductsSlider.jsx";
import RecentlyViewedSlider from "../components/RecentlyViewedSlider.jsx";

import Modal from "../components/Modal";

const ProductDetailsWithSlider = () => {
  const [activeTab, setActiveTab] = useState("Reviews");

  const images = [product1, image2, image3, image4, image5];
  const rating = 3.5;
  const totalRatings = 12;

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const [showTicketModal, setShowTicketModal] = useState(false);

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

  const [fileName, setFileName] = useState("");
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleTicketFormSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket form submitted!");
    setShowTicketModal(false);
  };

  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Anjali Mehta",
      date: "May 10, 2025",
      rating: 4,
      comment:
        "Lightweight and easy to handle, even for someone like me who isn't a full-time power tool user. I used it for drilling wood and plaster—did the job without trouble. A bit loud, but manageable.",
      avatar: user1,
    },
    {
      id: 2,
      name: "Ravi Sharma",
      date: "May 10, 2025",
      rating: 5,
      comment:
        "I've been using this HIKOKI drill for over a year now—still going strong. The build quality is solid, and the impact made works great on concrete walls. Very reliable tool for everyday jobs.",
      avatar: user2,
    },
    {
      id: 3,
      name: "Manoj Tiwari",
      date: "May 10, 2025",
      rating: 4,
      comment:
        "Perfect drill for site work. Has enough power for tough jobs, and the grip is comfortable for long hours. Torque is just right for most medium-duty applications. Would recommend it to pros.",
      avatar: user3,
    },
    {
      id: 4,
      name: "Pooja Reddy",
      date: "May 10, 2025",
      rating: 4,
      comment:
        "This drill made my wall shelf project so easy! I liked the control and the reverse feature. I just wish it came with a carrying case. Overall, great tool for home improvement tasks.",
      avatar: user4,
    },
  ]);

  // Rating data
  const averageRating = 3.0;
  const totalReviews = 50000;

  // Rating distribution with percentages
  const ratingDistribution = [
    { stars: 5, percentage: 90 },
    { stars: 4, percentage: 60 },
    { stars: 3, percentage: 40 },
    { stars: 2, percentage: 30 },
    { stars: 1, percentage: 0 },
  ];

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (!newReview.name || !newReview.comment || newReview.rating === 0) {
      alert("Please fill all fields and select a rating");
      return;
    }

    const newReviewObj = {
      id: reviews.length + 1,
      name: newReview.name,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      rating: newReview.rating,
      comment: newReview.comment,
      avatar: user1, // Default avatar
    };

    // Add the new review to the reviews array
    setReviews([...reviews, newReviewObj]);

    // Reset the form
    setNewReview({
      name: "",
      comment: "",
      rating: 0,
    });

    // Close the modal
    setShowTicketModal(false);
  };

  const [newReview, setNewReview] = useState({
    name: "",
    comment: "",
    rating: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setNewReview({
      ...newReview,
      rating: rating,
    });
  };

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="proDetalInner">
          <div className="productSlidercontainer">
            <div className="product-modal-inner">
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
                          <span className="rating-count">
                            {totalRatings} Reviews
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
                        <span className="red">Bulk Quantity Discount:</span>{" "}
                        Purchase 13 or more and get each for{" "}
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

                    <div className="action-buttons pd-action-buttons">
                      <button className="add-to-cart buy-now">Buy Now</button>
                      <button className="add-to-cart">
                        Buy Spares for this Product
                      </button>
                      <button className="modal-wishlist-btn">
                        <img
                          src={CartbtnIcon}
                          alt="cartbtnIcon"
                          className="cartbtnIcon"
                        />{" "}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="product-details-bottom">
              <div className="product-details-page">
                {/* Left: Top Selling Products */}
                <div className="top-products">
                  <h5>Top Selling Products</h5>
                  <div className="product-grid">
                    {currentProducts.map((product) => (
                      <div key={product.id} className="product-box">
                        <div className="product-card">
                          {renderProductImage(product)}
                          <div className="product-info">
                            <div className="product-info-top">
                              <div className="product-info-top-lft">
                                <h3>{product.name}</h3>
                                <div className="prices">
                                  <span className="old">
                                    {product.oldPrice}
                                  </span>
                                  <span className="new">
                                    {product.newPrice}
                                  </span>
                                  <div className="discount">
                                    OFF {product.discount}
                                  </div>
                                </div>
                              </div>

                              <div className="product-info-top-rgt">
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
                            </div>

                            <div className="ratingGrp">
                              <div className="ratingGrpLft">
                                <div className="rating">
                                  {renderRating(product.rating)}
                                  <span className="rating-count">
                                    ({product.totalRatings})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress"
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <div className="sold">Sold: {product.sold}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
                      <button>Shop Now</button>
                    </div>
                  </div>
                </div>

                {/* Right: Product Details */}
                <div className="product-main">
                  {/* Tabs */}
                  <div className="tabs">
                    {["Description", "Specification", "Reviews", "Others"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`tab-btn ${
                            activeTab === tab ? "active" : ""
                          }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>

                  {/* Tab Content */}
                  <div className="tab-content">
                    {activeTab === "Description" ? (
                      <div className="desc-section">
                        <p>
                          The HiKOKI DV13VSS is a compact and powerful 13 mm
                          impact drill designed for both professional and DIY
                          applications. With its 550W motor, this drill delivers
                          excellent performance in a wide range of materials
                          including wood, steel, and concrete. It features a
                          dual-mode operation — rotary drilling and impact
                          drilling — making it versatile for home renovation,
                          construction, and workshop use.
                        </p>
                        <p>
                          The variable speed trigger ensures precise control,
                          while the forward/reverse switch allows for easy
                          screwdriving and bit removal. The keyed chuck provides
                          a secure grip for various drill bits up to 13 mm in
                          diameter. Its lightweight and ergonomic design reduces
                          fatigue, making it ideal for prolonged use.
                        </p>
                        <p>
                          Backed by HiKOKI's reputation for durability and
                          innovation, the DV13VSS combines performance,
                          reliability, and comfort in one efficient tool.
                        </p>
                      </div>
                    ) : activeTab === "Specification" ? (
                      <div className="specs-table">
                        <div className="specs-grid">
                          <div className="spec-row">
                            <h3>HSN Code</h3>
                            <p>84672900</p>
                          </div>
                          <div className="spec-row">
                            <h3>GST Rate</h3>
                            <p>18%</p>
                          </div>
                          <div className="spec-row">
                            <h3>Group</h3>
                            <p>Power Tools Spares</p>
                          </div>
                          <div className="spec-row">
                            <h3>Imported By</h3>
                            <p>Not Available</p>
                          </div>
                          <div className="spec-row">
                            <h3>Power Input</h3>
                            <p>550 Watts</p>
                          </div>
                          <div className="spec-row">
                            <h3>Drilling Mode</h3>
                            <p>Rotary + Impact</p>
                          </div>
                          <div className="spec-row">
                            <h3>Category</h3>
                            <p>Category Name</p>
                          </div>
                          <div className="spec-row">
                            <h3>Contact By</h3>
                            <p>Not Available</p>
                          </div>
                          <div className="spec-row">
                            <h3>No Load Speed</h3>
                            <p>0 - 2,900 rpm</p>
                          </div>
                        </div>
                      </div>
                    ) : activeTab === "Reviews" ? (
                      <>
                        {/* Average Rating */}
                        <div className="tab-reviews-section">
                          <div className="average-rating">
                            <h4>Average Rating</h4>

                            <div className="average-rating-inner">
                              <div className="avg-rating-score">
                                <div className="avg-rating-score-inner">
                                  <span className="score">
                                    {averageRating.toFixed(1)}
                                  </span>

                                  <span className="score-lft">
                                    <div className="stars">
                                      {[...Array(5)].map((_, i) => (
                                        <FaStar
                                          key={i}
                                          color={
                                            i < Math.floor(averageRating)
                                              ? "#FFD700"
                                              : "#ccc"
                                          }
                                        />
                                      ))}
                                    </div>
                                    <div className="total-reviews">
                                      {totalReviews.toLocaleString()} Reviews
                                    </div>
                                  </span>
                                </div>
                              </div>

                              <div className="rating-bars">
                                {ratingDistribution.map((rating) => (
                                  <div key={rating.stars} className="bar-row">
                                    <span className="bar-label">
                                      {rating.stars}.0
                                    </span>
                                    <div className="bar-container">
                                      <div className="bar-bg">
                                        <div
                                          className="bar-fill"
                                          style={{
                                            width: `${rating.percentage}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="percentage">
                                        {rating.percentage}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <h5>Write your Review</h5>
                              <p>
                                Share your feedback and help create a better
                                shopping experience for everyone.
                              </p>

                              <button
                                className="review-btn"
                                onClick={() => setShowTicketModal(true)}
                              >
                                Add a Review
                              </button>
                            </div>
                          </div>

                          {/* Customer Feedback */}
                          <div className="reviews-section">
                            <h4>Customer Feedback</h4>
                            {reviews.map((r) => (
                              <div key={r.id} className="review-card">
                                <div className="review-content">
                                  <div className="review-content-top">
                                    <span className="review-content-top-lft">
                                      <img
                                        src={r.avatar}
                                        alt={r.name}
                                        className="avatar"
                                      />

                                      <span>
                                        <h5>{r.name} </h5>
                                        <span className="date">{r.date}</span>
                                      </span>
                                    </span>
                                    <span className="review-content-top-rgt">
                                      <div className="review-stars">
                                        {[...Array(5)].map((_, i) => (
                                          <FaStar
                                            key={i}
                                            color={
                                              i < r.rating ? "#FFD700" : "#ccc"
                                            }
                                          />
                                        ))}
                                      </div>
                                    </span>
                                  </div>

                                  <p>{r.comment}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : activeTab === "Others" ? (
                      <div className="others-section">
                        <h4>Additional Information</h4>
                        <div className="additional-info">
                          <h5>What's in the Box:</h5>
                          <ul>
                            <li>HiKOKI DV13VSS Impact Drill</li>
                            <li>Side handle</li>
                            <li>Depth gauge</li>
                            <li>User manual</li>
                          </ul>

                          <h5>Safety Features:</h5>
                          <ul>
                            <li>Double insulation for user protection</li>
                            <li>Lock-on button for continuous operation</li>
                            <li>Safety clutch to prevent kickback</li>
                          </ul>

                          <h5>Maintenance:</h5>
                          <p>
                            Regularly clean the ventilation slots and check the
                            power cord for damage. Use only recommended
                            accessories and have the tool serviced by authorized
                            technicians.
                          </p>

                          <h5>Compatibility:</h5>
                          <p>
                            Compatible with all standard drill bits and
                            screwdriver bits. Recommended for use with HiKOKI
                            accessories for optimal performance.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="detalisSliderPart">
                    <RelatedProductsSlider />
                    <RecentlyViewedSlider />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {/* Review Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        showFooter={false}
        size="xlg"
      >
        <div className="ba-modal-wpap">
          <div className="ba-modal-Lft">
            <form className="ba-modal-form" onSubmit={handleReviewSubmit}>
              <h3 className="modal-title">Submit Your Review</h3>

              <div className="manageProfileFrmBoxInner">
                <div class="manage-profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Name<span> *</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newReview.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Your Review <span> *</span>
                      </label>
                      <textarea
                        name="comment"
                        value={newReview.comment}
                        onChange={handleInputChange}
                        placeholder="Write your review"
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>
                        Add Your Rating <span>*</span>
                      </label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={24}
                            color={
                              star <= newReview.rating ? "#FFD700" : "#ccc"
                            }
                            onClick={() => handleRatingChange(star)}
                            style={{ cursor: "pointer", marginRight: "5px" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <button type="submit" className="form-submit">
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="ba-modal-Rgt">
            <h5>
              Thank you for taking the time to share your valuable review.
            </h5>
            <img src={Bigtick} alt="Bigtick" />
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default ProductDetailsWithSlider;
