import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import product1 from "../assets/images/product.jpg";
import MainLayout from "../layouts/MainLayout";
import { GoDotFill } from "react-icons/go";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import ProductGrid from "../components/ProductGrid";
import ProductDetailsBottom from "../components/ProductDetailsBottom";

const ProductDetails = () => {
  const [activeTab, setActiveTab] = useState("specs");

  const rating = 3.5;
  const totalRatings = 12;

  // ⭐ Render Rating
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

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="product-details-conte">
          <div className="product-details">
            {/* Left Section - Image */}
            <div className="product-details-left">
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
                <span className="current">Air Blower</span>
              </div>

              <img src={product1} alt="Product" className="main-product-img" />
            </div>

            {/* Right Section - Info */}
            <div className="product-details-right">
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

              {/* Tabs */}
              <div className="tabs">
                <button
                  className={activeTab === "specs" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("specs")}
                >
                  Specifications
                </button>
                <button
                  className={activeTab === "desc" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("desc")}
                >
                  Descriptions
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "specs" ? (
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
              ) : (
                <div className="desc-section">
                  <p>
                    The HiKOKI DV13VSS is a compact and powerful 13 mm impact
                    drill designed for both professional and DIY applications.
                    With its 550W motor, this drill delivers excellent
                    performance in a wide range of materials including wood,
                    steel, and concrete. It features a dual-mode operation —
                    rotary drilling and impact drilling — making it versatile
                    for home renovation, construction, and workshop use.
                  </p>
                  <p>
                    The variable speed trigger ensures precise control, while
                    the forward/reverse switch allows for easy screwdriving and
                    bit removal. The keyed chuck provides a secure grip for
                    various drill bits up to 13 mm in diameter. Its lightweight
                    and ergonomic design reduces fatigue, making it ideal for
                    prolonged use.
                  </p>
                  <p>
                    Backed by HiKOKI’s reputation for durability and innovation,
                    the DV13VSS combines performance, reliability, and comfort
                    in one efficient tool.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="product-details-bottom">
            <ProductDetailsBottom />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetails;
