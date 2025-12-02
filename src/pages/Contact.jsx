import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useNavigate, Link } from "react-router-dom";

import bannerBg from "../assets/images/innerBanner.jpg";
import Man from "../assets/images/man.png";

const Contact = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Banner background style
  const bannerStyle = {
    backgroundImage: `url(${bannerBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0",
    padding: "40px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <MainLayout>
      <section className="InnerBannerScetion" style={bannerStyle}>
        <div className="maincontainer">
          <h5>Contact Us</h5>
        </div>
      </section>

      <section className="aboutBody">
        <div className="maincontainer">
          <div className="ContactBody">
            <div className="ContactBody-lft manageProfileFrm">
              <h3>
                <Link to="/">Got a Need? </Link>Mazing Business Is Just a
                Message Away!
              </h3>

              <div className="manageProfileFrmBoxInner">
                <form class="manage-profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" placeholder="Enter first name" />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" placeholder="Enter last name" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" placeholder="Enter phone number" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="text" placeholder="Enter email address" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea placeholder="Type here"></textarea>
                    </div>
                  </div>

                  <div className="form-row">
                    <button type="submit" className="form-submit">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="ContactBody-rgt">
              <div className="tickets-hr">
                <div className="tickets-hrLft">
                  <div className="tickets-hrLft-info">
                    <h4>Connect with</h4>
                    <h4>Jhone Doe</h4>
                    <Link to="/" className="tickets-hrLft-info-btn">
                      <span>Call Now</span> +91 1234567890
                    </Link>
                  </div>
                  <div className="tickets-hrLft-info-img">
                    <img src={Man} alt="man" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
