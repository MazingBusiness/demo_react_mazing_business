import React, { useState } from "react";

const OfferCard = ({ title, description, type, details, onApply, img }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="offer-card">
      <div className="offer-header">
        <div className="offer-type">
          <span>{type}</span>
        </div>
        <div className="offer-content">
          <div className="offer-content-hr">
            <div className="offer-content-hr-lft">
              <span className="logoArea">
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-product.jpg";
                  }}
                />
              </span>
              <span className="offerinfo">
                <h4>{title}</h4>
                <p className="offer-description">
                  Offer Description: {description}
                </p>
              </span>
            </div>
            <span className="apply-btn" onClick={onApply}>
              APPLY
            </span>
          </div>

          <div className="Offer-more-info">
            <div className="offer-actions">
              <p>Click more to get details</p>
              <span
                className="toggle-more"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "- LESS" : "+ MORE"}
              </span>
            </div>

            {expanded && (
              <div className="offer-details">
                {details.map((item, idx) => (
                  <div key={idx} className="offer-detail-item">
                    <div className="offer-detail-item-lft">
                      <div className="offer-detail-item-lft-inner">
                        <span className="Idnumber">
                          <img
                            src={item.productImg}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </span>

                        <div className="offer-detail-item-lft-inner-rgt">
                          <h5>{item.name}</h5>
                          <p>
                            Minimum Quantity: {item.minQty}
                            <br />
                            <span
                              dangerouslySetInnerHTML={{ __html: item.note }}
                              style={{ color: "red" }}
                            />
                          </p>
                        </div>
                      </div>
                    </div>

                    <span>₹ {item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
