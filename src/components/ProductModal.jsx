import React, { useEffect, useState, useRef, useMemo } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

// import { NotificationManager } from "react-notifications"; // if using it

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import { FiHeart, FiX } from "react-icons/fi";

import CartbtnIcon from "../assets/icons/cartbtnIcon.svg";

import { GoDotFill } from "react-icons/go";

import { getProductDetails , addToCart } from "../api/apiRequest";
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';

const ProductModal = ({ product, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [productDetails, setProductDetails] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productThumbImages, setProductThumbImages] = useState([]);
  const [productPrice, setProductPrice] = useState('0');
  const [minBulkQty, setMinBulkQty] = useState('0');
  const [bulkPrice, setBulkPrice] = useState('0');
  const [totalPrice, setTotalPrice] = useState('0');

  // total price calculation
  const [quantity, setQuantity] = useState("");
  const bulkQty = productDetails?.piece_by_carton ?? 0;
  const normalPrice = productDetails?.discount_price ?? 0;
  // const bulkPrice = productDetails?.bulk_discount_price ?? normalPrice;
  const { type, unitPrice, computedTotal } = useMemo(() => {
    const qtyNum = Number(quantity) || 0;
    if (qtyNum <= 0) {
      return {
        computedTotal: "",
        type: "piece",
        unitPrice: normalPrice,
      };
    }

    // Decide which price to use
    const useBulk = bulkQty > 0 && qtyNum >= bulkQty;
    const chosenType = useBulk ? "bulk" : "piece";
    const chosenPrice = useBulk ? bulkPrice : normalPrice;
    setProductPrice(chosenPrice);

    return {
      computedTotal: (qtyNum * chosenPrice).toFixed(2),
      type: chosenType,
      unitPrice: chosenPrice,
    };
  }, [quantity, bulkQty, normalPrice, bulkPrice]);

  useEffect(() => {
    setTotalPrice(computedTotal);
  }, [computedTotal]);

   const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  // const images = [product1, image2, image3, image4, image5];
  const rating = 3.5;
  const totalRatings = 12;

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

  const handleAddToCart = async () => {
    try {
      const pid = productDetails?.id;
      const qty = Number(quantity);

      if (!pid) return alert("Product not loaded");
      if (!qty || qty <= 0) return alert("Enter valid quantity");

      const res = await addToCart({ product_id: pid, quantity: qty, type });

      // ✅ tell whole app: cart changed
      window.dispatchEvent(new Event("cart-updated"));
      alert(res?.msg || "Added to cart");

      // optional: close modal or reset qty
      setQuantity("");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add to cart");
    }
  };
  const getDiscount = async () => {
    try {
      const pid = productDetails?.id;
      const qty = Number(quantity);

      if (!pid) return alert("Product not loaded");
      if (!qty || qty <= 0) return alert("Enter valid quantity");

      const res = await addToCart({ product_id: pid, quantity: qty, type });

      // ✅ tell whole app: cart changed
      window.dispatchEvent(new Event("cart-updated"));
      alert(res?.msg || "Added to cart");

      // optional: close modal or reset qty
      setQuantity("");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add to cart");
    }
  };

  const productId = product?.id;
  useEffect(() => {
    if (!isOpen || !productId) return;
    const fetchDetails = async () => {
      try {
        const apiResponseData = await getProductDetails(productId);
        // const apiResponseData = await proDetailsapiRes.json();
        if (apiResponseData.res) {
          const list = apiResponseData?.data || [];
          const firstProduct = Array.isArray(list) ? list[0] : list;
          setProductDetails(firstProduct);
          setProductImages(firstProduct.images || []);
          setProductThumbImages(firstProduct.thumb_img);
          setProductPrice(firstProduct.discount_price);
          setMinBulkQty(firstProduct.piece_by_carton);
          setBulkPrice(firstProduct.bulk_discount_price);
          setQuantity(firstProduct.min_qty);
          if(firstProduct.min_qty < firstProduct.piece_by_carton){
            setTotalPrice(firstProduct.min_qty * productPrice);
          }else{
            setTotalPrice(firstProduct.min_qty * bulkPrice);
          }
          
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchDetails();
  }, [isOpen, productId]);
  
  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 🛡️ If closed OR no product, render nothing
  if (!isOpen || !product) return null;

  // if (!isOpen) return null;

  return (
    <div className={`product-modal-overlay ${isOpen ? "open" : ""}`}>
      <div
        className={`product-modal-box ${isOpen ? "open" : ""}`}
        ref={modalRef}
      >
        <button className="product-modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="product-modal-grid">
          <div className="product-modal-content">
            {/* Left - Carousel */}
            <div className="product-modal-carousel">
              {/* Breadcrumb */}
              <div className="breadcrumb">
                {productDetails?.category_group?.name}
                <em>
                  <GoDotFill />
                </em>
                {productDetails?.category?.name}
                {/* <em>
                  <GoDotFill />
                </em>
                <span className="current">HiKOKI</span> */}
              </div>

              <Carousel
                showThumbs
                showArrows
                showStatus={false}
                showIndicators={false}
                infiniteLoop
                renderArrowPrev={(onClickHandler, hasPrev, label) =>
                  hasPrev && (
                    <button
                      type="button"
                      onClick={onClickHandler}
                      title={label}
                      className="custom-arrow prev-arrow"
                    >
                      &#10094;
                    </button>
                  )
                }
                renderArrowNext={(onClickHandler, hasNext, label) =>
                  hasNext && (
                    <button
                      type="button"
                      onClick={onClickHandler}
                      title={label}
                      className="custom-arrow next-arrow"
                    >
                      &#10095;
                    </button>
                  )
                }
                renderThumbs={() =>
                  productImages.map((img, idx) => (
                    <div className="custom-thumb" key={idx}>
                      <img src={img.file_name} alt={`thumb-${idx}`} />
                    </div>
                  ))
                }
              >
                {productImages.map((thumbImg, idx) => (
                  <div key={idx}>
                    <img src={thumbImg.file_name} alt={`Slide ${idx}`} />
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Right - Info */}
            <div className="product-modal-info">
              <div className="product-modal-info-top">
                <div className="product-modal-info-top-lft">
                  <h2>{productDetails?.name}</h2>
                  <div className="product-rating">
                    {renderRating(rating)}
                    <span className="rating-count">{totalRatings} Reviews</span>
                  </div>
                </div>
                {productDetails?.fast_delivery_tag == 1 && (
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
                )}
              </div>

              <div className="product-price">
                <span className="old-price">₹{parseFloat(productDetails?.mrp).toFixed(2)}</span>
                <span className="new-price">₹{productPrice}</span>
                <span className="unit">/Pc</span>
              </div>
              {productDetails?.stocks != null && (
                <div className="product-stock">
                  {product.stocks.map((warehouse) => (
                    <div className="stock-item" key={warehouse.warehouse_id} // 👈 unique key
                    >
                      {warehouse.warehouse_name} <span>{warehouse.qty}</span>
                    </div>
                  ))}
                </div>
              )}
              {productDetails?.is_warranty == 1 && (
              <div className="warranty-div">
                <p className="warranty-text">
                  <img src={warrantyIcon} alt="Warranty" loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  <span className="highlight">{"    "}{productDetails?.warranty_duration} Months Warranty</span>
                </p>
              </div>
              )}
              <div className="bulk-discount">
                <p>
                  <span className="red">Bulk Quantity Discount:</span> Purchase{" "}
                  {productDetails?.piece_by_carton} or more and get each for{" "}
                  <span className="highlight">₹{productDetails?.discount_price}</span> instead of{" "}
                  <span className="highlight">₹{productDetails?.bulk_discount_price}</span>
                </p>
                <button className="discount-btn">Get Discount</button>
              </div>

              <div className="quantity-section">
                <div>
                  <label>Quantity</label>
                  <input type="number" name="quantity" id="quantity" placeholder="Enter quantity" value={quantity} onChange={handleQuantityChange} />
                </div>
                <div>
                  <label>Total Price</label>
                  <input type="text" id="total_price" name="total_price" placeholder="Amount" value={totalPrice}  disabled />
                  <input type="hidden" name="bulk_qty" id="bulk_qty" value={bulkQty} />
                  <input type="hidden" name="bulk_price" id="bulk_price" value={bulkPrice} />
                  <input type="hidden" name="price" id="price" value={unitPrice} />
                  <input type="hidden" name="type" id="type" value={type} />
                  <input type="hidden" name="product_id" id="product_id" value={productDetails?.id} />
                </div>
              </div>

              <div className="action-buttons">
                <button className="add-to-cart" onClick={handleAddToCart}>
                  <img src={CartbtnIcon} alt="cartbtnIcon" className="cartbtnIcon"  />{" "} Add to Cart
                </button>
                <button className="modal-wishlist-btn">
                  <FiHeart />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
