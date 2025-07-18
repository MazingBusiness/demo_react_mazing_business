import React, { useState, useEffect, useRef } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { NavLink, useNavigate, Link } from "react-router-dom";

import Logo from "../assets/images/Logo.svg";

import MegaMenu from "./MegaMenu";

const LoginHeader = () => {
  return (
    <header className="main-header">
      <div className="login-header">
        <div className="maincontainer">
          <div className="top-headerLft">
            <div className="logo">
              <NavLink to="/" ><img src={Logo} alt="Logo" /></NavLink>
            </div>
          </div>

          <div className="top-headerRgt">
            <div className="loginmenu">
              <ul>
                <li>
                  {" "}
                  <Link to="/">+91-6287859750</Link>
                </li>
                <li>
                  {" "}
                  <Link to="/">About Us</Link>
                </li>
                <li>
                  {" "}
                  <Link to="/">Teams & Condition</Link>
                </li>
                <li>
                  {" "}
                  <Link to="/">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoginHeader;
