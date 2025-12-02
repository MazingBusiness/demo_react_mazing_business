import { NavLink, useNavigate, Link, useLocation  } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

import whatsappButton from "../assets/icons/WhatsappButton.svg";
import quickButton from "../assets/icons/QuickButton.svg";

const MainLayout = ({ children }) => (
  <div className="layout-wrapper">
    <Header />
    <main className="content">{children}</main>
    <Footer />

    <div className="floating-buttons">
      <Link
          to="/product-listing"
          className="quick-order-btn"
          onClick={() => setShowMegaMenu(false)}
        ><img src={quickButton} alt="Side Box" /></Link>
      {/* <a href="/" target="_blank" className="quick-order-btn">
        <img src={quickButton} alt="Side Box" />
      </a> */}

      <a
        href="https://wa.me/your-number"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
      >
        <img src={whatsappButton} alt="Side Box" />
      </a>
    </div>
  </div>
);

export default MainLayout;
