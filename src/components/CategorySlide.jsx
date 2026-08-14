import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getAllCategoryGroups } from "../api/apiRequest";
import quickButton from "../assets/icons/QuickButton.svg";
import searchIcon from "../assets/icons/SearchIcon.svg";
import noImage from "../assets/images/no-image.png";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import "../styles/CategorySlide.css";

const CategorySlide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const childListRef = useRef(null);

  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentHeight, setParentHeight] = useState("auto");
  const [childSearchText, setChildSearchText] = useState("");
  const [expandedChild, setExpandedChild] = useState(null);

  const isQuickOrderPage = location.pathname === "/quick-order";

  useEffect(() => {
    const getCategory = async () => {
      try {
        const response = await getAllCategoryGroups();
        const result = await response.json();

        if (!response.ok || result?.res === false) {
          throw new Error(result?.msg || "Unable to load category groups");
        }

        setCategory(Array.isArray(result?.data) ? result.data : []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getCategory();
  }, []);

  useEffect(() => {
    if (category.length > 0 && selectedParent === null) {
      setSelectedParent(category[0].id);
    }
  }, [category, selectedParent]);

  useEffect(() => {
    const search = searchText.toLowerCase().trim();

    if (!search) {
      if (category.length > 0) {
        setSelectedParent(category[0].id);
      }
      return;
    }

    const matchingParent = category.find((item) => {
      const parentMatches = item.name?.toLowerCase().includes(search);
      const childMatches = (item.child_category || []).some((child) =>
        child.name?.toLowerCase().includes(search),
      );

      return parentMatches || childMatches;
    });

    if (matchingParent) {
      setSelectedParent(matchingParent.id);
    }
  }, [searchText, category]);

  const selectedCategory = category.find(
    (item) => item.id === selectedParent,
  );

  useEffect(() => {
    if (!childListRef.current) return undefined;

    const updateParentHeight = () => {
      setParentHeight(childListRef.current.scrollHeight);
    };

    updateParentHeight();
    window.addEventListener("resize", updateParentHeight);

    return () => {
      window.removeEventListener("resize", updateParentHeight);
    };
  }, [selectedCategory]);

  useEffect(() => {
    setChildSearchText("");
  }, [selectedParent]);

  const normalizedSearch = searchText.toLowerCase().trim();
  const filteredCategories = category
    .map((item) => {
      if (!normalizedSearch) return item;

      const parentMatches = item.name
        ?.toLowerCase()
        .includes(normalizedSearch);
      const matchingChildren = (item.child_category || []).filter((child) =>
        child.name?.toLowerCase().includes(normalizedSearch),
      );

      if (!parentMatches && matchingChildren.length === 0) return null;

      return {
        ...item,
        child_category: parentMatches
          ? item.child_category
          : matchingChildren,
      };
    })
    .filter(Boolean);

  const normalizedChildSearch = childSearchText.toLowerCase().trim();
  const filteredChildren = (selectedCategory?.child_category || []).filter(
    (child) => child.name?.toLowerCase().includes(normalizedChildSearch),
  );

  if (loading) {
    return <h3 className="loader">Loading......</h3>;
  }

  return (
    <>
      <Header />

      <div className="category-container">
        <div className="parent-list" style={{ height: parentHeight }}>
          {filteredCategories.map((item) => (
            <div
              key={item.id}
              className={`parent-category ${
                selectedParent === item.id ? "selected" : ""
              }`}
              onClick={() => setSelectedParent(item.id)}
            >
              <div className="category-info">
                <img
                  src={item.photo || noImage}
                  alt={item.name}
                  className="category-image"
                  onError={(event) => {
                    event.currentTarget.src = noImage;
                  }}
                />
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="child-list" ref={childListRef}>
          <div className="child-content">
            <div className="child-header">
              <h2>{selectedCategory?.name}</h2>
            </div>

            <Link
              to="/quick-order"
              className="category-slide-view-btn"
              state={{ cat_g_id: selectedCategory?.id }}
            >
              View All Products
            </Link>

            <div className="child-search-box">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder={`Search ${
                    selectedCategory?.name || "category"
                  }...`}
                  value={childSearchText}
                  onChange={(event) => setChildSearchText(event.target.value)}
                />
                <img
                  src={searchIcon}
                  alt="SearchIcon"
                  className="search-icon"
                />
              </div>
            </div>
          </div>

          {filteredChildren.length > 0 ? (
            <div className="child-cards">
              {filteredChildren.map((child) => (
                <div
                  key={child.id}
                  className="child-item"
                  onClick={() => {
                    navigate("/quick-order", {
                      state: {
                        cat_g_id: selectedCategory.id,
                        cat_id: child.id,
                      },
                    });
                  }}
                >
                  <img
                    src={child.photo || noImage}
                    alt={child.name}
                    className="child-image"
                    onError={(event) => {
                      event.currentTarget.src = noImage;
                    }}
                  />

                  <span
                    className={`child-name ${
                      expandedChild === child.id ? "expanded" : ""
                    }`}
                    onClick={() => {
                      setExpandedChild(
                        expandedChild === child.id ? null : child.id,
                      );
                    }}
                  >
                    {child.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-children">
              <p>No Product Category is available...</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <div className="floating-buttons">
        {!isQuickOrderPage && (
          <Link to="/quick-order" className="quick-order-btn">
            <img src={quickButton} alt="Quick Order" />
          </Link>
        )}
      </div>
    </>
  );
};

export default CategorySlide;
