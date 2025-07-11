import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images (create these imports at the top)
import no_image from "../assets/images/no-image.png";
import hilti from "../assets/images/hilti.png";
import multivolt from "../assets/images/multivolt.png";
import bosch from "../assets/images/bosch.png";
import dca from "../assets/images/dca.png";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import {getTopBrand} from "../api/apiRequest";
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

const BrandCarousel = () => {
  const [products, setProducts] = useState([]);  
  const sliderRef = useRef(null); // Properly define the ref at the component level

  const allBrands = async () => {
    try {
      const apiRes = await getTopBrand();
      const responseData = await apiRes.json();
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
            img: item.banner_image?.file_name || no_image,
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
    allBrands();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
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
      </div>
    );
  };

  return (
    <div className="power-tools-section">
      <div className="maincontainer">
        <div className="power-tools-section-inner">
          <div className="section-header">
            <div className="section-headerLft">
              <h2>Search by Brands</h2>

              <Link to="/" className="all-link">
                All Brands <FiChevronRight />
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

          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => (
              <div key={product.id} className="product-slide">
                <div className="brand-card">
                  {renderProductImage(product)}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.count}</p>
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

export default BrandCarousel;
