// src/routes/AppRoutes.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </Router>
);
export default AppRoutes;


// --------------- WHEN BUILD OPEN THE BELOW CODE. AND CLOSE THE ABOVE CODE ----------------
// // src/routes/AppRoutes.jsx
// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Home from "../pages/Home";

// const AppRoutes = () => (
//   <Routes>
//     <Route path="/" element={<Home />} />
//   </Routes>
// );
// export default AppRoutes;
