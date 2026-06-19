import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import ProductModal from "./ProductModal.jsx";
import { getLoggedInUser } from "../utils/authUtils";

const getNumber = (value) => Number(String(value || 0).replace(/[^0-9.]/g, ""));

const hasActiveOffer = (offer) => {
  const offerList = Array.isArray(offer) ? offer : [];
  const now = new Date();

  return offerList.some((offerItem) => {
    const start = offerItem?.offer_validity_start
      ? new Date(String(offerItem.offer_validity_start).replace(" ", "T"))
      : null;
    const end = offerItem?.offer_validity_end
      ? new Date(String(offerItem.offer_validity_end).replace(" ", "T"))
      : null;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    return now >= start && now <= end;
  });
};

const ProductDetailsGrid = ({ allVarientProducts = [], loading = false, error = "" }) => {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const userId = user?.id || null;

  const [priceSort, setPriceSort] = useState("popularity");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = useMemo(() => {
    const transformedProducts = allVarientProducts.map((item) => {
      const discountPrice = getNumber(item?.discount_price);
      const mrp = getNumber(item?.mrp || item?.original_mrp);
      const cInstockMCoin = Number(item?.c_instock_m_coin || 0);
      const offerList = Array.isArray(item?.offer) ? item.offer : [];

      return {
        ...item,
        id: item?.id,
        slug: item?.slug,
        name: item?.name || "Product",
        img: item?.thumb_img?.file_name || item?.images?.[0]?.file_name || no_image,
        oldPrice: mrp ? `\u20b9${mrp.toFixed(2)}` : "\u20b90.00",
        newPrice: discountPrice ? `\u20b9${discountPrice.toFixed(2)}` : "\u20b90.00",
        rating: item?.rating && Number(item.rating) !== 0 ? item.rating : 4,
        totalRatings:
          Array.isArray(item?.reviews) && item.reviews.length > 0
            ? item.reviews.length
            : 20,
        fastDeliveryTag: Number(item?.fast_delivery_tag) === 1,
        is_warranty: Number(item?.is_warranty) === 1,
        noCredit: Number(item?.cash_and_carry_item) === 1,
        cash_and_carry_item: Number(item?.cash_and_carry_item || 0),
        offer: offerList,
        hasActiveOffer: hasActiveOffer(offerList),
        discount: item?.discount ? `${item.discount}%` : "20%",
        category_group: item?.category_group?.name || item?.category_group || "",
        category: item?.category?.name || item?.category || "",
        fast_delivery_tag: item?.fast_delivery_tag,
        stocks: item?.stocks || [],
        reviews: item?.reviews || [],
        earnMCoin: discountPrice * cInstockMCoin,
        c_instock_m_coin: cInstockMCoin || 0,
        user_id: userId,
      };
    });

    return transformedProducts.sort((a, b) => {
      const aPrice = getNumber(a.discount_price);
      const bPrice = getNumber(b.discount_price);

      if (priceSort === "low_to_high") return aPrice - bPrice;
      if (priceSort === "high_to_low") return bPrice - aPrice;
      return Number(b.num_of_sale || 0) - Number(a.num_of_sale || 0);
    });
  }, [allVarientProducts, priceSort, userId]);

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const renderFastDeliveryTag = (product) => {
    if (!product.fastDeliveryTag) return null;

    return (
      <div className="delivery">
        <img
          src={fastDeliveryIcon}
          alt="Fast Delivery"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
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
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  };

  const renderProductImage = (product, onCartClick = () => {}) => (
    <div className="product-img">
      {product.img ? (
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = no_image;
          }}
          onClick={(e) => {
            e.stopPropagation();
            onCartClick(product);
          }}
        />
      ) : (
        <div className="image-placeholder">
          <span>No Image</span>
          <img src={no_image} alt="No Image" loading="lazy" />
        </div>
      )}

      {product.user_id != null && (
        <>
          <div className="btnGrp">
            <button
              className="cart-btn"
              aria-label="Add to cart"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCartClick(product);
              }}
            >
              <img src={CartIcon} alt="CartIcon" /> Add to Cart
            </button>
          </div>

          {Number(product.cash_and_carry_item) === 1 && (
            <div className="no-credit-tag">No Credit Item</div>
          )}

          {product.hasActiveOffer && (
            <div className="offer-tag">Special Offer Item</div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="product-section-wrapper">
      <div className="product-header">
        <div className="product-header-left">
          <div className="product-count">
            Result: <strong>{products.length} Products</strong>
          </div>

          <div className="sort-by">
            <span>Sort By:</span>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
            >
              <option value="popularity">Popularity</option>
              <option value="low_to_high">Price: Low to High</option>
              <option value="high_to_low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="product-grid Quick-grid variant-products-grid">
        {loading && (
          <div className="no-products">Loading variant products...</div>
        )}

        {!loading && error && (
          <div className="no-products">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="no-products">No variant products found.</div>
        )}

        {!loading && !error && products.map((product) => (
          <div
            key={product.id}
            className="product-box"
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onClick={() => openModal(product)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openModal(product);
              }
            }}
          >
            <div className="product-card">
              {renderProductImage(product, openModal)}

              <div className="product-info">
                <h3 title={product.name}>
                  {product.name?.length > 85
                    ? `${product.name.substring(0, 85)}...`
                    : product.name}
                </h3>

                {product.user_id != null && (
                  <>
                    <div className="prices">
                      <span className="old">{product.oldPrice}</span>
                      <span className="new">{product.newPrice}</span>
                    </div>
                    <div className="prices">
                      <span className="emcoin">
                        Earn MCoin : {Number(product.earnMCoin || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                <div className="ratingGrp">
                  <div className="ratingGrpLft">{renderWarrantyTag(product)}</div>
                  {renderFastDeliveryTag(product)}
                </div>

                {product.user_id == null && (
                  <div>
                    <button
                      type="button"
                      className="before-reg-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/register");
                      }}
                    >
                      Register to check prices
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProductDetailsGrid;
