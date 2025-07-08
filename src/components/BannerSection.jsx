import React, { useRef, useState , useEffect} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Import banner images
// Import banner images (adjust paths as needed)
import banner1 from "../assets/images/Slider.jpg";
import banner2 from "../assets/images/Slider.jpg";
import sideBox from "../assets/images/quick-order.gif";

import {getAllSliders} from "../api/apiRequest";

// const banners = [
//   {
//     img: banner1,
//     title: "Demolished Your Toughest Jobs Effortlessly",
//     desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
//     btnText: "Shop Now",
//   },
//   {
//     img: banner1,
//     title: "Demolished Your Toughest Jobs Effortlessly",
//     desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
//     btnText: "Shop Now",
//   },
// ];

const BannerSection = () => {  
  const [bannersDetails,setBannersDetails] = useState([]);
  const sliderRef = useRef();
  const [currentSlide, setCurrentSlide] = useState(0);

  // get all banner information
  const allSliders = async () => {
    try {
      let apiRes = await getAllSliders();
      let responseData = await apiRes.json();
      if (responseData.res) {
        const transformedData = responseData.data.map(item => ({
          img: item.photo,
          title: "",
          // desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
          // btnText: "Shop Now",
          url: item.url, // optional, if you want to use it on button click
        }));
        // Set in state
        setBannersDetails(transformedData);
        setBannersText(responseData.banner_below_text ?? ""); // safe fallback
        console.log(bannersDetails.length);
      } else {
        NotificationManager.error(responseData.msg, '', 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const [slideCount, setSlideCount] = useState(bannersDetails.length);
  const [bannersText,setBannersText] = useState([]);  

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    beforeChange: (current, next) => setCurrentSlide(next),
    afterChange: (current) => setCurrentSlide(current),
    onInit: () => setSlideCount(bannersDetails.length),
  };

  // const isPrevDisabled = currentSlide === 0;
  // const isNextDisabled = currentSlide >= slideCount - 1;

  const isPrevDisabled = false;
  const isNextDisabled = false;

  useEffect(() => {
    allSliders();
  },[]);

  useEffect(() => {
    setSlideCount(bannersDetails.length); // Update count when banners load
  }, [bannersDetails]);

  return (
    <div className="banner-section">
      <div className="maincontainer">
        <div className="banner-section-inner">
          <div className="banner-wrapper">
            <div className="main-banner">
              <Slider ref={sliderRef} {...settings}>
                {bannersDetails.map((banner, index) => {
                  const content = (
                    <>
                      <img
                        src={banner.img}
                        alt="Banner"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/1200x400?text=Banner+Image";
                        }}
                      />
                      <div className="banner-content">
                        <h2>
                          <span>{banner.title}</span>{" "}
                          <span className="highlight">{banner.highlight}</span>{" "}
                          {/* <span>{banner.subtitle}</span> */}
                        </h2>
                        {/* <p>{banner.desc}</p>
                        <button className="banner-btn">{banner.btnText}</button> */}
                      </div>
                    </>
                  );

                  return (
                    <div key={index} className="banner-slide">
                      {banner.url ? (
                        <a href={banner.url} target="_blank" rel="noopener noreferrer">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </Slider>
              {/* Custom Arrows with your preferred style */}
              <div className="arrow-controls">
                <button className="custom-arrow prev-arrow" onClick={() => sliderRef.current.slickPrev()} >
                  <FaChevronLeft />
                </button>
                <button className="custom-arrow next-arrow" onClick={() => sliderRef.current.slickNext()} >
                  <FaChevronRight />
                </button>
              </div>
            </div>
            <div className="side-banner">
              <img src={sideBox} alt="Side Box"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x400?text=Side+Banner";
                  }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
