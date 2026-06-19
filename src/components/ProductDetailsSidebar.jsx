import React, { useEffect, useMemo, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const parseVariationIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (value == null || value === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch (e) {
    return String(value)
      .replace(/[\[\]\s]/g, "")
      .split(",")
      .filter(Boolean);
  }
};

const ProductDetailsSidebar = ({
  product,
  productVariations = [],
  selectedVariationValues = {},
  allVarientProducts = [],
  onVariationFilterChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [pendingSelection, setPendingSelection] = useState(null);

  useEffect(() => {
    setPendingSelection(null);
  }, [product?.id]);

  const currentSelectedValues = useMemo(() => {
    return pendingSelection || {};
  }, [pendingSelection]);

  const variantProducts = useMemo(() => {
    const currentProduct = product
      ? [{ ...product, variations: product?.variations || Object.values(selectedVariationValues) }]
      : [];

    return [...currentProduct, ...allVarientProducts].filter((item) => item?.slug);
  }, [allVarientProducts, product, selectedVariationValues]);

  const isOptionAvailable = (attributeId, valueId) => {
    return variantProducts.some((item) =>
      parseVariationIds(item?.variations || item?.attributes).includes(String(valueId))
    );
  };

  const handleVariationChange = (event, attributeId, valueId) => {
    event.stopPropagation();

    const nextSelectedValues = {
      ...currentSelectedValues,
      [String(attributeId)]: String(valueId),
    };

    setPendingSelection(nextSelectedValues);
    onVariationFilterChange?.(nextSelectedValues);
  };

  const toggleExpand = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!productVariations.length) {
    return null;
  }

  return (
    <div
      className="LeftSidebar product-variations-sidebar"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="active-filters">
        <div className="filters">
          {productVariations.map((variation) => {
            const attributeId = String(variation?.attribute_id);
            const options = Object.entries(variation?.values || {});
            const isExpanded = expandedSections[attributeId] || false;
            const selectedValueId = currentSelectedValues[attributeId];
            const selectedOption = options.find(
              ([valueId]) => String(valueId) === String(selectedValueId)
            );
            const visibleOptions = isExpanded
              ? options
              : selectedOption && !options.slice(0, 6).some(([valueId]) => String(valueId) === String(selectedValueId))
                ? [selectedOption, ...options.slice(0, 6)]
                : options.slice(0, 6);

            return (
              <div key={attributeId} className="filter-section product-variation-section">
                <h4>{variation?.attribute_name || "Variation"}</h4>

                <div className="checkbox-group fade-in">
                  {visibleOptions.map(([valueId, label]) => {
                    const isSelected =
                      currentSelectedValues[attributeId] === String(valueId);
                    const isAvailable = isOptionAvailable(attributeId, valueId);

                    return (
                      <label
                        key={valueId}
                        className={`animated-checkbox product-variation-option ${
                          isSelected ? "checked" : ""
                        } ${!isAvailable ? "disabled" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`variation-${attributeId}`}
                          checked={isSelected}
                          disabled={!isAvailable}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            handleVariationChange(event, attributeId, valueId)
                          }
                        />
                        <span className="custom-check"></span>
                        {label}
                      </label>
                    );
                  })}
                </div>

                {options.length > 6 && (
                  <button
                    onClick={() => toggleExpand(attributeId)}
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
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSidebar;
