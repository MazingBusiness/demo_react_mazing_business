import React, { useState } from "react";
import {
  products,
  renderRating,
  renderProductImage,
} from "../data/productDetailUtils.jsx";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import ProductModal from "../components/ProductModal.jsx";

import { GoDotFill } from "react-icons/go";

import CartIcon from "../assets/icons/CartIcon.svg";

const ProductDetailsGrid = () => {
  const [sortBy, setSortBy] = useState("Popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handleSortChange = (option) => {
    setSortBy(option);
    // Sort logic can go here
  };

  const sortOptions = [
    "Popularity",
    "Price: Low to High",
    "Price: High to Low",
  ];

  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  return (
    <div className="product-section-wrapper">
      {/* Result and Sort */}
      <div className="product-header">
        <div className="product-count">
          Result: <strong>{products.length} Products</strong>
        </div>
        <div className="sort-by">
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {currentProducts.map((product) => (
          <div key={product.id} className="product-box">
            <div className="product-card">
              {renderProductImage(product)}
              <div className="product-info">
                <div className="product-info-top">
                  <div className="product-info-top-lft">
                    <h3>{product.name}</h3>
                    <div className="prices">
                      <span className="old">{product.oldPrice}</span>
                      <span className="new">{product.newPrice}</span>
                      <div className="discount">OFF {product.discount}</div>
                    </div>
                  </div>

                  <div className="product-info-top-rgt">
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

                    <button
                      className="cart-btn"
                      aria-label="Add to cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(product); // ✅ open modal here
                      }}
                    >
                      <img src={CartIcon} alt="CartIcon" />
                    </button>
                  </div>
                </div>

                <div className="ratingGrp">
                  <div className="ratingGrpLft">
                    <div className="rating">
                      {renderRating(product.rating)}
                      <span className="rating-count">
                        ({product.totalRatings})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
                <div className="sold">Sold: {product.sold}</div>

                <div className="QuantityBox">
                  <input type="number" placeholder="Enter quantity" />
                  <button className="add-to-cart">Buy Now</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProductDetailsGrid;
