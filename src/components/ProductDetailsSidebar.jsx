import React, { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const filterData = {
  "Cutting Diameter": ["25 mm (10)", "16 mm (24)", "10 mm (18)"],
  "Shaft Length": ["70 mm (10)", "60 mm (24)", "50 mm (18)"],
  "Model No": [
    "HiKOKI DV13VSS (10)",
    "HiKOKI DV13VSS (24)",
    "HiKOKI DV13VSS (18)",
  ],
  "Bit Length": ["13 mm (10)", "10 mm (24)", "7 mm (18)"],
  Weight: ["1.5 kg (10)", "1 kg (24)", "800 gm (18)"],
  Torque: ["10.5 Nm (10)", "10 Nm (24)", "8 Nm (18)"],
};

// ✅ build default: first option of each category
const defaultSelected = Object.fromEntries(
  Object.entries(filterData).map(([category, options]) => [
    category,
    [options[0]],
  ])
);

const ProductDetailsSidebar = () => {
  const [selectedFilters, setSelectedFilters] = useState(defaultSelected);
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle checkbox
  const toggleFilter = (category, option) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      return current.includes(option)
        ? { ...prev, [category]: current.filter((item) => item !== option) }
        : { ...prev, [category]: [...current, option] };
    });
  };

  // Clear one category
  const clearCategory = (category) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  // Clear all filters
  const clearAll = () => {
    setSelectedFilters({});
    setExpandedSections({});
  };

  // Toggle show more/less
  const toggleExpand = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="LeftSidebar">
      <div className="active-filters">
        {/* Active Filters */}
        {Object.entries(selectedFilters).map(([category, values]) =>
          values.map((val, idx) => (
            <div key={`${category}-${idx}`} className="active-part">
              <label>{category}:</label>
              <div className="active-tag">
                <span>
                  {val}
                  <button onClick={() => toggleFilter(category, val)}>✕</button>
                </span>
              </div>
            </div>
          ))
        )}

        {/* Remove All Filters button */}
        {Object.keys(selectedFilters).length > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>
            Remove All Filters
          </button>
        )}

        {/* Filters Section */}
        <div className="filters">
          {Object.keys(filterData).map((category, idx) => {
            const options = filterData[category];
            const isExpanded = expandedSections[category] || false;
            const visibleOptions = isExpanded ? options : options.slice(0, 2);

            return (
              <div key={idx} className="filter-section">
                <h4>
                  {category}{" "}
                  <button
                    onClick={() => clearCategory(category)}
                    className="clear-btn"
                  >
                    ✕ CLEAR
                  </button>
                </h4>
                <div className="checkbox-group fade-in">
                  {visibleOptions.map((option, i) => (
                    <label
                      key={i}
                      className={`animated-checkbox ${
                        selectedFilters[category]?.includes(option)
                          ? "checked"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedFilters[category]?.includes(option) || false
                        }
                        onChange={() => toggleFilter(category, option)}
                      />
                      <span className="custom-check"></span>
                      {option}
                    </label>
                  ))}
                </div>
                {options.length > 2 && (
                  <button
                    onClick={() => toggleExpand(category)}
                    className="show-more"
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
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSidebar;
