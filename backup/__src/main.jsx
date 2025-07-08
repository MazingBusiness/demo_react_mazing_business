import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AppRoutes from "./routes/AppRoutes"; // or "./AppRoutes" based on structure
import "./styles/global.css";
import "./styles/mainStyle.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);

// --------------- WHEN BUILD OPEN THE BELOW CODE. AND CLOSE THE ABOVE CODE ----------------
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import AppRoutes from "./routes/AppRoutes"; // or "./AppRoutes" based on structure
// import "./styles/global.css";
// import "./styles/mainStyle.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter basename="/mazing_react_website/">
//       <AppRoutes />
//     </BrowserRouter>
//   </React.StrictMode>
// );