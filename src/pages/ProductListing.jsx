import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import ProductGrid from "../components/ProductGrid";
import { useLocation } from "react-router-dom";
import { getCatProduct } from "../api/apiRequest";
// import { NotificationManager } from "react-notifications"; // if you use this

const deliveryOptions = [
  "Delivery in 3 - 4 Days",
  "Delivery in 6 - 7 Days",
  "Delivery in 9 - 10 Days",
];

const ProductListing = () => {
  const location = useLocation();
  const { state } = location || {};

  // 👇 derive from router state every render
  const slug = state?.slug || "";
  const cat_id = state?.cat_id || "";
  const parent_cat_id = state?.parent_cat_id || "";
  const brand_id = state?.brand_id || "";
  const [currentPage, setCurrentPage] = useState(1);

  const [brands, setBrands] = useState([]); // renamed to avoid confusion

  const getAllBrands = async () => {
    try {
      if (!cat_id) return;

      const apiRes = await getCatProduct(cat_id, currentPage, brand_id);
      const responseData = await apiRes.json();

      if (responseData.res) {
        const allBrands = responseData.allBrands || [];
        setBrands(allBrands);
      } else {
        NotificationManager.error(
          responseData.msg || "Something went wrong",
          "",
          2000
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      NotificationManager.error("Failed to load brands", "", 2000);
    }
  };

  // 👇 whenever cat_id OR currentPage changes, fetch brands again
  useEffect(() => {
    if (cat_id) {
      getAllBrands();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat_id, currentPage]);

  // Filters state
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState();
  const brandsParam = selectedBrands.join(",");

  // Price slider state
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

  // 👇 Recalculate slider sizes on mount
  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.offsetWidth);
      setSliderOffset(sliderRef.current.offsetLeft);
    }
    updateSliderWidths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 👇 Also: reset filters when category changes (optional but usually desired)
  useEffect(() => {
    setSelectedBrands([]);
    setSelectedDelivery(undefined);
    setCurrentMin(1500);
    setCurrentMax(6000);
    setInputMin(1500);
    setInputMax(6000);
    setShowMoreBrands(5);
    setShowMoreDelivery(2);
    setCurrentPage(1);
  }, [cat_id]);

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
    setShowMoreBrands((prev) =>
      prev >= brands.length ? 5 : prev + 5
    );
  };

  const toggleDelivery = () => {
    setShowMoreDelivery((prev) =>
      prev >= deliveryOptions.length ? 2 : prev + 2
    );
  };

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
  };

  const handleMinChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setInputMin(val);
    if (val >= min && val <= currentMax - minValueBetween) {
      setCurrentMin(val);
      updateSliderWidths();
    }
  };

  const handleMaxChange = (e) => {
    const val = parseInt(e.target.value, 10);
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

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="productListingwrapper">
          <div className="sidebarFilters">
            {(selectedBrands.length > 0 ||
              selectedDelivery ||
              currentMin !== 1500 ||
              currentMax !== 6000) && (
              <div className="active-filters">
                {selectedBrands.length > 0 && (
                  <div className="active-part">
                    <label>Brands:</label>
                    <div className="active-tag">
                      {brands
                        .filter((b) => selectedBrands.includes(b.id))
                        .map((brand) => (
                          <span key={brand.id}>
                            {brand.name}
                            <button onClick={() => toggleBrand(brand.id)}>✕</button>
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
                  {Array.isArray(brands) &&
                    brands.slice(0, showMoreBrands).map((brand) => (
                      <label
                        key={brand.id}
                        className={`animated-checkbox ${
                          selectedBrands.includes(brand.id) ? "checked" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                          value={brand.id}
                        />
                        <span className="custom-check"></span>
                        {brand.name}
                      </label>
                    ))}
                </div>
                {brands.length > 5 && (
                  <button onClick={toggleBrands} className="show-more">
                    {showMoreBrands >= brands.length ? (
                      <>
                        <FaAngleUp /> SHOW LESS
                      </>
                    ) : (
                      <>
                        <FaAngleDown /> SHOW MORE
                      </>
                    )}
                  </button>
                )}
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

              {/* Price Range */}
              <div className="filter-section">
                <h4>
                  Price Range{" "}
                  <button onClick={clearPrice} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>

                <div className="PriceRange">
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

          {/* You probably want to pass filters to ProductGrid later */}
          <div className="productGrid">
            <ProductGrid
              catId={cat_id}
              slug={slug}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              selectedBrands={selectedBrands}      // still pass array if you want
              brandsParam={brandsParam}            // 👈 add this
              selectedDelivery={selectedDelivery}
              priceMin={currentMin}
              priceMax={currentMax}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductListing;
