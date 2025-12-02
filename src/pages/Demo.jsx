import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

// Sample Data
const topSellingProducts = [
  {
    id: 1,
    name: "Product 1",
    price: "₹2,000",
    sold: 140,
    img: "/img/product1.png",
  },
  {
    id: 2,
    name: "Product 2",
    price: "₹3,000",
    sold: 150,
    img: "/img/product2.png",
  },
  {
    id: 3,
    name: "Product 3",
    price: "₹1,800",
    sold: 120,
    img: "/img/product3.png",
  },
  {
    id: 4,
    name: "Product 4",
    price: "₹2,500",
    sold: 160,
    img: "/img/product4.png",
  },
  {
    id: 5,
    name: "Product 5",
    price: "₹1,900",
    sold: 130,
    img: "/img/product5.png",
  },
];

const reviews = [
  {
    id: 1,
    name: "Anjali Mehta",
    date: "May 10, 2025",
    rating: 5,
    comment: "Lightweight and easy to handle...",
    avatar: "/img/user1.png",
  },
  {
    id: 2,
    name: "Ravi Sharma",
    date: "May 10, 2025",
    rating: 4,
    comment: "Very reliable tool for everyday jobs...",
    avatar: "/img/user2.png",
  },
  {
    id: 3,
    name: "Manoj Tiwari",
    date: "May 10, 2025",
    rating: 5,
    comment: "Perfect drill for wet work...",
    avatar: "/img/user3.png",
  },
  {
    id: 4,
    name: "Pooja Reddy",
    date: "May 10, 2025",
    rating: 2,
    comment: "The drill made my wall shelf project easy...",
    avatar: "/img/user4.png",
  },
];

const Demo = () => {
  const [activeTab, setActiveTab] = useState("Reviews");

  return (
    <div
      className="product-details-page"
      style={{ display: "flex", padding: "20px" }}
    >
      {/* Left: Top Selling Products */}
      <div
        className="top-products"
        style={{ width: "25%", marginRight: "20px" }}
      >
        <h3>Top Selling Products</h3>
        {topSellingProducts.map((p) => (
          <div key={p.id} style={{ display: "flex", marginBottom: "15px" }}>
            <img
              src={p.img}
              alt={p.name}
              style={{ width: "60px", height: "60px", marginRight: "10px" }}
            />
            <div>
              <h5>{p.name}</h5>
              <p>
                {p.price} | Sold: {p.sold}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right: Product Details */}
      <div className="product-info" style={{ width: "75%" }}>
        {/* Tabs */}
        <div className="tabs" style={{ display: "flex", marginBottom: "20px" }}>
          {["Description", "Specification", "Reviews", "Others"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 15px",
                borderBottom: activeTab === tab ? "2px solid blue" : "none",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "Reviews" && (
            <>
              {/* Average Rating */}
              <div className="average-rating" style={{ marginBottom: "20px" }}>
                <h4>Average Rating</h4>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "24px", marginRight: "10px" }}>
                    3.0
                  </span>
                  <div>
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color={i < 3 ? "#FFD700" : "#ccc"} />
                    ))}
                  </div>
                </div>
                {/* Horizontal bar example */}
                <div style={{ marginTop: "10px" }}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "5px 0",
                      }}
                    >
                      <span style={{ width: "20px" }}>{star} ★</span>
                      <div
                        style={{
                          background: "#eee",
                          height: "10px",
                          flex: 1,
                          marginLeft: "5px",
                        }}
                      >
                        <div
                          style={{
                            width: `${star * 20}%`,
                            height: "100%",
                            background: "#4caf50",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Feedback */}
              <div className="reviews-section">
                <h4>Customer Feedback</h4>
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{ display: "flex", marginBottom: "15px" }}
                  >
                    <img
                      src={r.avatar}
                      alt={r.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <div>
                      <h5>
                        {r.name}{" "}
                        <span style={{ color: "#888", fontSize: "12px" }}>
                          {r.date}
                        </span>
                      </h5>
                      <div>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            color={i < r.rating ? "#FFD700" : "#ccc"}
                          />
                        ))}
                      </div>
                      <p>{r.comment}</p>
                    </div>
                  </div>
                ))}
                <button
                  style={{
                    padding: "10px 15px",
                    background: "blue",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Add a Review
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;
