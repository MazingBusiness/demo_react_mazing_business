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

import ProductModal from "./ProductModal.jsx";
import { getNewArrivalProducts } from "../api/apiRequest.jsx";
import { getLoggedInUser } from "../utils/authUtils.js";

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

const formatPrice = (value) => {
  const numeric = Number(value || 0);
  return `₹${numeric.toFixed(2)}`;
};

const normalizePriceString = (value) => {
  if (!value) return "₹0.00";
  const numeric = String(value).replace(/[^\d.]/g, "");
  return `₹${Number(numeric || 0).toFixed(2)}`;
};

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const fetchNewArrivalItems = async () => {
    try {
      const apiRes = await getNewArrivalProducts();
      const responseData = await apiRes.json();
      const user = getLoggedInUser();

      if (responseData?.res && Array.isArray(responseData?.data)) {
        const transformedData = responseData.data.map((item) => {
          const product = item?.product || {};
          const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

          const noCredit = Number(product?.cash_and_carry_item) === 1;
          const fastDeliveryTag = Number(item?.fast_delivery_tag) === 1;
          const hasWarranty = Number(product?.is_warranty) === 1;

          const rating =
            Number(product?.rating) > 0 ? Number(product?.rating) : 4;

          const totalRatings = reviews.length > 0 ? reviews.length : 20;

          const oldPriceValue = Number(item?.mrp || product?.mrp || 0);
          const newPriceValue = item?.discount_price
            ? normalizePriceString(item.discount_price)
            : formatPrice(oldPriceValue);

          const modalProduct = {
            ...product,
            id: product?.id || item?.product_id || item?.id,
            new_arrival_id: item?.id,
            product_id: item?.product_id || product?.id || null,
            slug: product?.slug || "",
            part_no: product?.part_no || item?.part_no || "",
            name: product?.name || item?.item_name || "",
            item_name: product?.name || item?.item_name || "",
            thumb_img: item?.thumb_img || null,
            img: item?.thumb_img?.file_name || no_image,
            image: item?.thumb_img?.file_name || no_image,
            oldPrice: formatPrice(oldPriceValue),
            newPrice: newPriceValue,
            display_mrp: formatPrice(oldPriceValue),
            display_discount_price: newPriceValue,
            discount_price: item?.discount_price || newPriceValue,
            discount: Number(item?.discount || 0),
            fast_delivery_tag: item?.fast_delivery_tag || 0,
            is_warranty: hasWarranty ? 1 : 0,
            reviews,
            stocks: product?.stocks || [],
            current_stock: product?.current_stock || 0,
            cash_and_carry_item: product?.cash_and_carry_item || 0,
            rating: Number(product?.rating || 0),
            totalRatings,
            category_group_id: item?.category_group_id || product?.group_id || "",
            category_id: item?.category_id || product?.category_id || "",
            brand_id: item?.brand_id || product?.brand_id || "",
          };

          return {
            id: product?.id || item?.product_id || item?.id,
            new_arrival_id: item?.id,
            product_id: item?.product_id || product?.id || null,
            slug: product?.slug || "",
            part_no: item?.part_no || product?.part_no || "",
            name: product?.name || item?.item_name || "",
            img: item?.thumb_img?.file_name || no_image,
            thumb_img: item?.thumb_img || null,

            oldPrice: formatPrice(oldPriceValue),
            newPrice: newPriceValue,
            discount: Number(item?.discount || 0),

            rating,
            totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
              Math.random() * 200 + 50
            )}`,
            fastDeliveryTag,
            is_warranty: hasWarranty,
            noCredit,
            user_id: user?.id || null,

            category_group_id: item?.category_group_id || "",
            category_id: item?.category_id || "",
            brand_id: item?.brand_id || "",
            fast_delivery_tag: item?.fast_delivery_tag || 0,

            stocks: product?.stocks || [],
            reviews,
            rating_raw: product?.rating || 0,
            mrp: oldPriceValue,
            current_stock: product?.current_stock || 0,
            num_of_sale: product?.num_of_sale || 0,
            cash_and_carry_item: product?.cash_and_carry_item || 0,

            productData: product,
            modalProduct,
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

  const renderFastDeliveryTag = (product) => {
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
    slideCount: 0,
    isMobile: false,
  });

  useEffect(() => {
    fetchNewArrivalItems();
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
    autoplay: products.length > 1,
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
          slidesToShow: Math.min(3, products.length || 1),
          swipe: false,
          draggable: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, products.length || 1),
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

  const isPrevDisabled = products.length <= 1;
  const isNextDisabled = products.length <= 1;

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
            {/* <button
              className="wishlist-btn"
              aria-label="Add to wishlist"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <img src={HeartIcon} alt="HeartIcon" />
            </button> */}

            <button
              className="cart-btn"
              aria-label="Add to cart"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCartClick();
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
              <h2>New Arrivals</h2>
              {/* <Link to="/" className="all-link">
                All New Arrivals <FiChevronRight />
              </Link> */}
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

          {products.length > 0 ? (
            <Slider ref={sliderRef} {...settings}>
              {products.map((product) => (
                <div
                  key={`${product.new_arrival_id}-${product.id}`}
                  className="product-slide"
                >
                  <div className="product-card">
                    {renderProductImage(product, () => openModal(product.modalProduct))}

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

                        {renderFastDeliveryTag(product)}
                      </div>

                      {product.user_id != null && (
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
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
          ) : (
            <div className="text-center py-4">No new arrivals found.</div>
          )}
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

export default NewArrivals;