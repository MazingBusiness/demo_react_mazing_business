import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { WarrantyLogout } from "../api/apiRequest";
import quickButton from "../assets/icons/QuickButton.svg";
import preArrivalIcon from "../assets/icons/pre-arrival-items-icon.svg";
import { useLoading } from "../context/LoadingContext";
const MainLayout = ({ children }) => {
  const location = useLocation();
  const {loading}=useLoading();
  const isQuickOrderPage = location.pathname === "/quick-order";
  const isPreArrivalPage = location.pathname === "/pre-arrival";

const currentPath = location.pathname.toLowerCase();
const isWarrantyLogin=currentPath==="/warranty-login";



const navigate=useNavigate();
// Calling Warranty Logout API
const handleWarrantyLogout= async()=>{
  try{
  await WarrantyLogout();
        } catch (error) {
    console.error("Warranty Logout API failed:", error);
  } finally {
    // Clear Warranty login details only
    localStorage.removeItem("warrantyToken");
    localStorage.removeItem("warrantyLoginInfo");
    sessionStorage.removeItem("warrantyVerifiedPhone");

    navigate("/warranty-login", { replace: true });
  }
};


const isWarrantyPage =
  currentPath === "/warranty-claim" ||
  currentPath === "/new-warrenty-claim" ||
  currentPath.startsWith("/warranty-claim-detail");
  const hideLogout=isWarrantyLogin||(isWarrantyPage && loading);

  return (
    <div className="layout-wrapper">
      <Header />
       {isWarrantyPage && !hideLogout && (
  <button onClick={handleWarrantyLogout} className="warranty-logout-btn">
    Logout
  </button>
)}
      <main className="content">{children}</main>
      <Footer />
{!isWarrantyPage && !isWarrantyLogin  && (
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
)}
    </div>
  );
};

export default MainLayout;
