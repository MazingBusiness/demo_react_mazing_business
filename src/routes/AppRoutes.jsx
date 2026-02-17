
import React from "react";
import { Routes, Route , HashRouter  } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import ProductListing from "../pages/ProductListing";
import Login from "../pages/Login";
import LoginFromAdmin from "../pages/LoginFromAdmin";
import ForgotPassword from "../pages/ForgotPassword";
import Register from "../pages/Register";
import ProfileDashbord from "../pages/user-profile/ProfileDashbord";
import ProfileOrder from "../pages/user-profile/ProfileOrder";
import ProfileOrderDetails from "../pages/user-profile/ProfileOrderDetails";
import ManageProfile from "../pages/user-profile/ManageProfile";
import ProfileStatement from "../pages/user-profile/ProfileStatement";
import ProfileStatementDetails from "../pages/user-profile/ProfileStatementDetails";
import ProfileRewards from "../pages/user-profile/ProfileRewards";
import ProfileWishlist from "../pages/user-profile/ProfileWishlist";
import ProfileSupportTicket from "../pages/user-profile/ProfileSupportTicket";
import ProfileWallet from "../pages/user-profile/ProfileWallet";
import TicketDetails from "../pages/user-profile/TicketDetails";
import Cart from "../pages/Cart";
import Payment from "../pages/Payment";
import Confirmation from "../pages/Confirmation";
import Company from "../pages/Company";
import ProductDetails from "../pages/ProductDetails";
import ProductDetailsWithSlider from "../pages/ProductDetailsWithSlider";
import Demo from "../pages/demo";
import QuickOrder from "../pages/QuickOrder";
import About from "../pages/About";
import Contact from "../pages/Contact";
import WarrantyClaim from "../pages/WarrantyClaim";
import WarrentyClaimHistory from "../pages/WarrentyClaimHistory";
import NewWarrentyClaim from "../pages/NewWarrentyClaim";
import WarrentyClaimFull from "../pages/WarrentyClaimFull";

const AppRoutes = () => (
  <HashRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/product-listing" element={<ProductListing />} />
      <Route path="/quick-order" element={<QuickOrder />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/company" element={<Company />} />
      <Route path="/productDetails" element={<ProductDetails />} />
      <Route path="/productDetailswithslider" element={<ProductDetailsWithSlider />} />
      <Route path="/quickOrder" element={<QuickOrder />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Warranty */}
      <Route path="/warranty-claim" element={<WarrantyClaim />} />
      <Route path="/Warrenty-claim-history" element={<WarrentyClaimHistory />} />
      <Route path="/new-warrenty-claim" element={<NewWarrentyClaim />} />
      <Route path="/warrenty-claim-full" element={<WarrentyClaimFull />} />

      {/* Protected Profile Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/login-from-admin" element={<LoginFromAdmin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/profile-dashbord" element={<PrivateRoute><ProfileDashbord /></PrivateRoute>} />
      <Route path="/profile-order" element={<PrivateRoute><ProfileOrder /></PrivateRoute>} />
      <Route path="/profile-order-details" element={<PrivateRoute><ProfileOrderDetails /></PrivateRoute>} />
      <Route path="/manage-profile" element={<PrivateRoute><ManageProfile /></PrivateRoute>} />
      <Route path="/statement" element={<PrivateRoute><ProfileStatement /></PrivateRoute>} />
      <Route path="/profile-statement-details" element={<PrivateRoute><ProfileStatementDetails /></PrivateRoute>} />
      <Route path="/rewards" element={<PrivateRoute><ProfileRewards /></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><ProfileWishlist /></PrivateRoute>} />
      <Route path="/support-tickets" element={<PrivateRoute><ProfileSupportTicket /></PrivateRoute>} />
      <Route path="/wallet" element={<PrivateRoute><ProfileWallet /></PrivateRoute>} />
      <Route path="/ticket-details" element={<PrivateRoute><TicketDetails /></PrivateRoute>} />
      
    </Routes>
  </HashRouter>
);
export default AppRoutes;