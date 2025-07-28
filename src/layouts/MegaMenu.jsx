import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Link, useLocation  } from "react-router-dom";

import {getMegaMenu} from "../api/apiRequest";
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

// const MegaMenu = () => {
const MegaMenu = ({ setShowMegaMenu }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuCategories, setMenuCategories] = useState([]);
  // const [showMegaMenu, setShowMegaMenu] = useState(false);

  const location = useLocation();
  
  const allMenuItems = async () => {
    try {
      const apiRes = await getMegaMenu( );
      const responseData = await apiRes.json();      
      if (responseData.res) {
        const transformedData = responseData.data.map((categoryGroup) => {
          const childCategories  = categoryGroup.category || [];
          const items = childCategories.map((child) => ({
            cat_id: child.id,
            name: child.name,
            img: child.cat_image_url || no_image,
            slug: child.slug
          }));
          return {
            title: categoryGroup.short_name,
            icon: categoryGroup.icon || no_image,
            banner: categoryGroup.photo || no_image,
            slug: categoryGroup.slug ? categoryGroup.slug : "/",
            items: items,
          };
        });
        setMenuCategories(transformedData);
      } else {
        NotificationManager.error(responseData.msg || "Something went wrong", "", 2000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      NotificationManager.error("Failed to load offers", "", 2000);
    }
  };

  useEffect(() => {
    allMenuItems();
  }, []);

  
  const items = menuCategories[activeIndex]?.items || [];

  // Split items into 4 columns
  const columnCount = 4;
  const itemsPerColumn = Math.ceil(items.length / columnCount);
  const columns = chunkArray(items, itemsPerColumn);

  return (
    <div className="maincontainer">
      <div className="mega-menu" >
        {/* Top Tabs */}
        <div className="menu-tabs-top">
          {menuCategories.slice(0, 6).map((cat, idx) => (
            <button
              key={idx}
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
            {columns.map((col, colIdx) => (
              <div className="menu-column" key={colIdx}>
                {col.map((item, idx) => (
                  // <Link to="/product-listing" state={{ slug: item.slug, cat_id: item.cat_id }} onClick={() => setShowMegaMenu(false)}>
                    <Link
                      key={item.cat_id} // ✅ this is the unique key
                      to="/product-listing"
                      state={{ slug: item.slug, cat_id: item.cat_id }}
                      onClick={() => setShowMegaMenu(false)}
                    >
                    <div className="menu-item" key={idx}>
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

          <div className="menu-image">
            <img src={menuCategories[activeIndex]?.banner || no_image} alt="Category Banner" />
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="menu-tabs-bottom">
          {menuCategories.slice(6).map((cat, idx) => (
            <button
              key={idx + 6}
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
