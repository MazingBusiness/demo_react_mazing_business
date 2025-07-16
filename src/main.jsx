import React from "react";
import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { HashRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
import "./styles/mainStyle.css";


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
      <AppRoutes />
  </React.StrictMode>
);
