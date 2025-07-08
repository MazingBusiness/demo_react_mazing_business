import React, { useState, useEffect, useRef } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";

import searchIcon from "../assets/icons/SearchIcon.svg";
import userIcon from "../assets/icons/HrIcon1.svg";
import wishlistIcon from "../assets/icons/HrIcon2.svg";
import cartIcon from "../assets/icons/HrIcon3.svg";
import MenuBarIcon from "../assets/icons/MenuBarIcon.svg";
import MenuIcon1 from "../assets/icons/MenuIcon1.svg";
import MenuIcon2 from "../assets/icons/MenuIcon2.svg";
import MenuIcon3 from "../assets/icons/MenuIcon3.svg";
import MenuIcon4 from "../assets/icons/MenuIcon4.svg";
import MenuIcon5 from "../assets/icons/MenuIcon5.svg";
import MenuIcon6 from "../assets/icons/MenuIcon6.svg";
import flagEN from "../assets/icons/flag-icon/gb.svg";
import flagFR from "../assets/icons/flag-icon/fr.svg";
import Logo from "../assets/images/Logo.svg";

import MegaMenu from "./MegaMenu";
import SearchModal from "../components/SearchModal";

import CartSlide from "../components/CartSlide"; // adjust path if needed

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [isCartVisible, setIsCartVisible] = useState(false);
  const toggleCart = () => setIsCartVisible(!isCartVisible);

  const [selectedLang, setSelectedLang] = useState({
    code: "en",
    name: "English",
    flag: flagEN,
  });

  const megaMenuRef = useRef(null);
  const langDropdownRef = useRef(null);
  const navigate = useNavigate();

  const languages = [
    { code: "en", name: "English", flag: flagEN },
    { code: "fr", name: "French", flag: flagFR },
  ];

  const handleSearchChange = (e) => setSearchText(e.target.value);
  const handleClear = () => setSearchText("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target)
      ) {
        setIsLangOpen(false);
      }

      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target) &&
        !event.target.closest(".category-btn")
      ) {
        setShowMegaMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const shouldLockScroll = showMegaMenu || isSearchOpen || isCartVisible;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto"; // reset on unmount
    };
  }, [showMegaMenu, isSearchOpen, isCartVisible]);

  return (
    <header className="main-header">
      <div className="top-header">
        <div className="maincontainer">
          <div className="top-headerLft">
            <div className="logo">
              <img src={Logo} alt="Logo" />
            </div>
          </div>

          <div className="top-headerMid">
            {!isSearchOpen && (
              <div
                className="search-container"
                onClick={() => setIsSearchOpen(true)}
              >
                <input
                  type="text"
                  placeholder="Search by Product / Category / Brand"
                  value={searchText}
                  onChange={handleSearchChange}
                  readOnly
                />
                <img src={searchIcon} alt="search" className="searchIcon" />
                {searchText && (
                  <span onClick={handleClear} className="clear-x">
                    <FiX />
                  </span>
                )}
              </div>
            )}
            <div className="contact-info">
              +91-6287859750
              <br /> <span>Help Line</span>
            </div>
          </div>

          <div className="top-headerRgt">
            <div className="header-icons">
              <button className="icon-btn">
                <img src={userIcon} alt="User" />
              </button>
              <button className="icon-btn badge-container">
                <img src={wishlistIcon} alt="Wishlist" />
                <span className="badge">5</span>
              </button>
              <button
                className="icon-btn badge-container cart-item"
                onClick={toggleCart}
              >
                <img src={cartIcon} alt="Cart" />
                <span className="badge">3</span>
                <div className="cart-details">
                  <div className="cart-label">Your cart</div>
                  <div className="cart-price">
                    <span>₹</span> 20,597
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="nav-bar">
        <div className="maincontainer">
          <button
            className="category-btn"
            onClick={() => setShowMegaMenu((prev) => !prev)}
          >
            <img src={MenuBarIcon} alt="MenuBarIcon" /> Shop by Category
          </button>

          <ul className="nav-links">
            <li>
              <Link to="/">
                <img src={MenuIcon1} alt="MenuIcon" /> Deals Today
              </Link>
            </li>
            <li>
              <Link to="/">
                <img src={MenuIcon2} alt="MenuIcon" />
                Best Sellers
              </Link>
            </li>
            <li>
              <Link to="/">
                <img src={MenuIcon3} alt="MenuIcon" /> New Arrival
              </Link>
            </li>
            <li>
              <Link to="/">
                <img src={MenuIcon4} alt="MenuIcon" /> By Brands
              </Link>
            </li>
            <li>
              <Link to="/">
                <img src={MenuIcon5} alt="MenuIcon" /> By Store Type
              </Link>
            </li>
            <li>
              <Link to="/">
                <img src={MenuIcon6} alt="MenuIcon" /> Recently Viewed
              </Link>
            </li>
          </ul>

          <div className="language-selector" ref={langDropdownRef}>
            <button
              className="language-toggle"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <img
                src={selectedLang.flag}
                alt={selectedLang.name}
                className="flag"
              />
              <span className="language-name">{selectedLang.name}</span>
              <FiChevronDown
                className={`arrow-icon ${isLangOpen ? "rotate" : ""}`}
              />
            </button>

            <div className={`language-dropdown ${isLangOpen ? "open" : ""}`}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`language-option ${
                    lang.code === selectedLang.code ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedLang(lang);
                    setIsLangOpen(false);
                  }}
                >
                  <img src={lang.flag} alt={lang.name} className="flag" />
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mega-menu-section" ref={megaMenuRef}>
        {showMegaMenu && (
          <div
            className="mega-menu-overlay"
            onClick={() => setShowMegaMenu(false)}
          />
        )}
        <div className={`mega-menu-wrapper ${showMegaMenu ? "open" : ""}`}>
          <MegaMenu />
        </div>
      </div>

      {/* ✅ Search Modal */}
      {isSearchOpen && (
        <SearchModal
          searchText={searchText}
          onChange={handleSearchChange}
          onClear={handleClear}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Cart Slide Panel */}
      <CartSlide isCartVisible={isCartVisible} toggleCart={toggleCart} />
    </header>
  );
};

export default Header;
