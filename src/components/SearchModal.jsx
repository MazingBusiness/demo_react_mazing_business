import React from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import product1 from "../assets/images/product.jpg";

const products = [
  {
    id: 1,
    name: "Power Safe Connectors",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 2,
    name: "Power Wash Cleaning Equipment",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 3,
    name: "Power Machines Turbines",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 4,
    name: "Golden Power Batteries",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 5,
    name: "Power Film Solar Panels",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 6,
    name: "Power Lock Connectors",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
];

const SearchModal = ({ searchText, onChange, onClear, onClose }) => {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const highlightText = (text) => {
    const lowerSearch = searchText.toLowerCase();
    return text.split(" ").map((word, i) => {
      const lowerWord = word.toLowerCase();
      if (lowerWord.includes(lowerSearch) && searchText !== "") {
        const start = lowerWord.indexOf(lowerSearch);
        const end = start + lowerSearch.length;

        return (
          <span key={i}>
            {word.slice(0, start)}
            <span className="highlight">{word.slice(start, end)}</span>
            {word.slice(end)}{" "}
          </span>
        );
      }
      return <span key={i}>{word} </span>;
    });
  };

  return (
    <div className="search-modal-backdrop">
      <div className="search-modal">
        {/* Results Section */}
        {searchText && (
          <div className="results-wrapper">
            {filteredProducts.length > 0 ? (
              <>
                <h2>Found {filteredProducts.length} Products</h2>
                <div className="results-container">
                  {filteredProducts.map((product) => (
                    <div className="result-item" key={product.id}>
                      <img src={product.img} alt={product.name} />
                      <div className="result-item-product-info">
                        <div className="product-info-lft">
                          <p>{highlightText(product.name)}</p>
                          <p className="price">
                            <del>₹{product.price}</del>{" "}
                            <span className="discount">
                              ₹{product.discountedPrice}
                            </span>
                          </p>
                        </div>
                        <button className="arrow-btn">
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results">No products found</div>
            )}
          </div>
        )}

        {/* Search Input Section */}
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for products, categories, or brands"
            value={searchText}
            onChange={onChange}
            autoFocus
          />
          <button
            className="close-btn"
            onClick={() => {
              onClear();
              onClose();
            }}
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
