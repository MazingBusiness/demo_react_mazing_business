import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PowerToolsSlider from "../components/PowerToolsSlider";
import BannerSection from "../components/BannerSection";
import BrandCarousel from "../components/BrandCarousel";
import OfferItems from "../components/OfferItems";
import BestSellers from "../components/BestSellers";
import NewArrivals from "../components/NewArrivals";
import HandTools from "../components/HandTools";
import TopCategoryGroup from "../components/TopCategoryGroup";
import {
  getBannerOne,
  getBannerTwo,
  getBannerThree,
} from "../api/apiRequest";
import AddBanner from "../assets/images/AddBanner.jpg";
import AddBlock from "../assets/images/AddBlock.png";

const PromoBannerGroup = ({ id, banners }) => {
  if (!banners.length) return null;

  return (
    <div className="maincontainer" id={id}>
      <div className="promo-section">
        {banners
          .slice()
          .sort(
            (first, second) =>
              Number(first.position) - Number(second.position),
          )
          .slice(0, 3)
          .map((banner, index) => (
            <div
              className={`promo-card-banner style${index + 1}`}
              key={`${id}-${banner.position || index}`}
            >
              {banner.url ? (
                <a href={banner.url}>
                  <img
                    src={banner.photo}
                    alt={`Promotional banner ${index + 1}`}
                  />
                </a>
              ) : (
                <img
                  src={banner.photo}
                  alt={`Promotional banner ${index + 1}`}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [bannerOne, setBannerOne] = useState([]);
  const [bannerTwo, setBannerTwo] = useState([]);
  const [bannerThree, setBannerThree] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.allSettled([getBannerOne(), getBannerTwo(), getBannerThree()]).then(
      ([oneResult, twoResult, threeResult]) => {
        if (!active) return;

        if (oneResult.status === "fulfilled") {
          setBannerOne(
            Array.isArray(oneResult.value?.data) ? oneResult.value.data : [],
          );
        }
        if (twoResult.status === "fulfilled") {
          setBannerTwo(
            Array.isArray(twoResult.value?.data) ? twoResult.value.data : [],
          );
        }
        if (threeResult.status === "fulfilled") {
          setBannerThree(
            Array.isArray(threeResult.value?.data)
              ? threeResult.value.data
              : [],
          );
        }
      },
    );

    return () => {
      active = false;
    };
  }, []);

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
              <Link to="/quick-order">
                <img src={AddBlock} alt="Quick order" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PromoBannerGroup id="banner1" banners={bannerOne}  />
      <div className="Endcontainer">
        

        <BrandCarousel />
        <PowerToolsSlider />

        <PromoBannerGroup id="banner2" banners={bannerTwo} />

        <BestSellers />
        <NewArrivals />

        <PromoBannerGroup id="banner3" banners={bannerThree} />

        <div className="maincontainer">
          <div className="hand-tools-wrapper">
            <div className="hand-tools-content">
              <HandTools />
            </div>
            <div className="app-banner">
              <div className="app-banner-inner" style={{ marginTop: "58px" }}>
                <a
                  href="https://mazingbusiness.com/qr/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={AddBanner} alt="Mazing Business QR" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
