import React from "react";
import { useLoading } from "../context/LoadingContext";
import "../styles/GlobalLoader.css";
import loadingGif from "../assets/images/transperent-loader.gif";

const GlobalLoader = () => {
  const { loading } = useLoading();

  if (!loading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <img
        src={loadingGif}
        alt="Loading..."
        className="loading-gif"
      />
    </div>
  );
};

export default GlobalLoader;