import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
import "./styles/mainStyle.css";


// For local server
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     {/* <BrowserRouter basename="/mazing_react_website/"> */}
//     {/* <BrowserRouter basename="/demo_react_mazing_business/"> */}
//     <BrowserRouter>
//       <AppRoutes />
//     </BrowserRouter>
//   </React.StrictMode>
// );

// For Git
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <Toaster position="top-right" />
      <AppRoutes />
  </React.StrictMode>
);