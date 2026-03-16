import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import { FaAngleDown, FaAngleUp, FaFilter } from "react-icons/fa";
import QuickOrderGid from "../components/QuickOrderGrid";

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
  const incomingBrandId = incomingState?.brand_id ? Number(incomingState.brand_id) : null;
  const selectAllBrandsFromState = incomingState?.select_all_brands === true;

  const [selectedCatGIds, setSelectedCatGIds] = useState([]);
  const [selectedChildCatIds, setSelectedChildCatIds] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [search_text, setSearchText] = useState("");
  const [location_id, setLocationId] = useState(null);
  const [inhouse_product, setInhouseProduct] = useState(null);
  const [price_sort, setPriceSort] = useState(null);

  const [allCategoryGroups, setAllCategoryGroups] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // search states
  const [categoryGroupSearch, setCategoryGroupSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // dynamic price range from API
  const [availableMin, setAvailableMin] = useState(1000);
  const [availableMax, setAvailableMax] = useState(7500);

  const min = availableMin;
  const max = availableMax;
  const minValueBetween = 1;

  const [currentMin, setCurrentMin] = useState(1000);
  const [currentMax, setCurrentMax] = useState(7500);
  const [inputMin, setInputMin] = useState(1000);
  const [inputMax, setInputMax] = useState(7500);

  const sliderRef = useRef(null);
  const minValueRef = useRef(null);
  const maxValueRef = useRef(null);
  const hasAppliedSelectAllBrands = useRef(false);

  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderOffset, setSliderOffset] = useState(0);

  const [showMoreCatG, setShowMoreCatG] = useState(5);
  const [showMoreBrands, setShowMoreBrands] = useState(5);
  const [showMoreDelivery, setShowMoreDelivery] = useState(2);

  const CATEGORY_INITIAL_LIMIT = 5;
  const [showMoreCategories, setShowMoreCategories] = useState({});

  const filters = useMemo(
    () => ({
      cat_groups: selectedCatGIds,
      categories: selectedChildCatIds,
      brands: selectedBrands,
      delivery: selectedDelivery,
      search_text,
      min_price: currentMin,
      max_price: currentMax,
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
      currentMin,
      currentMax,
      location_id,
      inhouse_product,
      price_sort,
    ]
  );

  useEffect(() => {
    if (!selectAllBrandsFromState) return;
    if (!allBrands.length) return;
    if (hasAppliedSelectAllBrands.current) return;

    hasAppliedSelectAllBrands.current = true;

    const allBrandIds = [...new Set(allBrands.map((brand) => Number(brand.id)).filter(Boolean))];

    setSelectedCatGIds([]);
    setSelectedChildCatIds([]);
    setSelectedDelivery(null);
    setSearchText("");
    setSelectedBrands(allBrandIds);
  }, [selectAllBrandsFromState, allBrands]);

  useEffect(() => {
    const updateSliderDimensions = () => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        setSliderWidth(rect.width);
        setSliderOffset(rect.left);
      }
    };

    updateSliderDimensions();
    window.addEventListener("resize", updateSliderDimensions);

    return () => {
      window.removeEventListener("resize", updateSliderDimensions);
    };
  }, []);

  useEffect(() => {
    updateSliderWidths();
  }, [currentMin, currentMax, min, max]);

  const updateSliderWidths = () => {
    if (!max || max <= 0) return;

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

  // const getAllBrandsFromAPI = async () => {
  //   try {
  //     setLoading(true);
  //     const apiRes = await getAllBrands(selectedCatGIds, selectedChildCatIds);
  //     const responseData = await apiRes.json();

  //     if (responseData?.res) {
  //       setAllBrands(responseData?.data || []);
  //     } else {
  //       setAllBrands([]);
  //     }
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     setAllBrands([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getAllBrandsFromAPI = async () => {
    try {
      setLoading(true);
      const apiRes = await getAllBrands(selectedCatGIds, selectedChildCatIds);
      const responseData = await apiRes.json();

      if (responseData?.res) {
        const rawBrands = responseData?.data || [];

        const uniqueBrands = rawBrands.filter(
          (brand, index, self) =>
            index === self.findIndex((b) => Number(b.id) === Number(brand.id))
        );

        setAllBrands(uniqueBrands);
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
        (a?.name || "").localeCompare((b?.name || ""), undefined, {
          sensitivity: "base",
        })
      ),
    }));
  }, [allCategoryGroups]);

  const filteredCategoryGroups = useMemo(() => {
    const keyword = categoryGroupSearch.trim().toLowerCase();
    if (!keyword) return groupsWithSortedChildren;

    return groupsWithSortedChildren.filter((group) =>
      (group?.name || "").toLowerCase().includes(keyword)
    );
  }, [groupsWithSortedChildren, categoryGroupSearch]);

  const filteredSelectedGroupsForCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();

    return groupsWithSortedChildren
      .filter((g) => selectedCatGIds.includes(g.id))
      .map((g) => {
        const children = g.child_category || [];

        if (!keyword) {
          return {
            ...g,
            filtered_child_category: children,
          };
        }

        return {
          ...g,
          filtered_child_category: children.filter((child) =>
            (child?.name || "").toLowerCase().includes(keyword)
          ),
        };
      })
      .filter((g) => (g.filtered_child_category || []).length > 0 || !keyword);
  }, [groupsWithSortedChildren, selectedCatGIds, categorySearch]);

  const filteredBrands = useMemo(() => {
    const keyword = brandSearch.trim().toLowerCase();
    if (!keyword) return allBrands;

    return (allBrands || []).filter((brand) =>
      (brand?.name || "").toLowerCase().includes(keyword)
    );
  }, [allBrands, brandSearch]);

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
    setSelectedDelivery(null);
    setSearchText("");
  }, [incomingState, incomingCatGId, incomingCatId, groupsWithSortedChildren]);

  useEffect(() => {
    if (!incomingState) return;
    if (!incomingBrandId) return;
    if (!allBrands.length) return;

    const brandExists = allBrands.some(
      (brand) => Number(brand.id) === Number(incomingBrandId)
    );

    if (brandExists) {
      setSelectedBrands([Number(incomingBrandId)]);
    } else {
      setSelectedBrands([]);
    }
  }, [incomingState, incomingBrandId, allBrands]);

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

  useEffect(() => {
    if (!selectedBrands.length || !allBrands.length) return;

    const firstSelectedBrandId = selectedBrands[0];

    const selectedIndex = allBrands.findIndex(
      (brand) => Number(brand.id) === Number(firstSelectedBrandId)
    );

    if (selectedIndex !== -1 && selectedIndex + 1 > showMoreBrands) {
      setShowMoreBrands(selectedIndex + 1);
    }
  }, [selectedBrands, allBrands, showMoreBrands]);

  useEffect(() => {
    if (!selectedChildCatIds.length || !groupsWithSortedChildren.length) return;

    setShowMoreCategories((prev) => {
      const next = { ...prev };

      groupsWithSortedChildren.forEach((group) => {
        const children = group.child_category || [];
        const selectedIndex = children.findIndex((child) =>
          selectedChildCatIds.includes(Number(child.id))
        );

        if (selectedIndex !== -1) {
          const requiredCount = selectedIndex + 1;
          const currentCount = prev[group.id] || CATEGORY_INITIAL_LIMIT;

          if (requiredCount > currentCount) {
            next[group.id] = requiredCount;
          }
        }
      });

      return next;
    });
  }, [selectedChildCatIds, groupsWithSortedChildren]);

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

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
  };

  const clearBrand = () => {
    setSelectedBrands([]);
    setShowMoreBrands(5);
    setBrandSearch("");
  };

  const clearDelivery = () => setSelectedDelivery(null);

  const clearCatG = () => {
    setSelectedCatGIds([]);
    setSelectedChildCatIds([]);
    setShowMoreCatG(5);
    setShowMoreCategories({});
    setCategoryGroupSearch("");
    setCategorySearch("");
  };

  const clearCategories = () => {
    setSelectedChildCatIds([]);
    setShowMoreCategories({});
    setCategorySearch("");
  };

  const clearPrice = () => {
    setCurrentMin(availableMin);
    setCurrentMax(availableMax);
    setInputMin(availableMin);
    setInputMax(availableMax);
  };

  const toggleCatGs = () => {
    setShowMoreCatG((prev) =>
      prev >= filteredCategoryGroups.length ? 5 : prev + 5
    );
  };

  const toggleBrands = () => {
    setShowMoreBrands((prev) => (prev >= filteredBrands.length ? 5 : prev + 5));
  };

  const toggleDelivery = () => {
    setShowMoreDelivery((prev) =>
      prev >= deliveryOptions.length ? 3 : prev + 3
    );
  };

  const toggleCategoriesForGroup = (groupId, totalChildren) => {
    setShowMoreCategories((prev) => {
      const currentCount = prev[groupId] || CATEGORY_INITIAL_LIMIT;

      return {
        ...prev,
        [groupId]:
          currentCount >= totalChildren
            ? CATEGORY_INITIAL_LIMIT
            : currentCount + CATEGORY_INITIAL_LIMIT,
      };
    });
  };

  const visibleCategoryGroupIds = filteredCategoryGroups.map((g) => g.id);
  const allVisibleCategoryGroupsSelected =
    visibleCategoryGroupIds.length > 0 &&
    visibleCategoryGroupIds.every((id) => selectedCatGIds.includes(id));

  const visibleCategoryIds = filteredSelectedGroupsForCategories.flatMap((g) =>
    (g.filtered_child_category || []).map((child) => child.id)
  );
  const allVisibleCategoriesSelected =
    visibleCategoryIds.length > 0 &&
    visibleCategoryIds.every((id) => selectedChildCatIds.includes(id));

  const visibleBrandIds = filteredBrands.map((brand) => brand.id);
  const allVisibleBrandsSelected =
    visibleBrandIds.length > 0 &&
    visibleBrandIds.every((id) => selectedBrands.includes(id));

  const visibleDeliveryIds = deliveryOptions.map((opt) => opt.value);
  const allVisibleDeliverySelected =
    visibleDeliveryIds.length > 0 &&
    visibleDeliveryIds.every((id) => selectedDelivery === id);

  const handleSelectAllCategoryGroups = () => {
    if (allVisibleCategoryGroupsSelected) {
      setSelectedCatGIds((prev) =>
        prev.filter((id) => !visibleCategoryGroupIds.includes(id))
      );

      const childIdsToRemove = groupsWithSortedChildren
        .filter((g) => visibleCategoryGroupIds.includes(g.id))
        .flatMap((g) => (g.child_category || []).map((c) => c.id));

      setSelectedChildCatIds((prev) =>
        prev.filter((id) => !childIdsToRemove.includes(id))
      );
    } else {
      setSelectedCatGIds((prev) => [...new Set([...prev, ...visibleCategoryGroupIds])]);
    }
  };

  const handleSelectAllCategories = () => {
    if (allVisibleCategoriesSelected) {
      setSelectedChildCatIds((prev) =>
        prev.filter((id) => !visibleCategoryIds.includes(id))
      );
    } else {
      setSelectedChildCatIds((prev) => [...new Set([...prev, ...visibleCategoryIds])]);
    }
  };

  const handleSelectAllBrands = () => {
    if (allVisibleBrandsSelected) {
      setSelectedBrands((prev) => prev.filter((id) => !visibleBrandIds.includes(id)));
    } else {
      setSelectedBrands((prev) => [...new Set([...prev, ...visibleBrandIds])]);
    }
  };

  const handleSelectAllDelivery = () => {
    if (allVisibleDeliverySelected) {
      setSelectedDelivery(null);
    } else if (visibleDeliveryIds.length > 0) {
      setSelectedDelivery(visibleDeliveryIds[0]);
    }
  };

  const handleMinChange = (e) => {
    const val = parseFloat(e.target.value);

    if (Number.isNaN(val)) {
      setInputMin("");
      return;
    }

    setInputMin(val);

    if (val >= min && val <= currentMax - minValueBetween) {
      setCurrentMin(val);
    }
  };

  const handleMaxChange = (e) => {
    const val = parseFloat(e.target.value);

    if (Number.isNaN(val)) {
      setInputMax("");
      return;
    }

    setInputMax(val);

    if (val <= max && val >= currentMin + minValueBetween) {
      setCurrentMax(val);
    }
  };

  const onMinBlur = () => {
    let val = parseFloat(inputMin);

    if (Number.isNaN(val)) val = currentMin;
    if (val < min) val = min;
    if (val > currentMax - minValueBetween) val = currentMax - minValueBetween;

    setInputMin(val);
    setCurrentMin(val);
  };

  const onMaxBlur = () => {
    let val = parseFloat(inputMax);

    if (Number.isNaN(val)) val = currentMax;
    if (val > max) val = max;
    if (val < currentMin + minValueBetween) val = currentMin + minValueBetween;

    setInputMax(val);
    setCurrentMax(val);
  };

  const onMinDrag = (e) => {
    if (!sliderWidth) return;

    const pageX = e.touches ? e.touches[0].clientX : e.clientX;
    let draggedWidth = pageX - sliderOffset;
    if (draggedWidth < 0) draggedWidth = 0;
    if (draggedWidth > sliderWidth) draggedWidth = sliderWidth;

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
    if (!sliderWidth) return;

    const pageX = e.touches ? e.touches[0].clientX : e.clientX;
    let draggedWidth = pageX - sliderOffset;
    if (draggedWidth < 0) draggedWidth = 0;
    if (draggedWidth > sliderWidth) draggedWidth = sliderWidth;

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

  const maxForMin = () => currentMax - minValueBetween;
  const minForMax = () => currentMin + minValueBetween;

  const handlePriceRangeUpdate = (range) => {
    const nextMin = Math.floor(Number(range?.min ?? 0));
    const nextMax = Math.ceil(Number(range?.max ?? 0));

    if (!nextMin && !nextMax) return;
    if (nextMax < nextMin) return;

    setAvailableMin((prev) => (prev !== nextMin ? nextMin : prev));
    setAvailableMax((prev) => (prev !== nextMax ? nextMax : prev));

    setCurrentMin((prev) => {
      if (prev < nextMin) return nextMin;
      if (prev > nextMax) return nextMin;
      return prev;
    });

    setCurrentMax((prev) => {
      if (prev > nextMax) return nextMax;
      if (prev < nextMin) return nextMax;
      return prev;
    });

    setInputMin((prev) => {
      const p = Number(prev);
      if (Number.isNaN(p)) return nextMin;
      if (p < nextMin) return nextMin;
      if (p > nextMax) return nextMin;
      return p;
    });

    setInputMax((prev) => {
      const p = Number(prev);
      if (Number.isNaN(p)) return nextMax;
      if (p > nextMax) return nextMax;
      if (p < nextMin) return nextMax;
      return p;
    });
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
              {/* Category Group */}
              <div className="filter-section">
                <h4>
                  Category Group{" "}
                  <button onClick={clearCatG} className="clear-btn" type="button">
                    ✕ CLEAR
                  </button>
                </h4>

                <input
                  type="text"
                  placeholder="Search category group..."
                  value={categoryGroupSearch}
                  onChange={(e) => {
                    setCategoryGroupSearch(e.target.value);
                    setShowMoreCatG(5);
                  }}
                  className="filter-search-input"
                />

                <label
                  className={`animated-checkbox ${
                    allVisibleCategoryGroupsSelected ? "checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allVisibleCategoryGroupsSelected}
                    onChange={handleSelectAllCategoryGroups}
                  />
                  <span className="custom-check" />
                  Select All
                </label>

                <div className="checkbox-group brand-group fade-in">
                  {filteredCategoryGroups.slice(0, showMoreCatG).map((catG) => {
                    const isGroupSelected = selectedCatGIds.includes(catG.id);

                    return (
                      <label
                        key={catG.id}
                        className={`animated-checkbox ${isGroupSelected ? "checked" : ""}`}
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

                  {filteredCategoryGroups.length === 0 && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      No category group found.
                    </div>
                  )}
                </div>

                {filteredCategoryGroups.length > 5 && (
                  <button onClick={toggleCatGs} className="show-more" type="button">
                    {showMoreCatG >= filteredCategoryGroups.length ? (
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

              {/* Categories */}
              <div className="filter-section">
                <h4>
                  Categories{" "}
                  <button onClick={clearCategories} className="clear-btn" type="button">
                    ✕ CLEAR
                  </button>
                </h4>

                {selectedCatGIds.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Select a Category Group to see categories.
                  </div>
                ) : (
                  <div className="fade-in">
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="filter-search-input"
                      style={{ marginBottom: 10 }}
                    />

                    <label
                      className={`animated-checkbox ${
                        allVisibleCategoriesSelected ? "checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={allVisibleCategoriesSelected}
                        onChange={handleSelectAllCategories}
                      />
                      <span className="custom-check" />
                      Select All
                    </label>

                    {filteredSelectedGroupsForCategories.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        No category found.
                      </div>
                    ) : (
                      filteredSelectedGroupsForCategories.map((g) => {
                        const children = g.filtered_child_category || [];
                        if (children.length === 0) return null;

                        const isSearching = categorySearch.trim() !== "";
                        const visibleCount =
                          showMoreCategories[g.id] || CATEGORY_INITIAL_LIMIT;

                        const visibleChildren = isSearching
                          ? children
                          : children.slice(0, visibleCount);

                        const canToggle =
                          !isSearching && children.length > CATEGORY_INITIAL_LIMIT;

                        const isExpanded = visibleCount >= children.length;

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
                              {visibleChildren.map((child) => {
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

                            {canToggle && (
                              <button
                                onClick={() =>
                                  toggleCategoriesForGroup(g.id, children.length)
                                }
                                className="show-more"
                                type="button"
                              >
                                {isExpanded ? (
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
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Brands */}
              <div className="filter-section">
                <h4>
                  Brands{" "}
                  <button onClick={clearBrand} className="clear-btn" type="button">
                    ✕ CLEAR
                  </button>
                </h4>

                <input
                  type="text"
                  placeholder="Search brand..."
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setShowMoreBrands(5);
                  }}
                  className="filter-search-input"
                />

                <label
                  className={`animated-checkbox ${
                    allVisibleBrandsSelected ? "checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allVisibleBrandsSelected}
                    onChange={handleSelectAllBrands}
                  />
                  <span className="custom-check" />
                  Select All
                </label>

                <div className="checkbox-group brand-group fade-in">
                  {filteredBrands.slice(0, showMoreBrands).map((brand) => (
                    <label
                      key={`brand-${brand.id}`}
                      className={`animated-checkbox ${
                        selectedBrands.includes(brand.id) ? "checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                      />
                      <span className="custom-check" />
                      {brand.name}
                    </label>
                  ))}

                  {filteredBrands.length === 0 && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      No brand found.
                    </div>
                  )}
                </div>

                {filteredBrands.length > 5 && (
                  <button onClick={toggleBrands} className="show-more" type="button">
                    {showMoreBrands >= filteredBrands.length ? (
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

              {/* Delivery */}
              <div className="filter-section">
                <h4>
                  Delivery Option{" "}
                  <button onClick={clearDelivery} className="clear-btn" type="button">
                    ✕ CLEAR
                  </button>
                </h4>

                <label
                  className={`animated-checkbox ${
                    allVisibleDeliverySelected ? "checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allVisibleDeliverySelected}
                    onChange={handleSelectAllDelivery}
                  />
                  <span className="custom-check" />
                  Select All
                </label>

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
                      <span className="custom-check" />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <button onClick={toggleDelivery} className="show-more" type="button">
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
                  <button onClick={clearPrice} className="clear-btn" type="button">
                    ✕ CLEAR
                  </button>
                </h4>

                <div className="PriceRange">
                  <div
                    className="current-value"
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                        Min
                      </label>
                      <input
                        type="number"
                        value={inputMin}
                        min={min}
                        max={maxForMin()}
                        onChange={handleMinChange}
                        onBlur={onMinBlur}
                        className="filter-search-input"
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                        Max
                      </label>
                      <input
                        type="number"
                        value={inputMax}
                        min={minForMax()}
                        max={max}
                        onChange={handleMaxChange}
                        onBlur={onMaxBlur}
                        className="filter-search-input"
                      />
                    </div>
                  </div>

                  <div
                    className="values"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div>₹{min}</div>
                    <div>₹{max}</div>
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

                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    ₹{currentMin} - ₹{currentMax}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="productGrid">
            <QuickOrderGid
              filters={filters}
              onPriceRangeUpdate={handlePriceRangeUpdate}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuickOrder;