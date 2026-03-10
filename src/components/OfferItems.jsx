import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

import ProductModal from "../components/ProductModal.jsx";
import { getOfferProducts } from "../api/apiRequest";
import { getLoggedInUser } from "../utils/authUtils";

const renderStars = (rating) => {
  const stars = [];
  const numericRating = Number(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="star-icon full-star" />);
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star-icon half-star" />);
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="star-icon empty-star" />);
  }

  return stars;
};

const OfferItems = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: 0,
    isMobile: false,
  });

  const allOfferItems = async () => {
    try {
      const apiRes = await getOfferProducts();
      const responseData = await apiRes.json();
      const user = getLoggedInUser();

      if (responseData?.res) {
        const transformedData = (responseData?.data || []).map((item) => {
          const details = item.product_details || {};
          const noCredit = Number(details.cash_and_carry_item) === 1;
          const fastDeliveryTag = Number(item.fast_delivery_tag) === 1;
          const hasWarranty = Number(details.is_warranty) === 1;

          const rating =
            details.rating && Number(details.rating) !== 0
              ? Number(details.rating)
              : 4;

          const totalRatings =
            Array.isArray(details.reviews) && details.reviews.length > 0
              ? details.reviews.length
              : Array.isArray(item.reviews) && item.reviews.length > 0
              ? item.reviews.length
              : 20;

          return {
            id: details.id,
            slug: details.slug,
            name: details.name,
            img: details.thumb_img?.file_name || no_image,
            oldPrice: details.mrp
              ? `₹${parseFloat(details.mrp).toFixed(2)}`
              : "₹0.00",
            newPrice: item.discount_price
              ? `₹${parseFloat(item.discount_price).toFixed(2)}`
              : "₹0.00",
            rating,
            totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
              Math.random() * 200 + 50
            )}`,
            discount: item.offer_discount_percent
              ? `${item.offer_discount_percent}%`
              : "0%",
            fastDeliveryTag,
            is_warranty: hasWarranty,
            noCredit,
            user_id: user?.id || null,

            // ProductModal ke liye extra fields
            category_group: details.category_group?.name || "",
            category: details.category?.name || "",
            fast_delivery_tag: item.fast_delivery_tag || 0,
            stocks: details.stocks || [],
            reviews: details.reviews || item.reviews || [],
          };
        });

        setProducts(transformedData);
        setSliderState((prev) => ({
          ...prev,
          slideCount: transformedData.length,
        }));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setSliderState((prev) => ({
        ...prev,
        isMobile: window.innerWidth < 768,
      }));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    allOfferItems();

    return () => window.removeEventListener("resize", handleResize);
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

  const renderWarrantyTag = (product) => {
    if (!product.is_warranty) return null;

    return (
      <div className="delivery">
        <img
          src={warrantyIcon}
          alt="Warranty"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

  const renderProductImage = (product, onCartClick = () => {}) => {
    return (
      <div className="product-img">
        <Link to={`/product-details/${product.slug}`}>
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
              <img src={no_image} alt="No Image" loading="lazy" />
            </div>
          )}
        </Link>

        {product.user_id != null && (
          <>
            <div className="btnGrp">
              <button
                className="cart-btn"
                aria-label="Add to cart"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onCartClick(product);
                }}
              >
                <img src={CartIcon} alt="CartIcon" />
              </button>
            </div>

            {product.noCredit && <div className="no-credit-tag">No Credit Item</div>}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="power-tools-section offer-section">
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
                  onClick={() => !isPrevDisabled && sliderRef.current?.slickPrev()}
                  disabled={isPrevDisabled}
                  aria-label="Previous"
                >
                  ❮
                </button>

                <button
                  className={`custom-arrow next-arrow ${
                    isNextDisabled ? "disabled" : ""
                  }`}
                  onClick={() => !isNextDisabled && sliderRef.current?.slickNext()}
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
                  {renderProductImage(product, openModal)}

                  <div className="product-info">
                    <Link to={`/product-details/${product.slug}`}>
                      <h3 title={product.name}>
                        {product.name?.length > 25
                          ? product.name.substring(0, 25) + "..."
                          : product.name}
                      </h3>

                      {product.user_id != null && (
                        <div className="prices">
                          <span className="old">{product.oldPrice}</span>
                          <span className="new">{product.newPrice}</span>
                        </div>
                      )}

                      <div className="ratingGrp">
                        <div className="ratingGrpLft">
                          {/* <div className="rating">
                            {renderStars(product.rating)}
                            <span className="rating-count">
                              ({product.totalRatings})
                            </span>
                          </div> */}

                          {renderWarrantyTag(product)}
                        </div>

                        {fastDeliveryTag(product)}
                      </div>
                    </Link>

                    {product.user_id != null && (
                      <div className="progress-bar">
                        <div className="progress" style={{ width: "100%" }}></div>
                      </div>
                    )}

                    {product.user_id == null && (
                      <div>
                        <button
                          type="button"
                          className="before-reg-btn"
                          onClick={() => navigate("/register")}
                        >
                          Register to check prices
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default OfferItems;