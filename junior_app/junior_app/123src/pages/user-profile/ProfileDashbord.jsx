import React, { useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dIcon1 from "../../assets/icons/dIcon1.svg";
import dIcon2 from "../../assets/icons/dIcon2.svg";
import dIcon3 from "../../assets/icons/dIcon3.svg";
import Shape from "../../assets/icons/Shape.svg";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { date: "Mon", value: 12 },
  { date: "Tue", value: 18 },
  { date: "Wed", value: 22 },
  { date: "Thu", value: 19 },
  { date: "Fri", value: 25 },
  { date: "Sat", value: 28 },
  { date: "Sun", value: 15 },
];

const monthlyData = [
  { date: "01/06", value: 18 },
  { date: "05/06", value: 22 },
  { date: "10/06", value: 8 },
  { date: "15/06", value: 27 },
  { date: "20/06", value: 24 },
  { date: "25/06", value: 16 },
  { date: "30/06", value: 45 },
];

const yearlyData = [
  { date: "Jan", value: 130 },
  { date: "Feb", value: 170 },
  { date: "Mar", value: 140 },
  { date: "Apr", value: 200 },
  { date: "May", value: 240 },
  { date: "Jun", value: 210 },
  { date: "Jul", value: 260 },
];

const ProfileDashbord = () => {
  const [view, setView] = useState("Monthly");
  const [date, setDate] = useState(new Date());

  const getChartData = () => {
    if (view === "Weekly") return weeklyData;
    if (view === "Yearly") return yearlyData;
    return monthlyData;
  };

  const orders = [
    { date: "6 Jul", time: "12:00", code: "202406828–11320758" },
    { date: "6 Jul", time: "13:10", code: "202406828–11320758" },
    { date: "6 Jul", time: "15:27", code: "202406828–11320758" },
    { date: "6 Jul", time: "18:15", code: "202406828–11320758" },
    { date: "6 Jul", time: "20:34", code: "202406828–11320758" },
  ];

  return (
    <UserProfileLayout>
      <div className="dashboard-container">
        <div className="dashboard-container-Lft">
          <div className="dashboard-cards">
            <div className="card products">
              <h5>Products</h5>
              <span>In your cart</span>
              <h2>03</h2>
              <div className="card-Shape">
                <img src={Shape} alt="Shape" />
              </div>
              <div className="card-icon">
                <img src={dIcon1} alt="dIcon1" />
              </div>
            </div>
            <div className="card orders">
              <h5>Orders</h5>
              <span>Total order placed</span>
              <h2>530</h2>
              <div className="card-Shape">
                <img src={Shape} alt="Shape" />
              </div>
              <div className="card-icon">
                <img src={dIcon2} alt="dIcon2" />
              </div>
            </div>
            <div className="card pending">
              <h5>Pending</h5>
              <span>Total pending order</span>
              <h2>250</h2>
              <div className="card-Shape">
                <img src={Shape} alt="Shape" />
              </div>
              <div className="card-icon">
                <img src={dIcon3} alt="dIcon3" />
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <h4>Order Graph Representation</h4>
              <div className="filter-buttons">
                {["Weekly", "Monthly", "Yearly"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setView(item)}
                    className={view === item ? "active" : ""}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0072BC"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-container-Rgt">
          <div className="calendar-section">
            <div className="calendar-header">
              {/* <h4>
                {date.toLocaleDateString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h4> */}
            </div>
            <Calendar onChange={setDate} value={date} />

            <div className="order-list">
              {orders.map((order, idx) => (
                <div key={idx} className="order-item">
                  <span className="order-date">
                    <em>{order.date}</em>
                    <br /> {order.time}
                  </span>
                  <div className="order-info">
                    <span className="order-code">
                      <label> Order Code :</label> {order.code}
                    </span>
                    <div className="order-status">Has been placed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileDashbord;
