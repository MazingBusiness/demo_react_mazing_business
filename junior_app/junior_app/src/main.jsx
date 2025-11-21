import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
import "./styles/mainStyle.css";

// For local server
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     {/* <BrowserRouter basename="/mazing_react_html/"> */}
//     <BrowserRouter>
//       <AppRoutes />
//     </BrowserRouter>
//   </React.StrictMode>
// );


// For git upload
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>    
      <AppRoutes />
  </React.StrictMode>
);
