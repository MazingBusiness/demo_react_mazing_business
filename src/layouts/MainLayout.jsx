import { Link, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

import whatsappButton from "../assets/icons/WhatsappButton.svg";
import quickButton from "../assets/icons/QuickButton.svg";

const MainLayout = ({ children }) => {
  const location = useLocation();

  const isQuickOrderPage = location.pathname === "/quick-order";

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