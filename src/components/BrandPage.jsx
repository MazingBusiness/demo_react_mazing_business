import React, { useEffect, useState } from 'react'
import no_image from "../assets/images/no-image.png";

import quickButton from "../assets/icons/QuickButton.svg";
import { Link, useLocation } from 'react-router-dom';
import searchIcon from "../assets/icons/SearchIcon.svg";
import { getAllBrands } from '../api/apiRequest';
import MainLayout from '../layouts/MainLayout';
import { useLoading } from "../context/LoadingContext";

const BrandPage = () => {
  const { startLoading, stopLoading } = useLoading();
  const location = useLocation();
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [brandLoading, setBrandLoading] = useState(true);

  // api to get brands
  const getBrandsFromAPI = async () => {
    startLoading();
    setBrandLoading(true);
    setError("");

    try {
      const apiResponse = await getAllBrands();

      // Too many requests
      if (apiResponse.status === 429) {
        setError("Too many requests. Please try again after 5 seconds");
        setBrands([]);
        return;
      }

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const responseData = await apiResponse.json();
      console.log("Brand API Response:", responseData);

      if (Array.isArray(responseData?.data)) {
        setBrands(responseData.data);
      } else {
        setError("Unable to load brands.");
        setBrands([]);
      }
    } catch (error) {
      console.error("Brand API Error:", error);
      setError("Unable to load brands. Please try again.");
      setBrands([]);
    } finally {
      stopLoading();
      setBrandLoading(false);
    }
  };

  useEffect(() => {
    if (brandLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [brandLoading]);

  const filterBrands = brands.filter((brand) => (
    // if the user searches in lowercase, results are also generated
    brand.name.toLowerCase().includes(search.toLowerCase())
  ));

  useEffect(() => {
    getBrandsFromAPI();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <MainLayout>
      <div className="brand-page-wrapper">
        {error ? (
          <div className='brand-error'>
            <h2>Unable to load brands</h2>
            <p>{error}</p>
            <button onClick={getBrandsFromAPI}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className='search-box'>
              <div className="search-wrapper">
                <input
                  type='text'
                  placeholder='Enter Brands Name'
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                  }}
                >
                </input>
                <img
                  src={searchIcon}
                  alt="SearchIcon"
                  className='search-icon'
                />
              </div>
            </div>

            <div className='container'>
              {filterBrands.map((brand) => (
                <Link
                  to="/quick-order"
                  state={{
                    brand_id: brand.id,
                  }}
                >
                  <div className='card' key={brand.id}>
                    <img
                      src={brand.banner_image?.file_name || no_image}
                      alt={brand.name}
                      className='image'
                      loading='lazy'
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = no_image;
                      }}
                    />

                    <h2>{brand.name}</h2>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default BrandPage
