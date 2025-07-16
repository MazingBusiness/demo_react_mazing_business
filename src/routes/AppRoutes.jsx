// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ProductListing from "../pages/ProductListing";
import Login from "../pages/Login";
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

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/productListing" element={<ProductListing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgotpassword" element={<ForgotPassword />} />
    <Route path="/register" element={<Register />} />

    <Route path="/profileDashbord" element={<ProfileDashbord />} />
    <Route path="/profileOrder" element={<ProfileOrder />} />
    <Route path="/orderDetails" element={<ProfileOrderDetails />} />
    <Route path="/manage-Profile" element={<ManageProfile />} />
    <Route path="/statement" element={<ProfileStatement />} />
    <Route path="/statementDetails" element={<ProfileStatementDetails />}/>    
    <Route path="/rewards" element={<ProfileRewards />} />
    <Route path="/wishlist" element={<ProfileWishlist />} />
    <Route path="/support-ticket" element={<ProfileSupportTicket />} />
    <Route path="/wallet" element={<ProfileWallet />} />
    <Route path="/ticketDetails" element={<TicketDetails />} />

  </Routes>
);

export default AppRoutes;
