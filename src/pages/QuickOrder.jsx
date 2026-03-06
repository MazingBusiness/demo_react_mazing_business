import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import { FaAngleDown, FaAngleUp, FaFilter } from "react-icons/fa";
import QuickOrderGid from "../components/QuickOrderGid";

// Api Call
import { getAllBrands, getAllCategoryGroups } from "../api/apiRequest";

const deliveryOptions = [
  { value: 1, label: "Delivery in 3 - 4 Days" },
  { value: 0, label: "Delivery in 6 - 7 Days" },
];

const QuickOrder = () => {
  const location = useLocation();
  const incomingState = location.state || null;

  const incomingCatId = incomingState?.cat_id ? Number(incomingState.cat_id) : null;
  const incomingCatGId = incomingState?.cat_g_id ? Number(incomingState.cat_g_id) : null;

  const [selectedCatGIds, setSelectedCatGIds] = useState([]);
  const [selectedChildCatIds, setSelectedChildCatIds] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [search_text, setSearchText] = useState("");
  const [min_price, setMinPrice] = useState(null);
  const [max_price, setMaxPrice] = useState(null);
  const [location_id, setLocationId] = useState(null);
  const [inhouse_product, setInhouseProduct] = useState(null);
  const [price_sort, setPriceSort] = useState(null);

  const [allCategoryGroups, setAllCategoryGroups] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filters = useMemo(
    () => ({
      cat_groups: selectedCatGIds,
      categories: selectedChildCatIds,
      brands: selectedBrands,
      delivery: selectedDelivery,
      search_text,
      min_price,
      max_price,
      location_id,
      inhouse_product,
      price_sort,
    }),
    [
      selectedCatGIds,
      selectedChildCatIds,
      selectedBrands,
      selectedDelivery,
      search_text,
      min_price,
      max_price,
      location_id,
      inhouse_product,
      price_sort,
    ]
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

  const [showMoreCatG, setShowMoreCatG] = useState(5);
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

  const getAllCategoryGroupsFromAPI = async () => {
    try {
      setLoading(true);
      const apiRes = await getAllCategoryGroups();
      const responseData = await apiRes.json();

      if (responseData?.res) {
        setAllCategoryGroups(responseData?.data || []);
      } else {
        setAllCategoryGroups([]);
      }
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
      const apiRes = await getAllBrands(selectedCatGIds, selectedChildCatIds);
      const responseData = await apiRes.json();

      if (responseData?.res) {
        setAllBrands(responseData?.data || []);
      } else {
        setAllBrands([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setAllBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategoryGroupsFromAPI();
  }, []);

  useEffect(() => {
    getAllBrandsFromAPI();
  }, [selectedCatGIds, selectedChildCatIds]);

  const groupsWithSortedChildren = useMemo(() => {
    return (allCategoryGroups || []).map((g) => ({
      ...g,
      child_category: [...(g.child_category || [])].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", undefined, {
          sensitivity: "base",
        })
      ),
    }));
  }, [allCategoryGroups]);

  useEffect(() => {
    if (!groupsWithSortedChildren.length) return;
    if (!incomingState) return;

    let nextGroupIds = [];
    let nextChildIds = [];

    if (incomingCatGId) {
      const matchedGroup = groupsWithSortedChildren.find(
        (group) => Number(group.id) === Number(incomingCatGId)
      );

      if (matchedGroup) {
        nextGroupIds = [Number(incomingCatGId)];

        if (incomingCatId) {
          const childExists = (matchedGroup.child_category || []).some(
            (child) => Number(child.id) === Number(incomingCatId)
          );

          if (childExists) {
            nextChildIds = [Number(incomingCatId)];
          }
        }
      }
    }

    setSelectedCatGIds(nextGroupIds);
    setSelectedChildCatIds(nextChildIds);
    setSelectedBrands([]);
    setSelectedDelivery(null);
    setSearchText("");
  }, [incomingState, incomingCatGId, incomingCatId, groupsWithSortedChildren]);

  // ✅ ensure selected category group is visible even if initially hidden
  useEffect(() => {
    if (!selectedCatGIds.length || !groupsWithSortedChildren.length) return;

    const firstSelectedGroupId = selectedCatGIds[0];

    const selectedIndex = groupsWithSortedChildren.findIndex(
      (group) => Number(group.id) === Number(firstSelectedGroupId)
    );

    if (selectedIndex !== -1 && selectedIndex + 1 > showMoreCatG) {
      setShowMoreCatG(selectedIndex + 1);
    }
  }, [selectedCatGIds, groupsWithSortedChildren, showMoreCatG]);

  const toggleCatG = (groupId) => {
    setSelectedCatGIds((prev) => {
      const isSelected = prev.includes(groupId);

      if (isSelected) {
        const group = groupsWithSortedChildren.find((g) => g.id === groupId);
        const childIds = (group?.child_category || []).map((c) => c.id);

        setSelectedChildCatIds((childPrev) =>
          childPrev.filter((id) => !childIds.includes(id))
        );

        return prev.filter((id) => id !== groupId);
      }

      return [...prev, groupId];
    });
  };

  const toggleChildCat = (childId) => {
    setSelectedChildCatIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const clearBrand = () => setSelectedBrands([]);
  const clearDelivery = () => setSelectedDelivery(null);

  const clearCatG = () => {
    setSelectedCatGIds([]);
    setSelectedChildCatIds([]);
    setShowMoreCatG(5);
  };

  const toggleCatGs = () => {
    setShowMoreCatG((prev) =>
      prev >= allCategoryGroups.length ? 5 : prev + 5
    );
  };

  const toggleBrands = () => {
    setShowMoreBrands((prev) => (prev >= allBrands.length ? 5 : prev + 5));
  };

  const toggleDelivery = () => {
    setShowMoreDelivery((prev) =>
      prev >= deliveryOptions.length ? 3 : prev + 3
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const onMinDrag = (e) => {
    const pageX = e.touches ? e.touches[0].clientX : e.clientX;
    const draggedWidth = pageX - sliderOffset;
    const percent = (draggedWidth * 100) / sliderWidth;
    const val = Math.round((max * percent) / 100);

    if (val >= min && val <= currentMax - minValueBetween) {
      setCurrentMin(val);
      setInputMin(val);
      if (minValueRef.current) {
        minValueRef.current.style.width = `${percent}%`;
      }
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
      if (maxValueRef.current) {
        maxValueRef.current.style.width = `${percent}%`;
      }
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

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="productListingwrapper">
          <button
            className="mobile-filter-btn"
            onClick={toggleMobileFilters}
            aria-label="Toggle filters"
          >
            <FaFilter /> Filters
          </button>

          <div
            className={`filters-section sidebarFilters ${
              showMobileFilters ? "mobile-visible" : ""
            }`}
          >
            <div className="filters">
              <div className="filter-section">
                <h4>
                  Category Group{" "}
                  <button onClick={clearCatG} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>

                <div className="checkbox-group brand-group fade-in">
                  {groupsWithSortedChildren.slice(0, showMoreCatG).map((catG) => {
                    const isGroupSelected = selectedCatGIds.includes(catG.id);

                    return (
                      <label
                        key={catG.id}
                        className={`animated-checkbox ${
                          isGroupSelected ? "checked" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGroupSelected}
                          onChange={() => toggleCatG(catG.id)}
                        />
                        <span className="custom-check" />
                        {catG.name}
                      </label>
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

              <div className="filter-section">
                <h4>
                  Categories{" "}
                  <button
                    onClick={() => setSelectedChildCatIds([])}
                    className="clear-btn"
                  >
                    ✕ CLEAR
                  </button>
                </h4>

                {selectedCatGIds.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Select a Category Group to see categories.
                  </div>
                ) : (
                  <div className="fade-in">
                    {groupsWithSortedChildren
                      .filter((g) => selectedCatGIds.includes(g.id))
                      .map((g) => {
                        const children = g.child_category || [];
                        if (children.length === 0) return null;

                        return (
                          <div key={g.id} style={{ marginBottom: 14 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                marginBottom: 6,
                              }}
                            >
                              {g.name}
                            </div>

                            <div className="checkbox-group brand-group fade-in">
                              {children.map((child) => {
                                const isChildSelected = selectedChildCatIds.includes(
                                  child.id
                                );

                                return (
                                  <label
                                    key={child.id}
                                    className={`animated-checkbox ${
                                      isChildSelected ? "checked" : ""
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChildSelected}
                                      onChange={() => toggleChildCat(child.id)}
                                    />
                                    <span className="custom-check" />
                                    {child.name}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="filter-section">
                <h4>
                  Brands{" "}
                  <button onClick={clearBrand} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>

                <div className="checkbox-group brand-group fade-in">
                  {allBrands.slice(0, showMoreBrands).map((brand) => (
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
                      />
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

              <div className="filter-section">
                <h4>
                  Delivery Option{" "}
                  <button onClick={clearDelivery} className="clear-btn">
                    ✕ CLEAR
                  </button>
                </h4>

                <div className="checkbox-group delivery-group fade-in">
                  {deliveryOptions.slice(0, showMoreDelivery).map((opt) => (
                    <label
                      key={opt.value}
                      className={`animated-checkbox ${
                        selectedDelivery === opt.value ? "checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDelivery === opt.value}
                        onChange={() =>
                          setSelectedDelivery(
                            selectedDelivery === opt.value ? null : opt.value
                          )
                        }
                      />
                      <span className="custom-check"></span>
                      {opt.label}
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
            </div>
          </div>

          <div className="productGrid">
            <QuickOrderGid filters={filters} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuickOrder;