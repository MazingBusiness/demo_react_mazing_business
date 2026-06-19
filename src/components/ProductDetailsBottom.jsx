import React, { useEffect, useState } from "react";
import ProductDetailsGrid from "./ProductDetailsGrid";
import ProductDetailsSidebar from "./ProductDetailsSidebar";
import { getVariationProductBySelectedValues } from "../api/apiRequest";

const ProductDetailsBottom = ({
  product,
  productVariations = [],
  selectedVariationValues = {},
  allVarientProducts = [],
}) => {
  const hasVariations = productVariations.length > 0;
  const [filteredProducts, setFilteredProducts] = useState(allVarientProducts);
  const [loadingVariationProducts, setLoadingVariationProducts] = useState(false);
  const [variationProductError, setVariationProductError] = useState("");

  useEffect(() => {
    setFilteredProducts(allVarientProducts);
    setVariationProductError("");
  }, [allVarientProducts]);

  const handleVariationFilterChange = async (nextSelectedValues) => {
    const selectedValues = Object.values(nextSelectedValues || {}).filter(Boolean);
    const variationParentPartNo =
      product?.variation_parent_part_no || product?.part_no || "";

    if (!selectedValues.length || !variationParentPartNo) {
      setFilteredProducts(allVarientProducts);
      return;
    }

    setLoadingVariationProducts(true);
    setVariationProductError("");
    setFilteredProducts([]);

    try {
      const response = await getVariationProductBySelectedValues({
        selected_values: selectedValues,
        variation_parent_part_no: variationParentPartNo,
      });

      const products = Array.isArray(response?.product_details)
        ? response.product_details
        : [];

      setFilteredProducts(products);
    } catch (error) {
      console.error("Variation product fetch error:", error);
      setVariationProductError(
        error?.message || "Failed to load variation products."
      );
      setFilteredProducts([]);
    } finally {
      setLoadingVariationProducts(false);
    }
  };

  return (
    <div className={`ProductDetailsBottomwrapper ${!hasVariations ? "without-sidebar" : ""}`}>
      {hasVariations && (
        <div className="sidebarFilters">
          <ProductDetailsSidebar
            product={product}
            productVariations={productVariations}
            selectedVariationValues={selectedVariationValues}
            allVarientProducts={allVarientProducts}
            onVariationFilterChange={handleVariationFilterChange}
          />
        </div>
      )}
      <div className="productGrid">
        <ProductDetailsGrid
          allVarientProducts={filteredProducts}
          loading={loadingVariationProducts}
          error={variationProductError}
        />
      </div>
    </div>
  );
};

export default ProductDetailsBottom;
