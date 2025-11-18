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
    <Route path="/home" element={<Home />} />
    <Route path="/productListing" element={<ProductListing />} />
    <Route path="/" element={<Login />} />
    <Route path="/forgotpassword" element={<ForgotPassword />} />
    <Route path="/register" element={<Register />} />

    <Route path="/profileDashbord" element={<ProfileDashbord />} />
    <Route path="/profileOrder" element={<ProfileOrder />} />
    <Route path="/profileOrderDetails" element={<ProfileOrderDetails />} />
    <Route path="/manageProfile" element={<ManageProfile />} />
    <Route path="/profileStatement" element={<ProfileStatement />} />
    <Route
      path="/profileStatementDetails"
      element={<ProfileStatementDetails />}
    />
    <Route path="/profileRewards" element={<ProfileRewards />} />
    <Route path="/profileWishlist" element={<ProfileWishlist />} />
    <Route path="/profileSupportTicket" element={<ProfileSupportTicket />} />
    <Route path="/profileWallet" element={<ProfileWallet />} />
    <Route path="/ticketDetails" element={<TicketDetails />} />
  </Routes>
);

export default AppRoutes;
