import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";

import { FaAngleDown, FaAngleUp, FaFilter } from "react-icons/fa";
import ProductGrid from "../components/ProductGrid";
import QuickOrderGid from "../components/QuickOrderGid";

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

const QuickOrder = () => {
  const [selectedBrands, setSelectedBrands] = useState(["HIKOKI (15)"]);
  const [selectedDelivery, setSelectedDelivery] = useState(
    "Delivery in 3 - 4 Days"
  );

  const min = 1000;
  const max = 7500;
  const minValueBetween = 500;

  const [currentMin, setCurrentMin] = useState(1500);
  const [currentMax, setCurrentMax] = useState(6000);
  const [inputMin, setInputMin] = useState(1500);
  const [inputMax, setInputMax] = useState(6000);

  const sliderRef = useRef(null);
  const minValueRef = useRef(null);
  const maxValueRef = useRef(null);

  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderOffset, setSliderOffset] = useState(0);

  const [showMoreBrands, setShowMoreBrands] = useState(5);
  const [showMoreDelivery, setShowMoreDelivery] = useState(2);

  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.offsetWidth);
      setSliderOffset(sliderRef.current.offsetLeft);
    }
    updateSliderWidths();
  }, []);

  const updateSliderWidths = () => {
    if (minValueRef.current) {
      minValueRef.current.style.width = `${(currentMin * 100) / max}%`;
    }
    if (maxValueRef.current) {
      maxValueRef.current.style.width = `${(currentMax * 100) / max}%`;
    }
  };

  const clearBrand = () => setSelectedBrands([]);
  const clearDelivery = () => setSelectedDelivery(null);
  const clearPrice = () => {
    setCurrentMin(1500);
    setCurrentMax(6000);
    setInputMin(1500);
    setInputMax(6000);
    updateSliderWidths();
  };

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

  const handleMinChange = (e) => {
    const val = parseInt(e.target.value);
    setInputMin(val);
    if (val >= min && val <= currentMax - minValueBetween) {
      setCurrentMin(val);
      updateSliderWidths();
    }
  };

  const handleMaxChange = (e) => {
    const val = parseInt(e.target.value);
    setInputMax(val);
    if (val <= max && val >= currentMin + minValueBetween) {
      setCurrentMax(val);
      updateSliderWidths();
    }
  };

  const startMinDrag = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", onMinDrag);
    document.addEventListener("mouseup", stopMinDrag);
    document.addEventListener("touchmove", onMinDrag);
    document.addEventListener("touchend", stopMinDrag);
  };

  const startMaxDrag = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", onMaxDrag);
    document.addEventListener("mouseup", stopMaxDrag);
    document.addEventListener("touchmove", onMaxDrag);
    document.addEventListener("touchend", stopMaxDrag);
  };

  const onMinDrag = (e) => {
    const pageX = e.touches ? e.touches[0].clientX : e.clientX;
    const draggedWidth = pageX - sliderOffset;
    const percent = (draggedWidth * 100) / sliderWidth;
    const val = Math.round((max * percent) / 100);

    if (val >= min && val <= currentMax - minValueBetween) {
      setCurrentMin(val);
      setInputMin(val);
      if (minValueRef.current) minValueRef.current.style.width = `${percent}%`;
    }
  };

  const onMaxDrag = (e) => {
    const pageX = e.touches ? e.touches[0].clientX : e.clientX;
    const draggedWidth = pageX - sliderOffset;
    const percent = (draggedWidth * 100) / sliderWidth;
    const val = Math.round((max * percent) / 100);

    if (val <= max && val >= currentMin + minValueBetween) {
      setCurrentMax(val);
      setInputMax(val);
      if (maxValueRef.current) maxValueRef.current.style.width = `${percent}%`;
    }
  };

  const stopMinDrag = () => {
    document.removeEventListener("mousemove", onMinDrag);
    document.removeEventListener("mouseup", stopMinDrag);
    document.removeEventListener("touchmove", onMinDrag);
    document.removeEventListener("touchend", stopMinDrag);
  };

  const stopMaxDrag = () => {
    document.removeEventListener("mousemove", onMaxDrag);
    document.removeEventListener("mouseup", stopMaxDrag);
    document.removeEventListener("touchmove", onMaxDrag);
    document.removeEventListener("touchend", stopMaxDrag);
  };

  const maxForMin = () => currentMax - minValueBetween;
  const minForMax = () => currentMin + minValueBetween;

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // New state for mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="productListingwrapper">
          {/* Mobile Filter Button */}
          <button
            className="mobile-filter-btn"
            onClick={toggleMobileFilters}
            aria-label="Toggle filters"
          >
            <FaFilter />
            Filters
          </button>
          <div
            className={`filters-section sidebarFilters ${
              showMobileFilters ? "mobile-visible" : ""
            }`}
          >
            {(selectedBrands.length > 0 ||
              selectedDelivery ||
              currentMin !== 1500 ||
              currentMax !== 6000) && (
              <div className="active-filters">
                {selectedBrands.length > 0 && (
                  <div className="active-part">
                    <label>Brands:</label>
                    <div className="active-tag">
                      {selectedBrands.map((brand, index) => (
                        <span key={index}>
                          {brand}
                          <button onClick={() => toggleBrand(brand)}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDelivery && (
                  <div className="active-part">
                    <label>Delivery:</label>
                    <div className="active-tag">
                      <span>
                        {selectedDelivery}
                        <button onClick={clearDelivery}>✕</button>
                      </span>
                    </div>
                  </div>
                )}
                {(currentMin !== 1500 || currentMax !== 6000) && (
                  <div className="active-part">
                    <label>Price:</label>
                    <div className="active-tag">
                      <span>
                        ₹{currentMin} - ₹{currentMax}
                        <button onClick={clearPrice}>✕</button>
                      </span>
                    </div>
                  </div>
                )}
                <button className="clear-all-btn" onClick={clearAll}>
                  Remove All Filters
                </button>
              </div>
            )}

            <div className="filters">
              {/* Brands Filter */}
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

              {/* Delivery Filter */}
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
                      <label
                        key={index}
                        className={`animated-checkbox ${
                          selectedDelivery === option ? "checked" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDelivery === option}
                          onChange={() => setSelectedDelivery(option)}
                        />
                        <span className="custom-check"></span>
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

              {/* ✅ Price Range */}
              <div className="filter-section">
                <h4>
                  Price Range{" "}
                  <button onClick={clearPrice} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>

                <div className="PriceRange">
                  {/* <div className="current-value">
                  <label>Min:</label>
                  <input
                    type="number"
                    value={inputMin}
                    min={min}
                    max={maxForMin()}
                    onChange={handleMinChange}
                  />
                  <br />
                  <label>Max:</label>
                  <input
                    type="number"
                    value={inputMax}
                    min={minForMax()}
                    max={max}
                    onChange={handleMaxChange}
                  />
                </div> */}
                  <div className="values">
                    <div>{min}</div>
                    <div>{max}</div>
                  </div>
                  <div ref={sliderRef} id="slider">
                    <div ref={minValueRef} id="min" data-content={currentMin}>
                      <div
                        id="min-drag"
                        onMouseDown={startMinDrag}
                        onTouchStart={startMinDrag}
                      ></div>
                    </div>
                    <div ref={maxValueRef} id="max" data-content={currentMax}>
                      <div
                        id="max-drag"
                        onMouseDown={startMaxDrag}
                        onTouchStart={startMaxDrag}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="productGrid">
            <QuickOrderGid />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuickOrder;
