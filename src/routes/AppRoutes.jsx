// src/routes/AppRoutes.jsx

import React from "react";
import { Routes, Route /*, HashRouter */ } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import ProductListing from "../pages/ProductListing";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Register from "../pages/Register";

// Profile Pages
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

const AppRoutes = () => (
  <HashRouter>  // ✅ Use this if you're facing refresh issues on hosting
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/productListing" element={<ProductListing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />      

      {/* Protected Profile Routes */}
      <Route path="/profileDashbord" element={<PrivateRoute><ProfileDashbord /></PrivateRoute>} />
      <Route path="/profileOrder" element={<PrivateRoute><ProfileOrder /></PrivateRoute>} />
      <Route path="/profileOrderDetails" element={<PrivateRoute><ProfileOrderDetails /></PrivateRoute>} />
      <Route path="/manage-profile" element={<PrivateRoute><ManageProfile /></PrivateRoute>} />
      <Route path="/statement" element={<PrivateRoute><ProfileStatement /></PrivateRoute>} />
      <Route path="/profileStatementDetails" element={<PrivateRoute><ProfileStatementDetails /></PrivateRoute>} />
      <Route path="/rewards" element={<PrivateRoute><ProfileRewards /></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><ProfileWishlist /></PrivateRoute>} />
      <Route path="/support-ticket" element={<PrivateRoute><ProfileSupportTicket /></PrivateRoute>} />
      <Route path="/wallet" element={<PrivateRoute><ProfileWallet /></PrivateRoute>} />
      <Route path="/ticketDetails" element={<PrivateRoute><TicketDetails /></PrivateRoute>} />
    </Routes>
  </HashRouter>
);

export default AppRoutes;
