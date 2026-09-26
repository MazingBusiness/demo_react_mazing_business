import React from "react";
import { useLoading } from "../context/LoadingContext";
import "../styles/GlobalLoader.css";
import loadingGif from "../assets/images/transperent-loader.gif";

const GlobalLoader = ({section=false , show=false}) => {
  const { loading } = useLoading();

  if (section && !show) {
  return null;
}

if (!section && !loading) {
  return null;
}

  return (
    <div className={section ? "loading-overlay section-loading" : "loading-overlay"}>
      <img
        src={loadingGif}
        alt="Loading..."
        className="loading-gif"
      />
    </div>
  );
};

export default GlobalLoader;