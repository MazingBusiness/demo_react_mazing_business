import React, { useEffect, useState } from "react";
import { getMostOrderCategoryProducts } from "../api/apiRequest";
import { getLoggedInUser } from "../utils/authUtils";
import RelatedProductsSlider from "./RelatedProductsSlider";

const SimilerCategoryProducts = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      if (!getLoggedInUser()?.id || !categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await getMostOrderCategoryProducts(categoryId);
        const payload = await response.json();

        if (!response.ok || payload?.res === false) {
          throw new Error(
            payload?.msg || "Failed to load similar category products"
          );
        }

        const items = Array.isArray(payload?.data) ? payload.data : [];

        if (!ignore) {
          setProducts(items);
        }
      } catch (error) {
        console.error("Similar category products fetch error:", error);

        if (!ignore) {
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [categoryId]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="detalisSliderPart product-similar-category-products">
      <RelatedProductsSlider
        products={products}
        title="Similar Category Products"
        enableAddToCart
      />
    </div>
  );
};

export default SimilerCategoryProducts;
