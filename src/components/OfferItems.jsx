import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images (create these imports at the top)
import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import {getOfferProducts} from "../api/apiRequest";
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';


const renderRating = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="star-icon full-star" />);
  }

  // Half star
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star-icon half-star" />);
  }

  // Empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FaRegStar key={`empty-${i}`} className="star-icon empty-star" />
    );
  }

  return stars;
};

const OfferItems = () => {

  const [products, setProducts] = useState([]);
  const sliderRef = useRef();

  // get all Offer Items
  const allOfferItems = async () => {
    try {
      const apiRes = await getOfferProducts();
      const responseData = await apiRes.json();
      const user = getLoggedInUser();
      if (responseData.res) {
        const transformedData = responseData.data.map((item) => {
          const details = item.product_details || {};

          const noCredit = details.cash_and_carry_item == 1;
          const fastDeliveryTag = item.fast_delivery_tag == 1;
          const rating = details.rating && details.rating !== 0 ? details.rating : 4;
          const totalRatings = Array.isArray(item.reviews) && item.reviews.length > 0 ? item.reviews.length : 20;
          return {
            id: details.id,
            name: details.name,
            img: details.thumb_img?.file_name || no_image, // fallback if null
            oldPrice: details.mrp ? `₹${parseFloat(details.mrp).toFixed(2)}` : "₹0.00",
            newPrice: item.discount_price ? `₹${parseFloat(item.discount_price).toFixed(2)}` : "₹0.00",
            rating: rating,
            totalRatings: totalRatings, // optional fallback
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(Math.random() * 200 + 50)}`, // simulate
            discount: item.offer_discount_percent + "%", // example: "0%"
            fastDeliveryTag: fastDeliveryTag,
            noCredit: noCredit,
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
    }
  };

  // const sliderRef = useRef(null); // Properly define the ref at the component level
  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: products.length,
    isMobile: false,
  });

  // useEffect(() => {
  //   const handleResize = () => {
  //     setSliderState((prev) => ({
  //       ...prev,
  //       isMobile: window.innerWidth < 768,
  //     }));
  //   };

  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    allOfferItems();
  }, []);


  const settings = {
    dots: false,
    infinite: products.length > 6,
    speed: 500,
    autoplay: false,
    autoplaySpeed: 3000,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (current, next) => {
      setSliderState((prev) => ({ ...prev, currentSlide: next }));
    },
    swipe: sliderState.isMobile,
    draggable: sliderState.isMobile,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          swipe: false,
          draggable: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          swipe: true,
          draggable: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          swipe: true,
          draggable: true,
        },
      },
    ],
  };

  const isPrevDisabled = false;
  const isNextDisabled = false;

  const renderProductImage = (product) => {
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
          </div>
        )}
        {product.user_id != null && (
          <>
            <div className="btnGrp">
              <button className="wishlist-btn" aria-label="Add to wishlist">
                <img src={HeartIcon} alt="HeartIcon" />
              </button>
              <button className="cart-btn" aria-label="Add to cart">
                <img src={CartIcon} alt="HeartIcon" />
              </button>
            </div>
            {product.noCredit && (
              <div className="no-credit-tag">No Credit Item</div>
            )}
          </>
        )}
      </div>
    );
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

  const renderRating = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating); // simple star rating
  };

  return (
    <div className="power-tools-section offer-section ">
      <div className="maincontainer">
        <div className="power-tools-section-inner">
          <div className="section-header">
            <div className="section-headerLft">
              <h2>Offer Price Items</h2>
              <Link to="/" className="all-link">
                All Offer <FiChevronRight />
              </Link>
            </div>
            <div className="section-headerRgt">
              <div className="arrow-controls">
                <button
                  className={`custom-arrow prev-arrow ${
                    isPrevDisabled ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !isPrevDisabled && sliderRef.current.slickPrev()
                  }
                  disabled={isPrevDisabled}
                  aria-label="Previous"
                >
                  ❮
                </button>
                <button
                  className={`custom-arrow next-arrow ${
                    isNextDisabled ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !isNextDisabled && sliderRef.current.slickNext()
                  }
                  disabled={isNextDisabled}
                  aria-label="Next"
                >
                  ❯
                </button>
              </div>
            </div>
          </div>

          {/* <Slider ref={sliderRef} {...settings}>
            {products.map((product) => (
              <div key={product.id} className="product-slide">
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
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <div className="sold">Sold: {product.sold}</div>
                  </div>
                </div>
              </div>
            ))}
          </Slider> */}

          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => (
              <div key={product.id} className="product-slide">
                <div className="product-card">
                  {renderProductImage(product)}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    {product.user_id != null && (
                      <div className="prices">
                        <span className="old">{product.oldPrice}</span>
                        <span className="new">{product.newPrice}</span>
                      </div>
                    )}
                    <div className="ratingGrp">
                      <div className="ratingGrpLft">
                        {product.user_id != null && (
                          <div className="discount">OFF {product.discount}</div>
                        )}
                        <div className="rating">
                          {renderRating(product.rating)}
                          <span className="rating-count">({product.totalRatings})</span>
                        </div>
                      </div>
                      {fastDeliveryTag(product)}
                    </div>
                    {product.user_id != null && (
                      <>
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>                    
                        <div className="sold">Sold: {product.sold}</div>
                      </>
                    )}
                    {product.user_id == null && (
                      <div>
                        <button type="button" className="category-btn">Register to check prices</button>
                      </div>
                    )}                    
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default OfferItems;
