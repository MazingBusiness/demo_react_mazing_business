import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images (create these imports at the top)
// import product1 from "../assets/images/product.jpg";
// import product2 from "../assets/images/product.jpg";
// import product3 from "../assets/images/product.jpg";
// import product4 from "../assets/images/product.jpg";
// import product5 from "../assets/images/product.jpg";
// import product6 from "../assets/images/product.jpg";
// import product7 from "../assets/images/product.jpg";
import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import {getBestSellerProducts} from "../api/apiRequest";
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

// const products = [
//   {
//     id: 1,
//     name: "Drill Machine",
//     img: product1, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 300,
//     sold: "250/531",
//     discount: "20%",
//   },
//   {
//     id: 2,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 3,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 4,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 5,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 6,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 7,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 8,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 9,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 10,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 11,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
//   {
//     id: 12,
//     name: "Cutting Tool",
//     img: product2, // Use imported image
//     oldPrice: "₹2,000",
//     newPrice: "₹1,800",
//     rating: 4,
//     totalRatings: 19,
//     sold: "26/90",
//     discount: "20%",
//   },
// ];

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

const BestSellers = () => {
  const [products, setProducts] = useState([]);  
  const sliderRef = useRef(null); // Properly define the ref at the component level

  // get all Best Seller Items
  const allBestSellerItems = async () => {
    try {
      const apiRes = await getBestSellerProducts();
      const responseData = await apiRes.json();
      const user = getLoggedInUser();
      // console.log(user);
      console.log(user);
      if (responseData.res) {
        const transformedData = responseData.data.map((item) => {
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

  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: products.length,
    isMobile: false,
  });
  
  useEffect(() => {
      allBestSellerItems();
    }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
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

  // const isPrevDisabled = sliderState.currentSlide === 0;
  // const isNextDisabled =
  //   sliderState.currentSlide >= sliderState.slideCount - settings.slidesToShow;

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
              e.target.src = "/placeholder-product.jpg";
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
          </>
        )}
      </div>
    );
  };

  return (
    <div className="power-tools-section">
      <div className="maincontainer">
        <div className="power-tools-section-inner">
          <div className="section-header">
            <div className="section-headerLft">
              <h2>Best Sellers</h2>
              <Link to="/" className="all-link">
                All Best Sellers <FiChevronRight />
              </Link>
            </div>
            <div className="section-headerRgt">
              <div className="arrow-controls">
                <button className={`custom-arrow prev-arrow ${ isPrevDisabled ? "disabled" : ""  }`} onClick={() => !isPrevDisabled && sliderRef.current.slickPrev() }
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

          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => (
              <div key={product.id} className="product-slide">
                <div className="product-card">
                  {renderProductImage(product)}
                  <div className="product-info">
                    <h4 className="h4-font">{product.name.length > 40 ? product.name.substring(0, 40) + "..." : product.name}</h4>
                    {product.user_id != null && (
                      <div className="prices">
                        <span className="old">{product.oldPrice}</span>
                        <span className="new">{product.newPrice}</span>
                      </div>
                    )}
                    {product.user_id == null && ( <br/> )}
                    <div className="ratingGrp">
                      <div className="ratingGrpLft">
                        {product.user_id != null && (
                          <div className="discount">OFF {product.discount}</div>
                        )}
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
                        <button type="button" className="before-reg-btn">Register to check prices</button>
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

export default BestSellers;
