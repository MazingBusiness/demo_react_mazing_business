import React, { useState } from "react";
import {
  products,
  renderRating,
  renderProductImage,
} from "../data/QuickOrderUtils.jsx";

import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";

import ProductModal from "../components/ProductModal.jsx";

import { GoDotFill } from "react-icons/go";

const QuickOrderGid = () => {
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
        Home
        <em>
          <GoDotFill />
        </em>
        All Category
        <em>
          <GoDotFill />
        </em>
        Power Tools
        <em>
          <GoDotFill />
        </em>
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
      <div className="product-grid Quick-grid">
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div class="pagination-wrapper">
        <button class="pagination-btn nav disabled">Previous</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <span class="pagination-btn dots">...</span>
        <button class="pagination-btn">4</button>
        <button class="pagination-btn">5</button>
        <button class="pagination-btn nav">Next</button>
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

export default QuickOrderGid;
