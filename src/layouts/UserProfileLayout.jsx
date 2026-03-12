import { NavLink, useNavigate, Link, useLocation  } from "react-router-dom";
import Header from "./Header";
import ProfileSidebar from "./ProfileSidebar";
import quickButton from "../assets/icons/QuickButton.svg";

const UserProfileLayout = ({ children }) => (
  <div className="user-profile-layout-wrapper">
    <Header />
    <div className="profile-layout-body">
      <ProfileSidebar />
      <main className="profile-main-content">
        <div className="profile-page-inner">{children}</div>
      </main>
    </div>
    <div className="floating-buttons">
      <Link
          to="/quick-order"
          className="quick-order-btn"
          onClick={() => setShowMegaMenu(false)}
        ><img src={quickButton} alt="Side Box" /></Link>
      {/* <a href="/" target="_blank" className="quick-order-btn">
        <img src={quickButton} alt="Side Box" />
      </a> */}

      {/* <a
        href="https://wa.me/your-number"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
      >
        <img src={whatsappButton} alt="Side Box" />
      </a> */}
    </div>
  </div>
);

export default UserProfileLayout;
