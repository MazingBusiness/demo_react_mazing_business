import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import no_image from "../assets/images/no-image.png";
import { getQuickOrderProduct } from "../api/apiRequest";
// import { getBetaQuickOrderProduct } from "../api/apiRequest";
import { getLoggedInUser } from "../utils/authUtils";

/**
 * SearchModal.jsx
 * - Dynamic API search as user types (debounced)
 * - Infinite scroll inside modal list (IntersectionObserver)
 * - Clickable items → navigates to Product Details page
 *
 * Notes:
 * 1) Update PRODUCT_DETAILS_PATH if your route is different.
 *    Common options:
 *      - `/product/${slug}`  (slug)
 *      - `/product-details/${id}` (id)
 *      - `/product/${id}` (id)
 *
 * 2) Uses same getQuickOrderProduct signature as QuickOrderGrid:
 *    getQuickOrderProduct(cat_groups, categories, brands, search_text, min_price, max_price, location_id, inhouse_product, price_sort, delivery, page)
 */

const productsPerPage = 16;
const minimumSearchLength = 3;

// ✅ Change this if your product detail route differs
const PRODUCT_DETAILS_PATH = (p) => {
  // If your API provides slug, prefer it:
  if (p?.slug) return `/product-details/${encodeURIComponent(p.slug)}`;
  // fallback:
  return `/product-details/${encodeURIComponent(p.id || "")}`;
};

const SearchModal = ({
  searchText,
  onChange,
  onClear,
  onClose,

  /**
   * Optional: pass filters from parent if you want the search
   * to respect current filters (cat/brand/location/etc.).
   * If not passed, it will still work with only searchText.
   */
  filters = {},
  anchorRect = null,
}) => {
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const [items, setItems] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [debouncing, setDebouncing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [apiError, setApiError] = useState("");

  // list scroll + observer
  const listRef = useRef(null);
  const loaderRef = useRef(null);
  const observerRef = useRef(null);

  // debounce timer
  const debounceRef = useRef(null);
  const requestSequenceRef = useRef(0);

  const price_sort = useMemo(() => "popularity", []); // keep consistent
  const modalStyle = useMemo(() => {
    if (!anchorRect) return undefined;

    const gap = 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const sidePadding = 12;
    const width = Math.min(anchorRect.width, viewportWidth - sidePadding * 2);
    const left = Math.min(
      Math.max(anchorRect.left, sidePadding),
      Math.max(sidePadding, viewportWidth - width - sidePadding)
    );

    return {
      position: "fixed",
      top: `${anchorRect.top + gap}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxWidth: "none",
    };
  }, [anchorRect]);

  const buildTransformed = (productList = []) => {
    return productList.map((item) => {
      const rating = item.rating && item.rating !== 0 ? item.rating : 4;

      return {
        id: item.id,
        slug: item.slug, // if available in API
        name: item.name,
        img: item.thumb_img?.file_name || no_image,

        mrp: item.mrp ?? 0,
        discount_price: item.discount_price ?? 0,

        // show/hide price like QuickOrderGrid
        user_id: user?.id || null,

        rating,
        reviews: item.reviews,
        category_group: item.category_group?.name,
        category: item.category?.name,

        raw: item,
      };
    });
  };

  const fetchProducts = async (search, reqPage = 1) => {
    // Prevent API calls until the user has typed at least 4 characters.
    const q = String(search || "").trim();
    if (q.length < minimumSearchLength) {
      setItems([]);
      setCategorySuggestions([]);
      setBrandSuggestions([]);
      setTotalRecord(0);
      setPage(1);
      setHasMore(false);
      setApiError("");
      return;
    }

    const requestId = ++requestSequenceRef.current;

    try {
      setApiError("");
      setLoading(true);

      const apiRes = await getQuickOrderProduct(
        filters.cat_groups,
        filters.categories,
        filters.brands,
        filters.m_coin_rates, // ✅ 4th param
        q,                    // ✅ 5th param search_text
        filters.min_price,
        filters.max_price,
        filters.location_id,
        filters.inhouse_product,
        price_sort,
        filters.delivery,
        reqPage
      );

      const responseData = await apiRes.json();

      if (requestId !== requestSequenceRef.current) {
        return;
      }

      if (!responseData?.res) {
        setApiError(responseData?.message || "Something went wrong.");
        return;
      }

      const productList = responseData.data?.data || [];
      const total = responseData.data?.total || 0;
      const nextCategorySuggestions =
        responseData.catehory_suggestion ||
        responseData.category_suggestion ||
        [];
      const nextBrandSuggestions = responseData.brand_suggestion || [];

      setTotalRecord(total);
      if (reqPage === 1) {
        setCategorySuggestions(
          Array.isArray(nextCategorySuggestions) ? nextCategorySuggestions : []
        );
        setBrandSuggestions(
          Array.isArray(nextBrandSuggestions) ? nextBrandSuggestions : []
        );
      }

      const transformed = buildTransformed(productList);

      setItems((prev) => (reqPage === 1 ? transformed : [...prev, ...transformed]));

      const computedTotalPages = Math.ceil(total / productsPerPage) || 1;
      setHasMore(reqPage < computedTotalPages);
    } catch (e) {
      if (requestId !== requestSequenceRef.current) {
        return;
      }

      console.error(e);
      setApiError("Failed to load products. Please try again.");
    } finally {
      if (requestId === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  };

  // ✅ Debounced API call on typing
  useEffect(() => {
    const q = String(searchText || "").trim();
    requestSequenceRef.current += 1;

    // reset pagination for new query
    setPage(1);
    setHasMore(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < minimumSearchLength) {
      setItems([]);
      setCategorySuggestions([]);
      setBrandSuggestions([]);
      setTotalRecord(0);
      setHasMore(false);
      setApiError("");
      setDebouncing(false);
      setLoading(false);
      return;
    }

    setDebouncing(true);

    debounceRef.current = setTimeout(() => {
      setDebouncing(false);
      fetchProducts(q, 1);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchText,
    filters.cat_groups,
    filters.categories,
    filters.brands,
    filters.min_price,
    filters.max_price,
    filters.location_id,
    filters.inhouse_product,
    filters.delivery,
  ]);

  // ✅ Load next page when `page` increments (but not for page=1 which is handled above)
  useEffect(() => {
    if (
      page <= 1 ||
      String(searchText || "").trim().length < minimumSearchLength
    ) {
      return;
    }

    fetchProducts(searchText, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ✅ Infinite scroll INSIDE modal list
  useEffect(() => {
    if (!loaderRef.current) return;

    // clean old observer
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      {
        root: listRef.current || null, // important: observe inside scroll container
        rootMargin: "150px",
        threshold: 0.1,
      }
    );

    observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading]);

  const highlightText = (text) => {
    const q = String(searchText || "").trim().toLowerCase();
    if (!q) return text;

    // highlight by splitting on space (simple but works)
    return String(text)
      .split(" ")
      .map((word, i) => {
        const lw = word.toLowerCase();
        const idx = lw.indexOf(q);
        if (idx === -1) return <span key={i}>{word} </span>;

        const end = idx + q.length;
        return (
          <span key={i}>
            {word.slice(0, idx)}
            <span className="highlight">{word.slice(idx, end)}</span>
            {word.slice(end)}{" "}
          </span>
        );
      });
  };

  const onItemClick = (p) => {
    // close modal first (optional)
    onClose?.();
    // navigate to product details
    navigate(PRODUCT_DETAILS_PATH(p));
  };

  const onCategorySuggestionClick = (category) => {
    onClose?.();
    navigate("/quick-order", {
      state: {
        cat_g_id:
          category?.category_group_id ||
          category?.group_id ||
          category?.category_group?.id,
        cat_id: category?.id,
      },
    });
  };

  const onBrandSuggestionClick = (brand) => {
    onClose?.();
    navigate("/quick-order", {
      state: {
        brand_id: brand?.id,
      },
    });
  };

  return (
    <div
      className="search-modal-backdrop"
      onClick={() => {
        // click outside closes
        onClear?.();
        onClose?.();
      }}
    >
      <div
        className="search-modal"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()} // prevent backdrop close when clicking inside
      >
        {/* Search Input */}
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for products"
            value={searchText}
            onChange={onChange}
            autoFocus
          />
          <button
            className="close-btn"
            onClick={() => {
              onClear?.();
              onClose?.();
            }}
            aria-label="Close search"
            type="button"
          >
            <FiX />
          </button>
        </div>

        {/* Results */}
        {String(searchText || "").trim() !== "" && (
          <div className="results-wrapper">
            {String(searchText || "").trim().length < minimumSearchLength ? (
              <div className="no-results">
                Type at least {minimumSearchLength} characters to search
              </div>
            ) : apiError ? (
              <div className="no-results">{apiError}</div>
            ) : (debouncing || loading) && page === 1 ? (
              <div className="search-loading" role="status" aria-live="polite">
                <span className="search-loading-spinner" aria-hidden="true" />
                <span>Searching...</span>
              </div>
            ) : (
              <>
                <h2>
                  {loading && page === 1
                    ? "Searching…"
                    : `Found ${totalRecord} Products`}
                </h2>

                <div className="results-container" ref={listRef}>
                  {categorySuggestions.length > 0 && (
                    <div className="suggestion-section">
                      <div className="suggestion-heading">CATEGORY SUGGESTIONS</div>
                      {categorySuggestions.map((category) => (
                        <button
                          key={`category-${category.id}`}
                          type="button"
                          className="suggestion-item"
                          onClick={() => onCategorySuggestionClick(category)}
                        >
                          {highlightText(category.name)}
                        </button>
                      ))}
                    </div>
                  )}

                  {brandSuggestions.length > 0 && (
                    <div className="suggestion-section">
                      <div className="suggestion-heading">BRAND SUGGESTIONS</div>
                      {brandSuggestions.map((brand) => (
                        <button
                          key={`brand-${brand.id}`}
                          type="button"
                          className="suggestion-item"
                          onClick={() => onBrandSuggestionClick(brand)}
                        >
                          {highlightText(brand.name)}
                        </button>
                      ))}
                    </div>
                  )}

                  {items.length > 0 ? (
                    <>
                      {items.map((product) => (
                        <button
                          type="button"
                          className="result-item"
                          key={product.id}
                          onClick={() => onItemClick(product)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            background: "#ffffff",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={product.img}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = no_image;
                            }}
                          />

                          <div className="result-item-product-info">
                            <div className="product-info-lft">
                              <p>{highlightText(product.name)}</p>

                              {/* Price rules similar to your grid */}
                              {product.user_id != null ? (
                                <p className="price">
                                  <del>
                                    ₹{Number(product.mrp || 0).toFixed(2)}
                                  </del>{" "}
                                  <span className="discount">
                                    ₹{Number(product.discount_price || 0).toFixed(2)}
                                  </span>
                                </p>
                              ) : (
                                <p className="price">
                                  <span className="discount">
                                    Register to check prices
                                  </span>
                                </p>
                              )}
                            </div>

                            <span className="arrow-btn" aria-hidden="true">
                              <FiChevronRight />
                            </span>
                          </div>
                        </button>
                      ))}

                      {/* Infinite loader sentinel */}
                      <div ref={loaderRef} style={{ height: 1 }} />

                      {loading && (
                        <div className="no-results" style={{ padding: "10px 0" }}>
                          Loading…
                        </div>
                      )}

                      {!hasMore && !loading && items.length > 0 && (
                        <div className="no-results" style={{ padding: "10px 0" }}>
                          You reached the end.
                        </div>
                      )}
                    </>
                  ) : (
                    !loading && <div className="no-results">No products found</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
