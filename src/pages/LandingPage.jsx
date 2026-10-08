import React, { useEffect, useState } from "react";
import Logo from "../assets/images/Logo.svg";
import BrandCarousel from "../components/BrandCarousel";
import PowerToolsSlider from "../components/PowerToolsSlider";
import CategoryCarousel from "../components/user-profile/CategoryCarousel";
import flagEN from "../assets/icons/flag-icon/ind.svg";
import playStore from "../assets/images/GooglePlay.png";
import appstore from "../assets/images/AppStore.png";
import { FaLock } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { submitCustomerEnquiry } from "../api/apiRequest";
const LandingPage = () => {
  const [isShopkeeper, setIsShopkeeper] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const handleGetOffers = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await submitCustomerEnquiry({
        is_shopkeeper: isShopkeeper ? 1 : 0,
        name: companyName,
        phone: phone,
        gstin: isShopkeeper ? gstin : null,
        state: state,
        city: city,
      });
      console.log("Enquiry submitted:", data);
      // clear form data input after succesful submission

      setCompanyName("");
      setPhone("");
      setGstin("");
      setState("");
      setCity("");
      setShowModal(true);
    } catch (error) {
      console.error("Enquiry submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <img src={Logo} alt="Mazing Business" className="landing-logo" />
        </div>
      </header>
      {/*Brands Section*/}
      <section className="brands-section">
        <BrandCarousel disabledNavigation={true} />
      </section>

      <section className="offer-sections">
        <div className="offer-container">
          {/* Left Side*/}
          {/*SHOPKEEPER*/}
          <form className="offer-form" onSubmit={handleGetOffers}>
            <label className="shopkeeper-label">Are you a shopkeeper?</label>

            <div className="shopkeeper-options">
              <label className="radio-button">
                <input
                  type="radio"
                  name="shopkeeper"
                  checked={isShopkeeper}
                  onChange={() => setIsShopkeeper(true)}
                />
                <span>Yes, I am a shopkeeper</span>
              </label>

              <label className="radio-button">
                <input
                  type="radio"
                  name="shopkeeper"
                  checked={!isShopkeeper}
                  onChange={() => setIsShopkeeper(false)}
                />
                <span>No, I am an not a shopkeeper</span>
              </label>
            </div>
            <div className="form-groups  full-width">
              <label>
                {isShopkeeper ? "Company Name " : "Your Name"}
                <span>*</span>
              </label>
              <input
                type="text"
                placeholder={
                  isShopkeeper ? "Enter your company Name " : "Enter your name"
                }
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                }}
                required
              />
              {/*Phone Number*/}
            </div>
            <div className="form-rows">
              <div className="form-groups  phone-number">
                <label>
                  Phone Number
                  <span>*</span>
                  {phone.length > 0 && phone.length !== 10 && (
                    <span className="phone-error">
                      Phone number must contain 10 digits
                    </span>
                  )}
                </label>

                <div className="phone-inputs">
                  <div className="country-code">
                    <img src={flagEN} alt="India" />
                    <span>+91</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter your phone number"
                    value={phone}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPhone(value);
                    }}
                    required
                  />
                </div>
              </div>
              {/*GSTIN*/}
              <div className="form-groups">
                <label>
                  GSTIN
                  {!isShopkeeper && (
                    <span className="skip-gstin">Skip if not a shopkeeper</span>
                  )}
                  {isShopkeeper && gstin.length > 0 && gstin.length !== 15 && (
                    <span className="phone-error">
                      GSTIN must contain 15 characters
                    </span>
                  )}
                </label>

                <input
                  type="text"
                  placeholder="Enter your GSTIN"
                  disabled={!isShopkeeper}
                  value={gstin}
                  maxLength={15}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setGstin(value);
                  }}
                  required={isShopkeeper}
                />
              </div>
            </div>

            <div className="form-rows">
              {/* State */}
              <div className="form-groups">
                <label>
                  State <span>*</span>
                </label>

                <select
                  name="state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>
                    Select state
                  </option>

                  {indianStates.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
              </div>
              {/*City*/}
              <div className="form-groups">
                <label> City</label>
                <input
                  type="text"
                  placeholder="Enter your City"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                  }}
                  required
                />
              </div>
            </div>

            <button
              className="get-offers-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting" : "Get Offers"}
            </button>

            <div className="privacy-text">
              <FaLock className="privacy-icon" />
              We respect your privacy.Your information is safe with us.
            </div>
          </form>
          <div className="offer-contents">
            <div className="download-app">
              <h2>Download App</h2>
            </div>
            <div className="store-buttons">
              <div className="store-items">
                <h3>Android</h3>

                <a href="https://play.google.com/store/apps/details?id=com.ace.tools&pcampaignid=web_share">
                  <img src={playStore} alt="Get it on Play Store" />
                </a>
              </div>
              <div className="store-items">
                <h3> iOS</h3>
                <a
                  href="https://apps.apple.com/in/app/mazing-business/id6447095538"
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <img src={appstore} alt="Get it On App Store" />
                </a>
              </div>
            </div>

            <div className="opel-buttons">
              <button
                onClick={() =>
                  window.open(
                    "https://mazingbusiness.com/mazing_laravel/public/opel_catalogue/Opel%20new%20catalogue.pdf",
                    "_blank",
                  )
                }
              >
                Opel Power Tools Catalogue
              </button>
              <button
                onClick={() =>
                  window.open(
                    "https://mazingbusiness.com/mazing_laravel/public/construction_catalogue/Opel%202026%20brochure.pdf",
                    "_blank",
                  )
                }
              >
                Construction Machinery Catalogue
              </button>
            </div>
            <p className="website-text">
              If you want more information, visit our website.
              <a
                href="https://www.mazingbusiness.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.mazingbusiness.com
              </a>
            </p>
          </div>
        </div>
      </section>
      {showModal && (
        <div className="offer-modal-overlay">
          <div className="offers-modal">
            <div>
              <h2 className="data-text">DATA SUBMITTED SUCCESSFULLY</h2>
            </div>
            <div className="download-app">
              <h2>Download App</h2>
            </div>
            <div className="store-buttons">
              <div className="store-items">
                <h3>Android</h3>

                <a href="https://play.google.com/store/apps/details?id=com.ace.tools&pcampaignid=web_share">
                  <img src={playStore} alt="Get it on Play Store" />
                </a>
              </div>
              <div className="store-items">
                <h3> iOS</h3>
                <a
                  href="https://apps.apple.com/in/app/mazing-business/id6447095538"
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <img src={appstore} alt="Get it On App Store" />
                </a>
              </div>
            </div>

            <div className="opel-buttons">
              <button
                onClick={() =>
                  window.open(
                    "https://mazingbusiness.com/mazing_laravel/public/opel_catalogue/Opel%20new%20catalogue.pdf",
                    "_blank",
                  )
                }
              >
                Opel Power Tools Catalogue
              </button>
              <button
                onClick={() =>
                  window.open(
                    "https://mazingbusiness.com/mazing_laravel/public/construction_catalogue/Opel%202026%20brochure.pdf",
                    "_blank",
                  )
                }
              >
                Construction Machinery Catalogue
              </button>
            </div>
            <p className="website-text">
              If you want more information, visit our website.
              <a
                href="https://www.mazingbusiness.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.mazingbusiness.com
              </a>
            </p>
            <button
              className="offers-modal-close"
              onClick={() => setShowModal(false)}
            >
              <IoIosCloseCircle />
            </button>
          </div>
        </div>
      )}
      {/* Categories Section */}
      <section className="category-section">
        <CategoryCarousel />
      </section>
    </div>
  );
};

export default LandingPage;
