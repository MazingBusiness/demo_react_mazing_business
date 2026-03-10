import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import ProductModal from "../components/ProductModal.jsx";
import { getBestSellerProducts } from "../api/apiRequest";
import { getLoggedInUser } from "../utils/authUtils";

const renderRating = (rating) => {
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
    stars.push(
      <FaRegStar key={`empty-${i}`} className="star-icon empty-star" />
    );
  }

  return stars;
};

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const allBestSellerItems = async () => {
    try {
      const apiRes = await getBestSellerProducts();
      const responseData = await apiRes.json();
      const user = getLoggedInUser();

      if (responseData?.res) {
        const transformedData = (responseData?.data || []).map((item) => {
          const noCredit = Number(item.cash_and_carry_item) === 1;
          const fastDeliveryTag = Number(item.fast_delivery_tag) === 1;
          const hasWarranty = Number(item.is_warranty) === 1;

          const rating =
            item.rating && Number(item.rating) !== 0 ? Number(item.rating) : 4;

          const totalRatings =
            Array.isArray(item.reviews) && item.reviews.length > 0
              ? item.reviews.length
              : 20;

          return {
            id: item.id,
            slug: item?.slug || "",
            name: item.name,
            img: item.thumb_img?.file_name || no_image,
            oldPrice: item.mrp
              ? `₹${parseFloat(item.mrp.toString()).toFixed(2)}`
              : "₹0.00",
            newPrice: item.discount_price
              ? `₹${parseFloat(
                  item.discount_price.toString().replace(/₹/g, "")
                ).toFixed(2)}`
              : "₹0.00",
            discount: item.discount || 0,
            rating,
            totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
              Math.random() * 200 + 50
            )}`,
            fastDeliveryTag,
            is_warranty: hasWarranty,
            noCredit,
            user_id: user?.id || null,

            // ProductModal ke liye
            category_group: item.category_group?.name || "",
            category: item.category?.name || "",
            fast_delivery_tag: item.fast_delivery_tag || 0,
            stocks: item.stocks || [],
            reviews: item.reviews || [],
          };
        });

        setProducts(transformedData);
      } else {
        console.error(responseData?.msg || "Something went wrong");
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
    }
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

  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: products.length,
    isMobile: false,
  });

  useEffect(() => {
    allBestSellerItems();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setSliderState((prev) => ({
        ...prev,
        isMobile: window.innerWidth < 768,
        slideCount: products.length,
      }));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [products]);

  const settings = {
    dots: false,
    infinite: products.length > 6,
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

  const isPrevDisabled = false;
  const isNextDisabled = false;

  const handleRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/login");
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
          <div className="btnGrp">
            <button
              className="wishlist-btn"
              aria-label="Add to wishlist"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <img src={HeartIcon} alt="HeartIcon" />
            </button>

            <button
              className="cart-btn"
              aria-label="Add to cart"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCartClick(product);
              }}
            >
              <img src={CartIcon} alt="CartIcon" />
            </button>
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
              <h2>Best Sellers</h2>
              <Link to="/" className="all-link">
                All Best Sellers <FiChevronRight />
              </Link>
            </div>

            <div className="section-headerRgt">
              <div className="arrow-controls">
                <button
                  className={`custom-arrow prev-arrow ${
                    isPrevDisabled ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !isPrevDisabled && sliderRef.current?.slickPrev()
                  }
                  disabled={isPrevDisabled}
                  aria-label="Previous"
                  type="button"
                >
                  ❮
                </button>

                <button
                  className={`custom-arrow next-arrow ${
                    isNextDisabled ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !isNextDisabled && sliderRef.current?.slickNext()
                  }
                  disabled={isNextDisabled}
                  aria-label="Next"
                  type="button"
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
                    <h4 className="h4-font" title={product.name}>
                      <Link
                        to={`/product-details/${product.slug}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {product.name?.length > 40
                          ? product.name.substring(0, 40) + "..."
                          : product.name}
                      </Link>
                    </h4>

                    {product.user_id != null && (
                      <div className="prices">
                        <span className="old">{product.oldPrice}</span>
                        <span className="new">{product.newPrice}</span>
                      </div>
                    )}

                    {product.user_id == null && <br />}

                    <div className="ratingGrp">
                      <div className="ratingGrpLft">
                        {product.user_id != null && (
                          <div className="discount">OFF {product.discount}%</div>
                        )}

                        <div className="rating">
                          {renderRating(product.rating)}
                          <span className="rating-count">
                            ({product.totalRatings})
                          </span>
                        </div>

                        {renderWarrantyTag(product)}
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
                        <button
                          type="button"
                          className="before-reg-btn"
                          onClick={handleRegisterClick}
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

export default BestSellers;