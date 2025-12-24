import React, { useState, useMemo, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";

import { FaAngleDown, FaAngleUp, FaFilter } from "react-icons/fa";
import ProductGrid from "../components/ProductGrid";
import QuickOrderGid from "../components/QuickOrderGid";

// Api Call
import { getAllBrands, getAllCategoryGroups } from "../api/apiRequest";

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
  const [selectedCatGs, setSelectedCatGs] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState([]);
  const [allCategoryGroups, setAllCategoryGroups] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCatGIds, setSelectedCatGIds] = useState([]);        // ✅ store group IDs
  const [selectedChildCatIds, setSelectedChildCatIds] = useState([]); // ✅ store child IDs

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

  const [showMoreCatG, setShowMoreCatG] = useState(5);
  const [showMoreBrands, setShowMoreBrands] = useState(5);
  const [showMoreDelivery, setShowMoreDelivery] = useState(2);

  const [category_group_id, setCategoryGroupId] = useState('');
  const [category_id, setcategoryId] = useState('');

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
  // const getAllCategoryGroupsFromAPI = async () => {
  //   try {
  //     setLoading(true);
  //     const apiRes = await getAllCategoryGroups();
  //     const responseData = await apiRes.json(); // ✅ important
  //     if (responseData?.res) {
  //       setAllCategoryGroups(responseData?.data || []);
  //     } else {
  //       setAllCategoryGroups([]);
  //       // NotificationManager.error(responseData?.msg || "Something went wrong", "", 2000);
  //     }
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     setAllCategoryGroups([]);
  //     // NotificationManager.error("Failed to load brands", "", 2000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const getAllCategoryGroupsFromAPI = async () => {
    try {
      setLoading(true);
      const apiRes = await getAllCategoryGroups();
      const responseData = await apiRes.json();
      if (responseData?.res) setAllCategoryGroups(responseData?.data || []);
      else setAllCategoryGroups([]);
    } catch (e) {
      console.error(e);
      setAllCategoryGroups([]);
    } finally {
      setLoading(false);
    }
  };
  const getAllBrandsFromAPI = async () => {
    try {
      setLoading(true);
      const apiRes = await getAllBrands(category_group_id, category_id);
      const responseData = await apiRes.json(); // ✅ important

      if (responseData?.res) {
        setAllBrands(responseData?.data || []);
      } else {
        setAllBrands([]);
        // NotificationManager.error(responseData?.msg || "Something went wrong", "", 2000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setAllBrands([]);
      // NotificationManager.error("Failed to load brands", "", 2000);
    } finally {
      setLoading(false);
    }
  };
  // Called funtion
  useEffect(() => { getAllBrandsFromAPI(); }, [category_group_id, category_id]);
  useEffect(() => { getAllCategoryGroupsFromAPI(); },[]);

  // ✅ Alphabetically sort child categories for each group
  const groupsWithSortedChildren = useMemo(() => {
    return (allCategoryGroups || []).map((g) => ({
      ...g,
      child_category: [...(g.child_category || [])].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", undefined, { sensitivity: "base" })
      ),
    }));
  }, [allCategoryGroups]);

  const toggleCatG = (groupId) => {
    setSelectedCatGIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );

    // optional: when group is unselected, remove its child selections
    const group = allCategoryGroups.find((g) => g.id === groupId);
    const childIds = (group?.child_category || []).map((c) => c.id);
    setSelectedChildCatIds((prev) => prev.filter((id) => !childIds.includes(id)));
  };

  const toggleChildCat = (childId) => {
    setSelectedChildCatIds((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
    );
  };

  const clearBCatG = () => setSelectedCatGs([]);
  const clearBrand = () => setSelectedBrands([]);
  const clearDelivery = () => setSelectedDelivery(null);
  const clearPrice = () => {
    setCurrentMin(1500);
    setCurrentMax(6000);
    setInputMin(1500);
    setInputMax(6000);
    updateSliderWidths();
  };
  const clearCatG = () => {
    setSelectedCatGIds([]);
    setSelectedChildCatIds([]);
  };
  const clearAll = () => {
    clearBrand();
    clearDelivery();
    clearPrice();
  };

  const toggleCatGs = () => {
    setShowMoreCatG((prev) => (prev >= allCategoryGroups.length ? 5 : prev + 5));
  };

  const toggleBrands = () => {
    setShowMoreBrands((prev) => (prev >= allBrands.length ? 5 : prev + 5));
  };

  const toggleDelivery = () => {
    setShowMoreDelivery((prev) =>
      prev >= deliveryOptions.length ? 2 : prev + 2
    );
  };

  // const toggleCatG = (catG) => {
  //   setSelectedCatGs((prev) =>
  //     prev.includes(catG) ? prev.filter((b) => b !== catG) : [...prev, catG]
  //   );
  // };

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
          <button className="mobile-filter-btn" onClick={toggleMobileFilters} aria-label="Toggle filters" >
            <FaFilter /> Filters
          </button>
          <div className={`filters-section sidebarFilters ${
              showMobileFilters ? "mobile-visible" : ""
            }`}
          >
            {/* {(selectedCatGs.length > 0 || selectedBrands.length > 0 ||
              selectedDelivery ||
              currentMin !== 1500 ||
              currentMax !== 6000) && (
              <div className="active-filters">
                {selectedCatGs.length > 0 && (
                  <div className="active-part">
                    <label>Category Groupss:</label>
                    <div className="active-tag">
                      {selectedCatGs.map((catG, index) => (
                        <span key={index}>
                          {catG}
                          <button onClick={() => toggleCatG(catG)}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
            )} */}

            <div className="filters">

              {/* Catgory Group Filter */}
              <div className="filter-section">
                <h4>
                  Category Group{" "}
                  <button onClick={clearCatG} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>
                {/* <div className="checkbox-group brand-group fade-in">
                  {allCategoryGroups.slice(0, showMoreCatG).map((catG) => (
                    <label key={catG.id} className={`animated-checkbox ${ selectedCatGs.includes(catG.id) ? "checked" : "" }`} >
                      <input type="checkbox" checked={selectedCatGs.includes(catG.name)} onChange={() => toggleCatG(catG.name)} value={catG.id} />
                      <span className="custom-check"></span>
                      {catG.name}
                    </label>
                  ))}
                </div> */}
                <div className="checkbox-group brand-group fade-in">
                  {groupsWithSortedChildren.slice(0, showMoreCatG).map((catG) => {
                    const isGroupSelected = selectedCatGIds.includes(catG.id);

                    return (
                      <div key={catG.id} style={{ marginBottom: 10 }}>
                        <label className={`animated-checkbox ${isGroupSelected ? "checked" : ""}`}>
                          <input type="checkbox" checked={isGroupSelected} onChange={() => toggleCatG(catG.id)} value={catG.id} />
                          <span className="custom-check" />
                          {catG.name}
                        </label>
                        {/* Child Categories (show only when this group is selected) */}
                        {isGroupSelected && (catG.child_category?.length > 0) && (
                          <div className="checkbox-group brand-group fade-in" style={{ marginLeft: 26, marginTop: 6 }}>
                            {catG.child_category.map((child) => {
                              const isChildSelected = selectedChildCatIds.includes(child.id);
                              return (
                                <label key={child.id} className={`animated-checkbox ${isChildSelected ? "checked" : ""}`}>
                                  <input type="checkbox" checked={isChildSelected} onChange={() => toggleChildCat(child.id)} value={child.id} />
                                  <span className="custom-check" />
                                  {child.name}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button onClick={toggleCatGs} className="show-more">
                  {showMoreCatG >= allCategoryGroups.length ? (
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
              {/* Brands Filter */}
              <div className="filter-section">
                <h4>
                  Brands{" "}
                  <button onClick={clearBrand} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>
                <div className="checkbox-group brand-group fade-in">
                  {allBrands.slice(0, showMoreBrands).map((brand) => (
                    <label key={brand.id} className={`animated-checkbox ${
                        selectedBrands.includes(brand.id) ? "checked" : ""
                      }`}
                    >
                      <input type="checkbox" checked={selectedBrands.includes(brand.name)} onChange={() => toggleBrand(brand.name)} />
                      <span className="custom-check"></span>
                      {brand.name}
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
                  {deliveryOptions .slice(0, showMoreDelivery) .map((option, index) => (
                      <label key={index} className={`animated-checkbox ${ selectedDelivery === option ? "checked" : "" }`} >
                        <input type="checkbox" checked={selectedDelivery === option} onChange={() => setSelectedDelivery(option)} />
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
