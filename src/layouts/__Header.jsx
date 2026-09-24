import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";

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
import CartSlide from "../components/CartSlide";

import { cart, getWishList } from "../api/apiRequest";
import { API_BASE_URL } from "../app_url";
// import { NotificationManager } from "react-notifications"; // if you're using it

// ✅ helper: read staff id safely from localStorage
function getStoredStaffId() {
  const raw = localStorage.getItem("mazingBusinessStaffId");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw); // because you saved JSON.stringify(staff_id)
    return String(parsed || "");
  } catch {
    // fallback if it was stored as plain string
    return String(raw || "").replace(/^"|"$/g, "");
  }
}

function getStoredUserTitle() {
  const raw = localStorage.getItem("mazingBusinessStaffUserTitle");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return String(parsed || "");
  } catch {
    return String(raw || "").replace(/^"|"$/g, "");
  }
}

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubTotal, setCartSubTotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  /** store login credentials */
  const [userInfo, setUserInfo] = useState(null);

  const [isCartVisible, setIsCartVisible] = useState(false);
  const toggleCart = () => setIsCartVisible(!isCartVisible);

  const [selectedLang, setSelectedLang] = useState({
    code: "en",
    name: "English",
    flag: flagEN,
  });

  const megaMenuRef = useRef(null);
  const langDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isCategorySlidePage =
    location.pathname.toLowerCase() === "/all-categories";

  useEffect(() => {
    if (!showMegaMenu) {
      setShowViewAll(false);
    }
  }, [showMegaMenu]);

  const languages = [
    { code: "en", name: "English", flag: flagEN },
    // { code: "fr", name: "French", flag: flagFR },
  ];

  const handleSearchChange = (e) => setSearchText(e.target.value);
  const handleClear = () => setSearchText("");
  const updateSearchAnchor = () => {
    if (!searchContainerRef.current) return;

    const rect = searchContainerRef.current.getBoundingClientRect();
    setSearchAnchor({
      top: rect.top,
      left: rect.left,
      width: rect.width,
    });
  };

  const openSearch = () => {
    updateSearchAnchor();
    setIsSearchOpen(true);
  };

  // ✅ Switch Back link logic (staff_id from localStorage)
  const staffId = useMemo(() => getStoredStaffId(), []);
  const userTitle = useMemo(() => getStoredUserTitle(), []);
  const switchBackHref = useMemo(() => {
    if (!staffId) return "";
    return `https://mazingbusiness.com/mazing_laravel/switch_back_from_react/${encodeURIComponent(
      staffId
    )}`;
  }, [staffId]);

  const handleSwitchBack = () => {
    // ✅ optional cleanup so React session doesn't stay stuck in impersonation
    localStorage.removeItem("mazingBusinessLoginInfo");
    localStorage.removeItem("mazingBusinessStaffId");
    localStorage.removeItem("mazingBusinessStaffUserTitle");

    // go to Laravel URL
    window.location.href = switchBackHref;
  };

  const cartData = async () => {
    try {
      const responseData = await cart();
      if (responseData.res) {
        const cart_item = responseData.cart_item || [];
        const cartSubTotalVal = responseData.other_item_total_amount || "0";
        setCartItems(cart_item);
        setCartCount(cart_item.length);
        setCartSubTotal(cartSubTotalVal);
      } else {
        // NotificationManager.error(responseData.msg || "Something went wrong", "", 2000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // NotificationManager.error("Failed to load Cart", "", 2000);
    }
  };

  const wishlistData = async () => {
    if (!localStorage.getItem("mazingBusinessLoginInfo")) {
      setWishlistCount(0);
      return;
    }

    try {
      const responseData = await getWishList();
      const paginator = responseData?.data;
      const list = paginator?.data
        ?? paginator?.products
        ?? responseData?.products
        ?? responseData?.wishlist
        ?? (Array.isArray(paginator) ? paginator : []);
      const total = paginator?.total ?? responseData?.count ?? list.length;
      setWishlistCount(Number(total) || 0);
    } catch (error) {
      console.error("Failed to load wishlist count:", error);
      setWishlistCount(0);
    }
  };

  /** User Logout */
  const handleLogout = async () => {
    try {
      const loginInfo = JSON.parse(
        localStorage.getItem("mazingBusinessLoginInfo") || "{}"
      );
      const token = loginInfo?.authorisation?.token || loginInfo?.token || "";

      await fetch(`${API_BASE_URL}user/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("mazingBusinessLoginInfo");
      localStorage.removeItem("mazingBusinessStaffId");
      localStorage.removeItem("mazingBusinessStaffUserTitle");
      setUserInfo(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("mazingBusinessLoginInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.first_name) {
          setUserInfo(parsed);
        }
      } catch (e) {
        console.error("Invalid login info in localStorage.");
      }
    }
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleReposition = () => updateSearchAnchor();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isSearchOpen]);

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
        !event.target.closest(".category-btn") &&
        !event.target.closest(".view-btn")
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
      document.body.style.overflow = "auto";
    };
  }, [showMegaMenu, isSearchOpen, isCartVisible]);

  useEffect(() => {
    cartData();

    const handler = () => cartData();
    window.addEventListener("cart-updated", handler);

    return () => {
      window.removeEventListener("cart-updated", handler);
    };
  }, []);

  useEffect(() => {
    wishlistData();

    const handler = () => wishlistData();
    window.addEventListener("wishlist-updated", handler);

    return () => {
      window.removeEventListener("wishlist-updated", handler);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="top-header">
        <div className="maincontainer">
          <div className="top-headerLft">
            <div className="logo">
              <NavLink to="/">
                <img src={Logo} alt="Logo" />
              </NavLink>
            </div>
          </div>

          <div className="top-headerMid">
            {!isSearchOpen && (
              <div
                ref={searchContainerRef}
                className="search-container"
                onClick={openSearch}
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
              {/* ✅ Switch Back: show only if staffId exists */}
              {staffId ? (
                <a href="#" className="switchBackLink" onClick={(e) => { e.preventDefault(); handleSwitchBack(); }} >
                  Switch Back
                </a>
              ) : null}

              <Link to="/profile-dashbord">
                <button className="icon-btn">
                  <img src={userIcon} alt="User" />
                </button>
              </Link>
              <Link to="/wishlist">
                <button className="icon-btn badge-container" type="button">
                  <img src={wishlistIcon} alt="Wishlist" />
                  <span className="badge">{wishlistCount}</span>
                </button>
              </Link>

              <button
                className="icon-btn badge-container cart-item"
                onClick={toggleCart}
                type="button"
              >
                <img src={cartIcon} alt="Cart" />
                <span className="badge">{cartCount}</span>
                <div className="cart-details">
                  <div className="cart-label">Your cart</div>
                  <div className="cart-price">
                    <span>₹</span> {cartSubTotal}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`nav-bar ${
          isCategorySlidePage ? "category-slide-nav" : ""
        }`}
      >
        <div className="maincontainer">
          {!isCategorySlidePage && (
            <div className="category-nav-actions">
              <button
                className="category-btn"
                onClick={() => {
                  setShowMegaMenu((prev) => {
                    const nextValue = !prev;
                    setShowViewAll(nextValue);
                    return nextValue;
                  });
                }}
                type="button"
              >
                <img src={MenuBarIcon} alt="MenuBarIcon" /> Shop by Category
              </button>

              {showViewAll && (
                <Link
                  to="/all-categories"
                  className="view-btn"
                  state={{ showAllCategories: true }}
                  onClick={() => {
                    setShowMegaMenu(false);
                    setShowViewAll(false);
                  }}
                >
                  View All Categories
                </Link>
              )}
            </div>
          )}

          <ul className="nav-links">
            {/* <li>
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
            </li> */}
          </ul>

          {!isCategorySlidePage && (
          <div className="language-selector" ref={langDropdownRef}>
            <button
              className="language-toggle"
              onClick={() => setIsLangOpen(!isLangOpen)}
              type="button"
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
          )}
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
          <MegaMenu setShowMegaMenu={setShowMegaMenu} />
        </div>
      </div>

      {/* ✅ Search Modal */}
      {isSearchOpen && (
        <SearchModal
          searchText={searchText}
          onChange={handleSearchChange}
          onClear={handleClear}
          onClose={() => setIsSearchOpen(false)}
          anchorRect={searchAnchor}
        />
      )}

      {/* Cart Slide Panel */}
      <CartSlide isCartVisible={isCartVisible} toggleCart={toggleCart} />
    </header>
  );
};

export default Header;
