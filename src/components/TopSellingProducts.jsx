import React, { useEffect, useState } from "react";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const response = await getBestSellerProducts();
        const payload = await response.json();
        const productList = Array.isArray(payload?.data) ? payload.data : [];

        if (!ignore) {
          setProducts(productList.slice(0, 5));
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

  return (
    <>
      <aside className="top-products">
        <h5>Top Selling Products</h5>

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
                >
                  <div className="product-card">
                    <div className="top-selling-image-wrap">
                      <button
                        type="button"
                        className="top-selling-image-button"
                        onClick={() => setSelectedProduct(product)}
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
                            onClick={() => setSelectedProduct(product)}
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
                        onClick={() =>
                          navigate(
                            `/product-details/${encodeURIComponent(
                              product?.slug || product?.id || ""
                            )}`
                          )
                        }
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
                          onClick={() => navigate("/login")}
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
      </aside>

      <ProductModal
        product={selectedProduct}
        selectedProduct={selectedProduct}
        productId={selectedProduct?.id}
        isOpen={!!selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onRequestClose={() => setSelectedProduct(null)}
      />
    </>
  );
};

export default TopSellingProducts;
