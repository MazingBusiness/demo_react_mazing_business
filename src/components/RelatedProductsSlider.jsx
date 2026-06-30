import React, { useState, useRef, useEffect, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images (create these imports at the top)
import product1 from "../assets/images/product.jpg";
import product2 from "../assets/images/product.jpg";
import product3 from "../assets/images/product.jpg";
import product4 from "../assets/images/product.jpg";
import product5 from "../assets/images/product.jpg";
import product6 from "../assets/images/product.jpg";
import product7 from "../assets/images/product.jpg";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import no_image from "../assets/images/no-image.png";
import ProductModal from "./ProductModal.jsx";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

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

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const RelatedProductsSlider = ({
  products: suppliedProducts,
  title = "Related products",
  enableAddToCart = false,
}) => {
  const products = useMemo(() => {
    const source = Array.isArray(suppliedProducts) ? suppliedProducts : demoProducts;

    return source.map((item) => {
      const mrp = toNumber(item?.mrp ?? item?.oldPrice ?? item?.unit_price);
      const sellingPrice = toNumber(
        item?.discount_price ??
          item?.product_price ??
          item?.price ??
          item?.newPrice ??
          item?.unit_price ??
          item?.mrp
      );
      const reviewCount = Array.isArray(item?.reviews)
        ? item.reviews.length
        : Number(item?.totalRatings || item?.review_count || 0);
      const calculatedDiscount =
        mrp > 0 && sellingPrice > 0 && sellingPrice < mrp
          ? Math.round(((mrp - sellingPrice) / mrp) * 100)
          : 0;

      return {
        ...item,
        rawProduct: item,
        img:
          item?.img ||
          item?.thumb_img?.file_name ||
          item?.images?.[0]?.file_name ||
          no_image,
        oldPrice: `\u20B9${mrp.toFixed(2)}`,
        newPrice: `\u20B9${sellingPrice.toFixed(2)}`,
        rating: Number(item?.rating || item?.average_rating || 0),
        totalRatings: reviewCount,
        discount: Number(item?.discount || calculatedDiscount),
        fastDeliveryTag: Number(
          item?.fastDeliveryTag ?? item?.fast_delivery_tag ?? item?.inhouse_product ?? 0
        ) === 1,
      };
    });
  }, [suppliedProducts]);

  const sliderRef = useRef(null); // Properly define the ref at the component level
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  useEffect(() => {
    setSliderState((prev) => ({
      ...prev,
      currentSlide: 0,
      slideCount: products.length,
    }));
    sliderRef.current?.slickGoTo(0);
  }, [products.length]);

  const handleAddToCart = (product) => {
    if (!enableAddToCart || !product?.id) return;
    setSelectedProduct(product.rawProduct || product);
  };

  const closeProductModal = () => setSelectedProduct(null);

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
              e.target.src = no_image;
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
        <div className="btnGrp">
          {/* <button className="wishlist-btn" aria-label="Add to wishlist">
            <img src={HeartIcon} alt="HeartIcon" />
          </button> */}
          <button
            className={`cart-btn ${enableAddToCart ? "best-seller-add-cart" : ""}`}
            aria-label="Add to cart"
            type="button"
            onClick={() => handleAddToCart(product)}
          >
            <img src={CartIcon} alt="HeartIcon" />
            {enableAddToCart && <span>Add to Cart</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="power-tools-section">
      <div className="power-tools-section-inner">
        <div className="section-header">
          <div className="section-headerLft">
            <h2>{title}</h2>
          </div>

          <div className="section-headerRgt">
            <div className="arrow-controls">
              <button
                className={`custom-arrow prev-arrow ${
                  isPrevDisabled ? "disabled" : ""
                }`}
                onClick={() => !isPrevDisabled && sliderRef.current.slickPrev()}
                disabled={isPrevDisabled}
                aria-label="Previous"
              >
                ❮
              </button>
              <button
                className={`custom-arrow next-arrow ${
                  isNextDisabled ? "disabled" : ""
                }`}
                onClick={() => !isNextDisabled && sliderRef.current.slickNext()}
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
                  <h3
                    className={enableAddToCart ? "related-product-name-clickable" : ""}
                    onClick={() => handleAddToCart(product)}
                    onKeyDown={(event) => {
                      if (
                        enableAddToCart &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        handleAddToCart(product);
                      }
                    }}
                    role={enableAddToCart ? "button" : undefined}
                    tabIndex={enableAddToCart ? 0 : undefined}
                  >
                    {product.name?.length > 70
                      ? product.name.substring(0, 70) + "..."
                      : product.name}
                  </h3>
                  <div className="prices">
                    <span className="old">{product.oldPrice}</span>
                    <span className="new">{product.newPrice}</span>
                  </div>

                  <div className="ratingGrp">
                    <div className="ratingGrpLft">
                      {/* <div className="discount">OFF {product.discount}</div> */}
                      {/* <div className="rating">
                        {renderRating(product.rating)}
                        <span className="rating-count">
                          ({product.totalRatings})
                        </span>
                      </div> */}
                    </div>

                    {product.fastDeliveryTag && (
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
                    )}
                  </div>

                  {/* <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div> */}
                  {/* <div className="sold">Sold: {product.sold}</div> */}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {selectedProduct && (
        <ProductModal
          open={true}
          onClose={closeProductModal}
          isOpen={true}
          setIsOpen={(isOpen) => {
            if (!isOpen) closeProductModal();
          }}
          show={true}
          setShow={(show) => {
            if (!show) closeProductModal();
          }}
          productId={selectedProduct.id}
          id={selectedProduct.id}
          slug={selectedProduct.slug}
          product={selectedProduct}
          selectedProduct={selectedProduct}
          item={selectedProduct}
          onRequestClose={closeProductModal}
        />
      )}
    </div>
  );
};

export default RelatedProductsSlider;
