import React from "react";
import { Navigate } from "react-router-dom";
import { getLoggedInUser } from "../utils/authUtils"; 

const PrivateRoute = ({ children }) => {
  const user = getLoggedInUser(); 

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
