import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images (create these imports at the top)
import no_image from "../../assets/images/no-image.png";
import hilti from "../../assets/images/hilti.png";
import multivolt from "../../assets/images/multivolt.png";
import bosch from "../../assets/images/bosch.png";
import dca from "../../assets/images/dca.png";


import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";


import { getAllCategoryGroups } from "../../api/apiRequest";
import { getLoggedInUser, getAuthToken } from "../../utils/authUtils";

const CategoryCarousel= () => {
  const [categories, setCategories] = useState([]);  
  const sliderRef = useRef(null); // Properly define the ref at the component level
const allCategories= async()=>{
try{
const response= await getAllCategoryGroups();
const result= await response.json();

if(!response.ok  || result?.res===false){
  throw new Error(
      result?.msg ||"Unable to load category groups"
  );
}

const transformedData= result.data.map((item)=>{
return {
id:item.id,
name:item.name,
img:item.photo,
};
});
setCategories(transformedData);
}
catch(error){
    console.error("Category fetch error:", error);
}
};
useEffect(()=>{
allCategories();
},[]);
  const [sliderState, setSliderState] = useState({
    currentSlide: 0,
    slideCount: categories.length,
    isMobile: false,
  });

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (current, next) => {
      setSliderState((prev) => ({ ...prev, currentSlide: next }));
    },
    swipe: sliderState.isMobile,
    draggable: sliderState.isMobile,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          swipe: false,
          draggable: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          swipe: true,
          draggable: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          swipe: true,
          draggable: true,
        },
      },
    ],
  };

  // const isPrevDisabled = sliderState.currentSlide === 0;
  // const isNextDisabled =
  //   sliderState.currentSlide >= sliderState.slideCount - settings.slidesToShow;

  const isPrevDisabled = false;
  const isNextDisabled = false;

  const renderProductImage = (product) => {
    return (
      <div className="product-img">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-product.jpg";
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="power-tools-section">
      <div className="maincontainer">
        <div className="power-tools-section-inner">
          <div className="section-header">
            <div className="section-headerLft">
              <h2>Search by Category</h2>

              <Link to="/all-categories" className="all-link" state={{ select_all_brands: true }}>
                All Categories <FiChevronRight />
              </Link>
            </div>

            <div className="section-headerRgt">
              <div className="arrow-controls">
                <button
                  className={`custom-arrow prev-arrow ${
                    isPrevDisabled ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !isPrevDisabled && sliderRef.current.slickPrev()
                  }
                  disabled={isPrevDisabled}
                  aria-label="Previous"
                >
                  ❮
                </button>
                <button
                  className={`custom-arrow next-arrow ${
                    isNextDisabled ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !isNextDisabled && sliderRef.current.slickNext()
                  }
                  disabled={isNextDisabled}
                  aria-label="Next"
                >
                  ❯
                </button>
              </div>
            </div>
          </div>

          <Slider ref={sliderRef} {...settings}>
            {categories.map((category) => (
              // <Link
              //   key={category.id}
              //   // to="/product-listing"
              //   to="/all-categories"
              //   state={{ slug: category.slug, brand_id: category.id }}
              // >
                <div key={category.id} className="product-slide">
                  <div className="brand-card">
                    {renderProductImage(category)}
                    <div className="product-info">
                      <h3>{category.name}</h3>
                      <p>{category.count}</p>
                    </div>
                  </div>
                </div>
             //</Link> 
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;

