// components/Loader.jsx

import logo from "../assets/images/logo.png";
import bg from "../assets/images/splash-bg.jpg"; // optional

const Loader = () => {
  return (
    <div className="loader-container" style={{ backgroundImage: `url(${bg})` }}>
      <img src={logo} alt="Logo" className="loader-logo" />
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
