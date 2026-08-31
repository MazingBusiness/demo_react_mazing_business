import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
import "./styles/mainStyle.css";
import "./styles/BrandPage.css";
import "./styles/responsive.css";
import { LoadingProvider } from "./context/LoadingContext";
import GlobalLoader from "./components/GlobalLoader";
// console.log("✅ main.jsx loaded", window.location.href);
// alert("main.jsx loaded");

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
    <LoadingProvider>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 1000000 }}
      />
      <GlobalLoader />
      <AppRoutes />
    </LoadingProvider>
  </React.StrictMode>
);
