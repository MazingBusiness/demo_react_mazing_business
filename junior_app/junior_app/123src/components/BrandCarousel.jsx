import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images (create these imports at the top)
import hilti from "../assets/images/hilti.png";
import multivolt from "../assets/images/multivolt.png";
import bosch from "../assets/images/bosch.png";
import dca from "../assets/images/dca.png";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Product Name",
    img: hilti,
    count: "250 Products",
  },
  {
    id: 2,
    name: "Product Name",
    img: multivolt,
    count: "250 Products",
  },
  {
    id: 3,
    name: "Product Name",
    img: bosch,
    count: "4721 Products",
  },
  {
    id: 4,
    name: "Product Name",
    img: dca,
    count: "4721 Products",
  },
  {
    id: 5,
    name: "Product Name",
    img: hilti,
    count: "250 Products",
  },
  {
    id: 6,
    name: "Product Name",
    img: multivolt,
    count: "250 Products",
  },
  {
    id: 7,
    name: "Product Name",
    img: bosch,
    count: "250 Products",
  },
];

const BrandCarousel = () => {
  const sliderRef = useRef(null); // Properly define the ref at the component level
  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: products.length,
    isMobile: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setSliderState((prev) => ({
        ...prev,
        isMobile: window.innerWidth < 768,
      }));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: false,
    infinite: false,
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

  const isPrevDisabled = sliderState.currentSlide === 0;
  const isNextDisabled =
    sliderState.currentSlide >= sliderState.slideCount - settings.slidesToShow;

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
