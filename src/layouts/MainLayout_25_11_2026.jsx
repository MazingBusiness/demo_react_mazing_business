import { Link, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

import quickButton from "../assets/icons/QuickButton.svg";
import preArrivalIcon from "../assets/icons/pre-arrival-items-icon.svg";

const MainLayout = ({ children }) => {
  const location = useLocation();

  const isQuickOrderPage = location.pathname === "/quick-order";
  const isPreArrivalPage = location.pathname === "/pre-arrival";

  return (
    <div className="layout-wrapper">
      <Header />
      <main className="content">{children}</main>
      <Footer />

      <div className="floating-buttons">
        {!isQuickOrderPage && (
          <Link to="/quick-order" className="quick-order-btn">
            <img src={quickButton} alt="Quick Order" />
          </Link>
        )}

        {!isPreArrivalPage && (
          <Link to="/pre-arrival" className="pre-arrival-floating-btn">
            <img src={preArrivalIcon} alt="" aria-hidden="true" />
            <span>PRE ARRIVAL</span>
          </Link>
        )}

        {/* <a
          href="https://wa.me/your-number"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          <img src={whatsappButton} alt="WhatsApp" />
        </a> */}
      </div>
    </div>
  );
};

export default MainLayout;
