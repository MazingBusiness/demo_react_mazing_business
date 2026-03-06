import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { getMegaMenu } from "../api/apiRequest";
import no_image from "../assets/images/no-image.png";

// Dynamic image imports
const imageImports = import.meta.glob("../assets/icons/*", {
  eager: true,
  import: "default",
});
const bannerImports = import.meta.glob("../assets/images/*", {
  eager: true,
  import: "default",
});

const getItemImage = (filename) => imageImports[`../assets/icons/${filename}`];
const getBannerImage = (filename) =>
  bannerImports[`../assets/images/${filename}`];

const chunkArray = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const MegaMenu = ({ setShowMegaMenu }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuCategories, setMenuCategories] = useState([]);
  const location = useLocation();

  const allMenuItems = async () => {
    try {
      const apiRes = await getMegaMenu();
      const responseData = await apiRes.json();

      if (responseData?.res) {
        const transformedData = (responseData.data || []).map((categoryGroup) => {
          const categoryGroupId = categoryGroup.id;
          const childCategories = categoryGroup.category || [];

          const items = childCategories.map((child) => ({
            cat_g_id: categoryGroupId, // ✅ correct group id
            cat_id: child.id,          // ✅ correct category id
            name: child.name,
            img: child.cat_image_url || no_image,
            slug: child.slug,
          }));

          return {
            id: categoryGroupId,
            title: categoryGroup.short_name,
            icon: categoryGroup.icon || no_image,
            banner: categoryGroup.photo || no_image,
            slug: categoryGroup.slug || "/",
            items,
          };
        });

        setMenuCategories(transformedData);
      } else {
        console.error(responseData?.msg || "Something went wrong");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    allMenuItems();
  }, []);

  const items = menuCategories[activeIndex]?.items || [];

  const columnCount = 4;
  const itemsPerColumn = Math.ceil(items.length / columnCount) || 1;
  const columns = chunkArray(items, itemsPerColumn);

  return (
    <div className="maincontainer">
      <div className="mega-menu">
        {/* Top Tabs */}
        <div className="menu-tabs-top">
          {menuCategories.slice(0, 6).map((cat, idx) => (
            <button
              key={cat.id || idx}
              className={`menu-tab ${activeIndex === idx ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
            >
              <span className="IconBox">
                <img src={cat.icon} alt={cat.title} />
              </span>

              <span>{cat.title}</span>
              {activeIndex === idx && <span className="arrow arrow-bottom" />}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="menu-body">
          <div className="menu-items">
            <div className="menu-items-scroll">
              {columns.map((col, colIdx) => (
                <div className="menu-column" key={colIdx}>
                  {col.map((item) => (
                    <Link
                      key={`${item.cat_g_id}-${item.cat_id}`}
                      to="/quick-order"
                      state={{
                        cat_id: item.cat_id,
                        cat_g_id: item.cat_g_id,
                      }}
                      onClick={() => setShowMegaMenu(false)}
                    >
                      <div className="menu-item">
                        <span className="menu-item-img">
                          <img src={item.img} alt={item.name} />
                        </span>
                        <span>{item.name}</span>
                        {item.isNew && <span className="badge-new">New</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="menu-image">
            <img
              src={menuCategories[activeIndex]?.banner || no_image}
              alt="Category Banner"
            />
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="menu-tabs-bottom">
          {menuCategories.slice(6).map((cat, idx) => (
            <button
              key={cat.id || idx + 6}
              className={`menu-tab ${activeIndex === idx + 6 ? "active" : ""}`}
              onClick={() => setActiveIndex(idx + 6)}
            >
              <span className="IconBox">
                <img src={cat.icon} alt={cat.title} />
              </span>
              <span>{cat.title}</span>
              {activeIndex === idx + 6 && <span className="arrow arrow-top" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;