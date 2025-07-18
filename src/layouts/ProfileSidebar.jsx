import React from "react";
import { NavLink, useLocation, useNavigate  } from "react-router-dom";
import userImage from "../assets/images/pic2.png";
import icon1 from "../assets/icons/sidemenuIcon1.svg";
import icon2 from "../assets/icons/sidemenuIcon2.svg";
import icon3 from "../assets/icons/sidemenuIcon3.svg";
import icon4 from "../assets/icons/sidemenuIcon4.svg";
import icon5 from "../assets/icons/sidemenuIcon5.svg";
import icon6 from "../assets/icons/sidemenuIcon6.svg";
import icon7 from "../assets/icons/sidemenuIcon7.svg";
import icon8 from "../assets/icons/sidemenuIcon8.svg";
import icon9 from "../assets/icons/sidemenuIcon9.svg";
import { getLoggedInUser } from "../utils/authUtils";

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const user = getLoggedInUser();
  console.log("✅ Logged In User:", user);

  // ✅ Define aliases: key = currentPath, value = base route to activate
  const routeAliases = {
    "/profileOrderDetails": "/profileOrder",
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("mazingBusinessLoginInfo"); // Clear token
    navigate("/login"); // Redirect to login
  };

  // Get the active path from aliases, or fallback to current path
  const resolvedPath = routeAliases[currentPath] || currentPath;

  // Helper function to determine active route
  const isActive = (targetPath) => resolvedPath === targetPath;

  return (
    <aside className="profile-sidebar">
      <div className="profile-card">
        <img src={userImage} alt="User" className="user-image" />
        <div className="user-info">
          <h3>{user?.first_name || "Guest User"}</h3>
          <p className="party-code">
            Party Code: <span>{user?.party_code || ""}</span>
          </p>
          <p className="user-phone">{user?.phone || ""}</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/profileDashbord"
          className={`sidebar-menu-item ${
            isActive("/profileDashbord") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon1} alt="Dashboard" />
          </span>
          <span className="menu-title">Dashboard</span>
        </NavLink>

        <NavLink
          to="/profileOrder"
          className={`sidebar-menu-item ${
            isActive("/profileOrder") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon2} alt="My Order" />
          </span>
          <span className="menu-title">My Order</span>
        </NavLink>

        <NavLink
          to="/manage-profile"
          className={`sidebar-menu-item ${
            isActive("/manage-profile") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon3} alt="Manage Profile" />
          </span>
          <span className="menu-title">Manage Profile</span>
        </NavLink>

        <NavLink
          to="/statement"
          className={`sidebar-menu-item ${
            isActive("/statement") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon4} alt="Statement" />
          </span>
          <span className="menu-title">Statement</span>
        </NavLink>

        <NavLink
          to="/rewards"
          className={`sidebar-menu-item ${
            isActive("/rewards") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon5} alt="Rewards" />
          </span>
          <span className="menu-title">Rewards</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={`sidebar-menu-item ${
            isActive("/wishlist") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon6} alt="Wishlist" />
          </span>
          <span className="menu-title">Wishlist</span>
        </NavLink>

        <NavLink
          to="/support-ticket"
          className={`sidebar-menu-item ${
            isActive("/support-ticket") ? "active" : ""
          }`}
        >
          <span className="menu-icon">
            <img src={icon7} alt="Support Ticket" />
          </span>
          <span className="menu-title">Support Ticket</span>
        </NavLink>

        <NavLink
          to="/wallet"
          className={`sidebar-menu-item ${isActive("/wallet") ? "active" : ""}`}
        >
          <span className="menu-icon">
            <img src={icon8} alt="Wallet" />
          </span>
          <span className="menu-title">My Wallet</span>
        </NavLink>
      </nav>

      <div className="logout-section">
        <button style={{ cursor: "pointer" }} className="logout-btn" onClick={handleLogout}>
          <span className="menu-icon">
            <img src={icon9} alt="Logout" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
