import React, { useState } from "react";
import {
  products,
  renderRating,
  renderProductImage,
} from "../data/productUtils.jsx";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import ProductModal from "../components/ProductModal.jsx"; // Make sure this path is correct

const ProductGrid = () => {
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
      {/* Breadcrumb */}
      <div className="breadcrumb">
        Home &nbsp;/&nbsp; All Category &nbsp;/&nbsp; Power Tools &nbsp;/&nbsp;
        <span className="current">Air Blower</span>
      </div>

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
              {renderProductImage(product, openModal)}
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="prices">
                  <span className="old">{product.oldPrice}</span>
                  <span className="new">{product.newPrice}</span>
                </div>
                <div className="ratingGrp">
                  <div className="ratingGrpLft">
                    <div className="discount">OFF {product.discount}</div>
                    <div className="rating">
                      {renderRating(product.rating)}
                      <span className="rating-count">
                        ({product.totalRatings})
                      </span>
                    </div>
                  </div>
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
                </div>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
                <div className="sold">Sold: {product.sold}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-wrapper">
        <button
          className={`pagination-btn nav ${
            currentPage === 1 ? "disabled" : ""
          }`}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          const showDots =
            totalPages > 5 &&
            ((pageNum === 2 && currentPage > 3) ||
              (pageNum === totalPages - 1 && currentPage < totalPages - 2));

          if (showDots) {
            return (
              <span key={`dots-${pageNum}`} className="pagination-btn dots">
                ...
              </span>
            );
          }

          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          }

          return null;
        })}

        <button
          className={`pagination-btn nav ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
        >
          Next
        </button>
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

export default ProductGrid;
