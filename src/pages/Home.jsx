// src/pages/Home.jsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
import PowerToolsSlider from "../components/PowerToolsSlider";
import BannerSection from "../components/BannerSection";
import BrandCarousel from "../components/BrandCarousel";
import OfferItems from "../components/OfferItems";
import BestSellers from "../components/BestSellers";
import HandTools from "../components/HandTools";
import TopCategoryGroup from "../components/TopCategoryGroup";

import promo1 from "../assets/images/promo1.jpg";
import promo2 from "../assets/images/promo2.jpg";
import promo3 from "../assets/images/promo3.jpg";

import AddBanner from "../assets/images/AddBanner.jpg";
import AddBlock from "../assets/images/AddBlock.png";

const Home = () => {
  return (
    <MainLayout>
      <BannerSection />
      <OfferItems />

      <div className="maincontainer">
        <div className="hand-tools-wrapper">
          <div className="hand-tools-content">
            <TopCategoryGroup />
          </div>

          <div className="app-banner">
            <div className="app-banner-inner">
              <img src={AddBlock} alt="Visa" />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="maincontainer">
        <div className="brand-carousel-container">
          <BrandCarousel />
        </div>
      </div> */}

      <div className="Endcontainer">
        <BrandCarousel />
        <PowerToolsSlider />
        <BestSellers />

        <div className="maincontainer">
          <div className="promo-section">
            <div className="promo-card style1">
              <img src={promo1} alt="Promo 1" />
              <div className="promo-content">
                <h3>Innovative Solutions for Industrial Efficiency</h3>
                <p>
                  Maximize productivity with cutting-edge technology and
                  reliable equipment.
                </p>
                <button>Shop Now</button>
              </div>
            </div>

            <div className="promo-card style2">
              <img src={promo2} alt="Promo 2" />
              <div className="promo-content">
                <h3>Powering Your Business with Precision Engineering</h3>
                <p>
                  Discover precision-crafted machinery that drives performance
                  and reliability.
                </p>
                <button>Shop Now</button>
              </div>
            </div>

            <div className="promo-card style3">
              <img src={promo3} alt="Promo 3" />
              <div className="promo-content">
                <h3>Sustainable Growth for a Stronger Future</h3>
                <p>
                  Eco-friendly industrial products designed to meet tomorrow’s
                  demands today.
                </p>
                <button>Shop Now</button>
              </div>
            </div>
          </div>
        </div>

        <div className="maincontainer">
          <div className="hand-tools-wrapper">
            <div className="hand-tools-content">
              <HandTools />
            </div>

            <div className="app-banner">
              <div className="app-banner-inner">
                <img src={AddBanner} alt="Visa" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
