import React from "react";
import ProductDetailsGrid from "./ProductDetailsGrid";
import ProductDetailsSidebar from "./ProductDetailsSidebar";

const ProductDetailsBottom = () => {
  return (
    <div className="ProductDetailsBottomwrapper">
      {/* <div className="sidebarFilters">
        <ProductDetailsSidebar />
      </div> */}
      <div className="productGrid">
        <ProductDetailsGrid />
      </div>
    </div>
  );
};

export default ProductDetailsBottom;
