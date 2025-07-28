import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import ProductGrid from "../components/ProductGrid";
import { useLocation } from "react-router-dom";

const allBrands = [
  "HIKOKI (15)",
  "Bosch (24)",
  "DeWalt (18)",
  "Makita (10)",
  "Black+Decker (8)",
  "Stanley (6)",
  "Ferm (4)",
  "iBell (3)",
  "Cheston (2)",
];

const deliveryOptions = [
  "Delivery in 3 - 4 Days",
  "Delivery in 6 - 7 Days",
  "Delivery in 9 - 10 Days",
];

const ProductListing = () => {
  
  const [selectedBrands, setSelectedBrands] = useState(["HIKOKI (15)"]);
  const [selectedDelivery, setSelectedDelivery] = useState(
    "Delivery in 3 - 4 Days"
  );
  const [priceRange, setPriceRange] = useState([1000, 7500]);
  const [showMoreBrands, setShowMoreBrands] = useState(5);
  const [showMoreDelivery, setShowMoreDelivery] = useState(2);

  const clearBrand = () => setSelectedBrands([]);
  const clearDelivery = () => setSelectedDelivery(null);
  const clearPrice = () => setPriceRange([1000, 7500]);
  const clearAll = () => {
    clearBrand();
    clearDelivery();
    clearPrice();
  };

  const toggleBrands = () => {
    setShowMoreBrands((prev) => (prev >= allBrands.length ? 5 : prev + 5));
  };

  const toggleDelivery = () => {
    setShowMoreDelivery((prev) =>
      prev >= deliveryOptions.length ? 2 : prev + 2
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="productListingwrapper">
          <div className="sidebarFilters">
            {(selectedBrands.length > 0 ||
              selectedDelivery ||
              priceRange[0] > 1000 ||
              priceRange[1] < 7500) && (
              <div className="active-filters">
                {selectedBrands.length > 0 && (
                  <div className="active-part">
                    <label>Brands:</label>

                    <div className="active-tag">
                      {selectedBrands.map((brand, index) => (
                        <span key={index}>
                          {brand}
                          <button onClick={() => toggleBrand(brand)}>
                            ✕
                          </button>{" "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDelivery && (
                  <div className="active-part">
                    <label> Delivery: </label>

                    <div className="active-tag">
                      <span>
                        {selectedDelivery}
                        <button onClick={clearDelivery}>✕</button>{" "}
                      </span>
                    </div>
                  </div>
                )}
                {(priceRange[0] > 1000 || priceRange[1] < 7500) && (
                  <div className="active-tag">
                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                    <button onClick={clearPrice}>✕</button>
                  </div>
                )}
                <button className="clear-all-btn" onClick={clearAll}>
                  Remove All Filters
                </button>
              </div>
            )}

            <div className="filters">
              <div className="filter-section">
                <h4>
                  Brands{" "}
                  <button onClick={clearBrand} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>
                <div className="checkbox-group brand-group fade-in">
                  {allBrands.slice(0, showMoreBrands).map((brand, index) => (
                    <label
                      key={index}
                      className={`animated-checkbox ${
                        selectedBrands.includes(brand) ? "checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                      />
                      <span className="custom-check"></span>
                      {brand}
                    </label>
                  ))}
                </div>
                <button onClick={toggleBrands} className="show-more">
                  {showMoreBrands >= allBrands.length ? (
                    <>
                      <FaAngleUp /> SHOW LESS
                    </>
                  ) : (
                    <>
                      <FaAngleDown /> SHOW MORE
                    </>
                  )}
                </button>
              </div>

              <div className="filter-section">
                <h4>
                  Delivery Option{" "}
                  <button onClick={clearDelivery} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>
                <div className="checkbox-group delivery-group fade-in">
                  {deliveryOptions
                    .slice(0, showMoreDelivery)
                    .map((option, index) => (
                      <label key={index}>
                        <input
                          type="checkbox"
                          checked={selectedDelivery === option}
                          onChange={() => setSelectedDelivery(option)}
                        />
                        {option}
                      </label>
                    ))}
                </div>
                <button onClick={toggleDelivery} className="show-more">
                  {showMoreDelivery >= deliveryOptions.length ? (
                    <>
                      <FaAngleUp /> SHOW LESS
                    </>
                  ) : (
                    <>
                      <FaAngleDown /> SHOW MORE
                    </>
                  )}
                </button>
              </div>

              <div className="filter-section">
                <h4>
                  Price Range{" "}
                  <button onClick={clearPrice} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>
                <input
                  type="range"
                  min="1000"
                  max="7500"
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([+e.target.value, priceRange[1]])
                  }
                />
                <input
                  type="range"
                  min="1000"
                  max="7500"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], +e.target.value])
                  }
                />
                <div className="price-display">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </div>
              </div>
            </div>
          </div>

          <div className="productGrid">
            <ProductGrid />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductListing;
