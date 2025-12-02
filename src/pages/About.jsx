import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";

import bannerBg from "../assets/images/innerBanner.jpg";

const AboutUs = () => {
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
          <h5>About Us</h5>
        </div>
      </section>

      <section className="aboutBody">
        <div className="maincontainer">
          <div className="about-us-header">
            <p className="subtitle">Marine Business Terms & Conditions</p>
            <p className="effective-date">Effective April 12, 2024</p>
          </div>
          <div className="about-us-content">
            <div className="tabs-container">
              <div
                className={`tab-title ${activeTab === 0 ? "active" : ""}`}
                onClick={() => setActiveTab(0)}
              >
                Introduction
              </div>
              <div
                className={`tab-title ${activeTab === 1 ? "active" : ""}`}
                onClick={() => setActiveTab(1)}
              >
                Your relationship with Marine Business
              </div>
              <div
                className={`tab-title ${activeTab === 2 ? "active" : ""}`}
                onClick={() => setActiveTab(2)}
              >
                Content in Marine business products
              </div>
              <div
                className={`tab-title ${activeTab === 3 ? "active" : ""}`}
                onClick={() => setActiveTab(3)}
              >
                About those terms
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 0 && (
                <div>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularized in the 1960s with
                    the release of Letterset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularized in the 1960s with
                    the release of Letterset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularized in the 1960s with
                    the release of Letterset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularized in the 1960s with
                    the release of Letterset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularized in the 1960s with
                    the release of Letterset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
              )}

              {activeTab === 3 && (
                <div>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularized in the 1960s with
                    the release of Letterset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                  <h2>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutUs;
