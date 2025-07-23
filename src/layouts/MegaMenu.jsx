import React, { useState, useEffect } from "react";
import { NavLink,useNavigate, Link } from "react-router-dom";

import {getMegaMenu} from "../api/apiRequest";
import no_image from "../assets/images/no-image.png";

// Static imports for category icons
import megamenuIcon1 from "../assets/icons/megamenuIcon1.svg";
import megamenuIcon2 from "../assets/icons/megamenuIcon2.svg";
import megamenuIcon3 from "../assets/icons/megamenuIcon3.svg";
import megamenuIcon4 from "../assets/icons/megamenuIcon4.svg";
import megamenuIcon5 from "../assets/icons/megamenuIcon5.svg";
import megamenuIcon6 from "../assets/icons/megamenuIcon6.svg";
import megamenuIcon7 from "../assets/icons/megamenuIcon7.svg";
import megamenuIcon8 from "../assets/icons/megamenuIcon8.svg";
import megamenuIcon10 from "../assets/icons/megamenuIcon10.svg";
import megamenuIcon11 from "../assets/icons/megamenuIcon11.svg";

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



// Category data
// const categories = [
//   {
//     title: "Power Tools",
//     icon: megamenuIcon1,
//     banner: "powertools.jpg",
//     items: [
//       { name: "Air Blower", img: "catInfoimg1.png" },
//       { name: "Bench Grinder", img: "catInfoimg2.png" },
//       { name: "Core Cutter", img: "catInfoimg3.png" },
//       { name: "Drill", img: "catInfoimg4.png" },
//       { name: "Electric Riveter", img: "catInfoimg1.png", isNew: true },
//       { name: "Jigsaw", img: "catInfoimg2.png" },
//       { name: "Putty Scraper", img: "catInfoimg3.png" },
//       { name: "Road Marking", img: "catInfoimg4.png" },
//       { name: "Shearer", img: "catInfoimg1.png" },
//       { name: "Air Blower", img: "catInfoimg1.png" },
//       { name: "Bench Grinder", img: "catInfoimg2.png" },
//       { name: "Core Cutter", img: "catInfoimg3.png" },
//       { name: "Drill", img: "catInfoimg4.png" },
//       { name: "Electric Riveter", img: "catInfoimg1.png", isNew: true },
//       { name: "Jigsaw", img: "catInfoimg2.png" },
//       { name: "Putty Scraper", img: "catInfoimg3.png" },
//       { name: "Road Marking", img: "catInfoimg4.png" },
//       { name: "Shearer", img: "catInfoimg1.png" },
//       { name: "Air Blower", img: "catInfoimg1.png" },
//       { name: "Bench Grinder", img: "catInfoimg2.png" },
//       { name: "Core Cutter", img: "catInfoimg3.png" },
//       { name: "Drill", img: "catInfoimg4.png" },
//       { name: "Electric Riveter", img: "catInfoimg1.png", isNew: true },
//       { name: "Jigsaw", img: "catInfoimg2.png" },
//       { name: "Putty Scraper", img: "catInfoimg3.png" },
//       { name: "Road Marking", img: "catInfoimg4.png" },
//       { name: "Shearer", img: "catInfoimg1.png" },
//       { name: "Air Blower", img: "catInfoimg1.png" },
//       { name: "Bench Grinder", img: "catInfoimg2.png" },
//       { name: "Core Cutter", img: "catInfoimg3.png" },
//       { name: "Drill", img: "catInfoimg4.png" },
//       { name: "Electric Riveter", img: "catInfoimg1.png", isNew: true },
//       { name: "Jigsaw", img: "catInfoimg2.png" },
//       { name: "Putty Scraper", img: "catInfoimg3.png" },
//       { name: "Road Marking", img: "catInfoimg4.png" },
//       { name: "Shearer", img: "catInfoimg1.png" },
//     ],
//   },
//   {
//     title: "Cordless Tools",
//     icon: megamenuIcon2,
//     banner: "powertools.jpg",
//     items: [
//       { name: "Angle Grinder", img: "catInfoimg1.png", isNew: true },
//       { name: "Ceiling Fastener", img: "catInfoimg2.png", isNew: true },
//       { name: "Cut Off Machine", img: "catInfoimg3.png" },
//       { name: "Drill Impact Type", img: "catInfoimg4.png" },
//       { name: "Electric Stapler", img: "catInfoimg1.png" },
//       { name: "Magnetic Drill", img: "catInfoimg2.png" },
//       { name: "Rebar Tool", img: "catInfoimg3.png" },
//       { name: "Rotary Hammer", img: "catInfoimg4.png" },
//       { name: "Slab Cutter", img: "catInfoimg1.png" },
//     ],
//   },
//   {
//     title: "Agriculture Tools",
//     icon: megamenuIcon3,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Cleaning Accessories",
//     icon: megamenuIcon4,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Hand Tools",
//     icon: megamenuIcon5,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Painting Accessories",
//     icon: megamenuIcon6,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Pneumatic Accessories",
//     icon: megamenuIcon7,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Power Tools Accessories",
//     icon: megamenuIcon8,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Power Tools Spares",
//     icon: megamenuIcon8,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Safety Equipments",
//     icon: megamenuIcon10,
//     banner: "powertools.jpg",
//     items: [],
//   },
//   {
//     title: "Welding Equipments",
//     icon: megamenuIcon11,
//     banner: "powertools.jpg",
//     items: [],
//   },
// ];

const chunkArray = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const MegaMenu = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuCategories, setMenuCategories] = useState([]);

  const allMenuItems = async () => {
    try {
      const apiRes = await getMegaMenu( );
      const responseData = await apiRes.json();
      
      if (responseData.res) {
        const transformedData = responseData.data.map((categoryGroup) => {
          const childCategories  = categoryGroup.category || [];
          const items = childCategories.map((child) => ({
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
        console.log(transformedData);
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
  
  // console.log(menuCategories);
  // const items = categories[activeIndex]?.items || [];
  const items = menuCategories[activeIndex]?.items || [];

  // Split items into 4 columns
  const columnCount = 4;
  const itemsPerColumn = Math.ceil(items.length / columnCount);
  const columns = chunkArray(items, itemsPerColumn);

  return (
    <div className="maincontainer">
      <div className="mega-menu">
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
                  <Link to={`/${item.slug}`}>
                    <div className="menu-item" key={idx}>
                      <span className="menu-item-img">
                        {/* <img src={getBannerImage(item.img)} alt={item.name} /> */}
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
            {/* <img
              src={getBannerImage(menuCategories[activeIndex].banner)}
              alt="Category Banner"
            /> */}
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
