import React from "react";
import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
import { HashRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
import "./styles/mainStyle.css";

import Home from "../pages/Home";
import Login from "../pages/Login";


// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     {/* <BrowserRouter basename="/mazing_react_website/"> */}
//     <BrowserRouter basename="/demo_react_mazing_business/">
//     {/* <BrowserRouter> */}
//       <AppRoutes />
//     </BrowserRouter>
//   </React.StrictMode>
// );
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
