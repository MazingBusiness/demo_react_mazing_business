import React, { useState, useRef, useEffect } from "react";
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
import RelatedProductsSlider from "./RelatedProductsSlider.jsx";
import { getRecentlyViewedProducts } from "../api/apiRequest";
import { getLoggedInUser } from "../utils/authUtils";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const demoProducts = [
  {
    id: 1,
    name: "Drill Machine",
    img: product1, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 300,
    sold: "250/531",
    discount: "20%",
  },
  {
    id: 2,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 3,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 4,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 5,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 6,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 7,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 8,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 9,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 10,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 11,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
  {
    id: 12,
    name: "Cutting Tool",
    img: product2, // Use imported image
    oldPrice: "₹2,000",
    newPrice: "₹1,800",
    rating: 4,
    totalRatings: 19,
    sold: "26/90",
    discount: "20%",
  },
];

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

const RecentlyViewedSlider = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null); // Properly define the ref at the component level
  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: 0,
    isMobile: false,
  });

  useEffect(() => {
    let ignore = false;

    const loadRecentlyViewedProducts = async () => {
      if (!getLoggedInUser()?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getRecentlyViewedProducts();
        const payload = await response.json();
        const items = Array.isArray(payload?.data) ? payload.data : [];

        if (!ignore) setProducts(items);
      } catch (error) {
        console.error("Recently viewed products fetch error:", error);
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadRecentlyViewedProducts();

    return () => {
      ignore = true;
    };
  }, []);

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

  const openProductModal = (product) => {
    setSelectedProduct(product?.rawProduct || product);
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
            onClick={() => openProductModal(product)}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
        <div className="btnGrp">
          <button className="wishlist-btn" aria-label="Add to wishlist">
            <img src={HeartIcon} alt="HeartIcon" />
          </button>
          <button
            className="cart-btn"
            aria-label="Add to cart"
            type="button"
            onClick={() => openProductModal(product)}
          >
            <img src={CartIcon} alt="HeartIcon" />
          </button>
        </div>
      </div>
    );
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="detalisSliderPart product-recently-viewed-products">
      <RelatedProductsSlider
        products={products}
        title="Recently Viewed"
        enableAddToCart
      />
    </div>
  );
};

export default RecentlyViewedSlider;
