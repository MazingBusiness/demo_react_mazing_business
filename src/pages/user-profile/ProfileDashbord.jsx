import React, { useEffect, useMemo, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Link } from "react-router-dom";
import dIcon1 from "../../assets/icons/dIcon1.svg";
import dIcon2 from "../../assets/icons/dIcon2.svg";
import dIcon3 from "../../assets/icons/dIcon3.svg";
import Shape from "../../assets/icons/Shape.svg";

import {
  cart,
  getMyOrders,
  getTotalOrderCount,
  getAllPendingOrderCount,
  getCurrentOrder,
} from "../../api/apiRequest";

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

// ✅ helper in same file
function formatOrderDateTime(order) {
  const d = order?.created_at
    ? new Date(order.created_at)
    : order?.date
    ? new Date(Number(order.date) * 1000)
    : null;

  if (!d || isNaN(d.getTime())) {
    return { dateText: "-", timeText: "-" };
  }

  const dateText = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeText = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { dateText, timeText };
}

/***********************
 * ✅ Graph Helpers
 ***********************/
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pad2 = (n) => String(n).padStart(2, "0");

const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ✅ pick which date you want for grouping
// using created_at by default; if you prefer unix `date`, uncomment that line.
const getOrderDate = (o) => {
  if (o?.created_at) return new Date(o.created_at);
  if (o?.date) return new Date(Number(o.date) * 1000);
  return null;
};

// Monday-start week
const getMondayStart = (d) => {
  const date = new Date(d);
  const day = date.getDay(); // Sun=0, Mon=1...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function buildWeeklyData(orders) {
  // current week (Mon..Sun)
  const now = new Date();
  const monday = getMondayStart(now);

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((label, idx) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + idx);
    return { label, dd, sum: 0 };
  });

  orders.forEach((o) => {
    const dt = getOrderDate(o);
    if (!dt || isNaN(dt.getTime())) return;

    const total = toNumber(o.grand_total);
    days.forEach((d) => {
      if (sameDay(dt, d.dd)) d.sum += total;
    });
  });

  return days.map((d) => ({ date: d.label, value: Math.round(d.sum) }));
}

function buildMonthlyData(orders) {
  // current month day-wise
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();

  const bins = Array.from({ length: lastDay }, (_, i) => ({
    day: i + 1,
    value: 0,
  }));

  orders.forEach((o) => {
    const dt = getOrderDate(o);
    if (!dt || isNaN(dt.getTime())) return;
    if (dt.getFullYear() !== y || dt.getMonth() !== m) return;

    bins[dt.getDate() - 1].value += toNumber(o.grand_total);
  });

  const mm = pad2(m + 1);
  return bins.map((b) => ({
    date: `${pad2(b.day)}/${mm}`,
    value: Math.round(b.value),
  }));
}

function buildYearlyData(orders) {
  // current year month-wise
  const y = new Date().getFullYear();
  const bins = monthShort.map((label) => ({ date: label, value: 0 }));

  orders.forEach((o) => {
    const dt = getOrderDate(o);
    if (!dt || isNaN(dt.getTime())) return;
    if (dt.getFullYear() !== y) return;

    bins[dt.getMonth()].value += toNumber(o.grand_total);
  });

  return bins.map((b) => ({ ...b, value: Math.round(b.value) }));
}

const ProfileDashbord = () => {
  const [view, setView] = useState("Monthly");
  const [date, setDate] = useState(new Date());

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const [totalOrder, setTotalOrder] = useState(0);
  const [totalPendingOrder, setTotalPendingOrder] = useState(0);

  // ✅ API orders state (for right side order list)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // ✅ current-year orders state (for graph)
  const [currentYearOrders, setCurrentYearOrders] = useState([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState("");

  /***********************
   * ✅ Graph data (dynamic)
   ***********************/
  const weeklyData = useMemo(
    () => buildWeeklyData(currentYearOrders),
    [currentYearOrders]
  );

  const monthlyData = useMemo(
    () => buildMonthlyData(currentYearOrders),
    [currentYearOrders]
  );

  const yearlyData = useMemo(
    () => buildYearlyData(currentYearOrders),
    [currentYearOrders]
  );

  const chartData = useMemo(() => {
    if (view === "Weekly") return weeklyData;
    if (view === "Yearly") return yearlyData;
    return monthlyData;
  }, [view, weeklyData, monthlyData, yearlyData]);

  /***********************
   * ✅ APIs
   ***********************/
  const cartData = async () => {
    try {
      const responseData = await cart();
      if (responseData.res) {
        const cart_item = responseData.cart_item || [];
        setCartItems(cart_item);
        setCartCount(cart_item.length);
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

  const fetchTotalOrderCount = async () => {
    try {
      const responseData = await getTotalOrderCount();
      if (responseData.res) {
        setTotalOrder(responseData.totalOrder || 0);
      }
    } catch (error) {
      console.error("Fetch total order error:", error);
    }
  };

  // ✅ FIXED bug here
  const pendingOrderCount = async () => {
    try {
      const responseData = await getAllPendingOrderCount();
      if (responseData.res) {
        const pending = responseData.total_pending_order_count || 0;
        setTotalPendingOrder(pending);
      }
    } catch (error) {
      console.error("Fetch pending order error:", error);
    }
  };

  // ✅ load orders from API (for order list)
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await getMyOrders({ page: 1, per_page: 10 });

      if (!res?.res) {
        setOrders([]);
        setOrdersError(res?.msg || "Failed to load orders.");
        return;
      }

      const pageData = res?.data;
      setOrders(pageData?.data || []);
    } catch (e) {
      setOrdersError(e?.message || "Something went wrong while loading orders.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ✅ load current year orders for chart
  const fetchCurrentYearOrders = async () => {
    setGraphLoading(true);
    setGraphError("");
    try {
      const res = await getCurrentOrder(); // {res,msg,data:[...]}

      if (!res?.res) {
        setCurrentYearOrders([]);
        setGraphError(res?.msg || "Failed to load current year orders.");
        return;
      }

      setCurrentYearOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setGraphError(e?.message || "Something went wrong while loading graph data.");
      setCurrentYearOrders([]);
    } finally {
      setGraphLoading(false);
    }
  };

  useEffect(() => {
    cartData();
    fetchTotalOrderCount();
    pendingOrderCount();
    fetchOrders();
    fetchCurrentYearOrders();
  }, []);

  return (
    <UserProfileLayout>
      <div className="dashboard-container">
        <div className="dashboard-container-Lft">
          <div className="dashboard-cards">
            <div className="card products">
              <h5>Products</h5>
              <span>In your cart</span>
              <h2>{cartCount}</h2>
              <div className="card-Shape">
                <img src={Shape} alt="Shape" />
              </div>
              <div className="card-icon">
                <img src={dIcon1} alt="dIcon1" />
              </div>
            </div>

            <div className="card orders">
              <h5>Order</h5>
              <span>Total order placed</span>
              <h2>{totalOrder}</h2>
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
              <h2>{totalPendingOrder}</h2>
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
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {graphLoading && <div className="p-2">Loading graph...</div>}
            {!!graphError && <div className="p-2 text-danger">{graphError}</div>}

            {!graphLoading && !graphError && (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="dashboard-container-Rgt">
          <div className="calendar-section">
            <div className="calendar-header"></div>
            <Calendar onChange={setDate} value={date} />

            {/* ✅ Orders from API */}
            <div className="order-list">
              {ordersLoading && <div className="p-2">Loading orders...</div>}
              {!!ordersError && <div className="p-2 text-danger">{ordersError}</div>}

              {!ordersLoading && !ordersError && orders.length === 0 && (
                <div className="p-2">No orders found.</div>
              )}

              {orders.map((order) => {
                const { dateText, timeText } = formatOrderDateTime(order);

                return (
                  <Link
                    key={order.id}
                    to="/profile-order-details"
                    state={{ orderId: order.id, code: order.code }}
                    className="ordertbl-icon-btn view"
                    title="View"
                  >
                    <div className="order-item">
                      <span className="order-date">
                        <em>{dateText}</em>
                        <br /> {timeText}
                      </span>

                      <div className="order-info">
                        <span className="order-code">
                          <label> Order Code :</label> {order.code}
                        </span>

                        <div className="order-status">
                          {order.delivery_status || "Has been placed"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileDashbord;
