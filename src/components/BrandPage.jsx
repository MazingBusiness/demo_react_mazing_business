import React, { useEffect, useState } from 'react'
import no_image from "../assets/images/no-image.png";
import Header from "../layouts/Header"
import Footer from '../layouts/Footer';
import quickButton from "../assets/icons/QuickButton.svg";
import { Link } from 'react-router-dom';
import searchIcon from "../assets/icons/SearchIcon.svg";
import { getBrands } from '../api/apiRequest';

const BrandPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const isQuickOrderPage = location.pathname == "/quick-order"

  // api to get brands  
  const getBrandsFromAPI = async () => {
    try {
      const apiResponse = await getBrands();
      const responseData = await apiResponse.json();
      setBrands(responseData.data);
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  };

  const filterBrands = brands.filter((brand) => (
    brand.name.toLowerCase().includes(search.toLowerCase()) // if the user search in lowercase than also results generated
  ));

  useEffect(() => {
    getBrandsFromAPI();
  }, []);

  if (loading == true) {
    return <h3 className='loader'>Loading......</h3>;
  }

  return (
    <>
      <Header />
      <div className='wrapper'>
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
      </div>

      <Footer />
      <div className="floating-buttons">
        {!isQuickOrderPage && (
          <Link to="/quick-order" className="quick-order-btn">
            <img src={quickButton} alt="Quick Order" />
          </Link>
        )}
      </div>
    </>
  )
}

export default BrandPage

