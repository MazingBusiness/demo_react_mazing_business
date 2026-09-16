import React, { useEffect, useRef, useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { getBestSellerProducts } from "../api/apiRequest";
import CartIcon from "../assets/icons/CartIcon.svg";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import noImage from "../assets/images/no-image.png";
import { getLoggedInUser } from "../utils/authUtils";
import ProductModal from "./ProductModal";

const renderRating = (rating) => {
  const numericRating = Math.min(5, Math.max(0, Number(rating || 0)));
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const stars = [];

  for (let index = 0; index < fullStars; index += 1) {
    stars.push(<FaStar key={`full-${index}`} className="star-icon full-star" />);
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star-icon half-star" />);
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let index = 0; index < emptyStars; index += 1) {
    stars.push(
      <FaRegStar key={`empty-${index}`} className="star-icon empty-star" />
    );
  }

  return stars;
};

const TopSellingProducts = () => {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openProductModal = (product) => {
    if (!product?.id) return;
    pausedRef.current = true;
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    pausedRef.current = false;
  };

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const response = await getBestSellerProducts();
        const payload = await response.json();
        const productList = Array.isArray(payload?.data) ? payload.data : [];

        if (!ignore) {
          setProducts(productList);
        }
      } catch (error) {
        console.error("Top selling products fetch error:", error);
        if (!ignore) {
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let animationFrameId = 0;
    let previousTime = 0;
    const pixelsPerSecond = 22;

    const animate = (time) => {
      const scroller = scrollerRef.current;

      if (!previousTime) {
        previousTime = time;
      }

      const delta = time - previousTime;
      previousTime = time;

      if (
        scroller &&
        !pausedRef.current &&
        !draggingRef.current &&
        scroller.scrollHeight > scroller.clientHeight
      ) {
        scroller.scrollTop += (pixelsPerSecond * delta) / 1000;

        if (scroller.scrollTop >= scroller.scrollHeight - scroller.clientHeight - 1) {
          scroller.scrollTop = 0;
        }
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [products.length]);

  const handlePointerDown = (event) => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    pausedRef.current = true;
    draggingRef.current = true;
    hasDraggedRef.current = false;
    lastPointerYRef.current = event.clientY;
    scroller.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const scroller = scrollerRef.current;

    if (!scroller || !draggingRef.current) return;

    const movement = event.clientY - lastPointerYRef.current;

    if (Math.abs(movement) > 2) {
      hasDraggedRef.current = true;
      scroller.scrollTop -= movement;
      lastPointerYRef.current = event.clientY;
      event.preventDefault();
    }
  };

  const handlePointerEnd = (event) => {
    const scroller = scrollerRef.current;

    draggingRef.current = false;
    scroller?.releasePointerCapture?.(event.pointerId);

    window.setTimeout(() => {
      pausedRef.current = false;
      hasDraggedRef.current = false;
    }, 900);
  };

  const handleClickCapture = (event) => {
    if (hasDraggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  return (
    <>
      <aside className="top-products">
        <h5>Top Selling Products</h5>

        <div
          ref={scrollerRef}
          className="top-selling-product-viewport"
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClickCapture={handleClickCapture}
        >
          <div className="product-grid top-selling-product-grid">
            {loading && (
              <div className="top-selling-status">
                Loading top selling products...
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="top-selling-status">
                No top selling products found.
              </div>
            )}

            {!loading &&
              products.map((product) => {
                const image =
                  product?.thumb_img?.file_name ||
                  product?.images?.[0]?.file_name ||
                  noImage;
                const mrp = Number(product?.mrp || 0);
                const price = Number(
                  String(product?.discount_price || 0).replace(/[^0-9.]/g, "")
                );
                const reviews = Array.isArray(product?.reviews)
                  ? product.reviews
                  : [];

                return (
                  <article
                    key={product.id}
                    className="product-box top-selling-product-box"
                    onClick={() => openProductModal(product)}
                  >
                    <div className="product-card">
                      <div className="top-selling-image-wrap">
                        <button
                          type="button"
                          className="top-selling-image-button"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            openProductModal(product);
                          }}
                          aria-label={`View ${product.name}`}
                        >
                          <img
                            src={image}
                            alt={product.name || "Product"}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = noImage;
                            }}
                          />
                        </button>

                        {user?.id && (
                          <div className="btnGrp">
                            <button
                              className="cart-btn"
                              aria-label={`Add ${product.name} to cart`}
                              title="Add to cart"
                              type="button"
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.stopPropagation();
                                openProductModal(product);
                              }}
                            >
                              <img src={CartIcon} alt="" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="product-info">
                        <button
                          type="button"
                          className="top-selling-product-name"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            openProductModal(product);
                          }}
                        >
                          {product?.name || "Product"}
                        </button>

                        {user?.id ? (
                          <div className="prices">
                            <span className="old">
                              {"\u20b9"}
                              {mrp.toFixed(2)}
                            </span>
                            <span className="new">
                              {"\u20b9"}
                              {price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="top-selling-register"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate("/login");
                            }}
                          >
                            Register to check prices
                          </button>
                        )}

                        <div className="ratingGrp">
                          <div className="rating">
                            {renderRating(product?.rating)}
                            <span className="rating-count">({reviews.length})</span>
                          </div>

                          {Number(product?.fast_delivery_tag) === 1 && (
                            <div className="delivery">
                              <img
                                src={fastDeliveryIcon}
                                alt="Fast Delivery"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </aside>

      <ProductModal
        product={selectedProduct}
        selectedProduct={selectedProduct}
        productId={selectedProduct?.id}
        isOpen={!!selectedProduct}
        open={!!selectedProduct}
        onClose={closeProductModal}
        onRequestClose={closeProductModal}
      />
    </>
  );
};

export default TopSellingProducts;
