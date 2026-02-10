import React, { useEffect, useMemo, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import InvoiceBtn from "../../assets/icons/InvoiceBtn.svg";

import { getOrderDetails, downloadInvoice } from "../../api/apiRequest";

const safeJsonParse = (val) => {
  try {
    if (!val) return null;
    if (typeof val === "object") return val;
    return JSON.parse(val);
  } catch {
    return null;
  }
};

const formatDateTime = (unixSeconds) => {
  const sec = Number(unixSeconds);
  if (!Number.isFinite(sec) || sec <= 0) return "-";
  const d = new Date(sec * 1000);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const money = (n) => `₹ ${Number(n || 0).toFixed(2)}`;

const ProfileOrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // coming from Link state
  const orderId = location?.state?.orderId;
  const orderCodeFromState = location?.state?.code;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderRes, setOrderRes] = useState(null);

  useEffect(() => {
    if (!orderId) {
      // if user directly opens this page without state
      setError("Order id not found. Please open from Purchase History.");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getOrderDetails(orderId);
        if (!res?.res) {
          setError(res?.msg || "Failed to load order details.");
          setOrderRes(null);
          return;
        }
        setOrderRes(res);
      } catch (e) {
        setError(e?.message || "Something went wrong.");
        setOrderRes(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [orderId]);

  const order = orderRes?.order || null;
  const details = order?.order_details || [];
  const shipping = useMemo(() => safeJsonParse(order?.shipping_address), [order?.shipping_address]);

  const subtotal = useMemo(() => {
    // if you have line totals from backend use that, else calculate:
    return details.reduce((sum, row) => sum + Number(row?.price || 0), 0);
  }, [details]);

  const orderCode = order?.code || orderCodeFromState || `#${orderId}`;

  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleInvoice = async () => {
    if (!order?.id || invoiceLoading) return;

    setInvoiceLoading(true);
    try {
      const res = await downloadInvoice(order.id); // calls: user/download-invoice?id=13780
      const pdfUrl = res?.pdf_url;

      if (!pdfUrl) {
        alert("Invoice PDF not found.");
        return;
      }

      // ✅ open PDF in new tab
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e?.message || "Failed to download invoice.");
    } finally {
      setInvoiceLoading(false);
    }
  };


  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="breadcrumb">
              <Link to="/profile-order">
                <IoIosArrowBack />
                Purchase History
              </Link>
              / Order Id: <span>{orderCode}</span>
            </div>
          </div>

          <div className="orderdetailsHrRgt">
            <button className={`invoice-btn ${invoiceLoading ? "loading" : ""}`} type="button" onClick={handleInvoice} disabled={invoiceLoading}  title="Download Invoice" >
              {invoiceLoading ? (
                <span className="btn-spinner" aria-label="Loading" />
              ) : (
                <img src={InvoiceBtn} alt="Invoice" />
              )}
            </button>
          </div>
        </div>

        {loading && <div style={{ padding: 12 }}>Loading order details...</div>}
        {!loading && error && <div style={{ padding: 12, color: "red" }}>{error}</div>}

        {/* ✅ Order Items Table */}
        {!loading && !error && (
          <>
            <div className="order-section">
              <h3>Order Details</h3>

              <table className="order-table">
                <thead>
                  <tr>
                    <th>SL No</th>
                    <th>Product</th>
                    <th>Part No</th>
                    <th>Order Quantity</th>
                    <th>Approved Quantity</th>
                    <th>Rate</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {details.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: 12 }}>
                        No items found
                      </td>
                    </tr>
                  ) : (
                    details.map((row, idx) => {
                      const productName = row?.product?.name || "-";
                      const partNo = row?.product?.part_no || "-";
                      const qty = row?.quantity ?? "-";
                      const approvedQty = row?.approved_quantity ?? "-";

                      // rate logic: if backend gives approved_rate use it else use unit price
                      const rate =
                        row?.approved_rate ??
                        row?.product?.unit_price ??
                        (Number(row?.price || 0) / (Number(row?.quantity || 1)));

                      // line price: backend `price` looks like total for that line
                      const linePrice = row?.price ?? 0;

                      const statusText = row?.delivery_status || order?.delivery_status || "pending";
                      const statusClass =
                        String(statusText).toLowerCase() === "approved"
                          ? "approved"
                          : String(statusText).toLowerCase() === "delivered"
                          ? "approved"
                          : "pending";

                      return (
                        <tr key={row?.id || idx}>
                          <td>{String(idx + 1).padStart(2, "0")}</td>
                          <td>{productName}</td>
                          <td>{partNo}</td>
                          <td>{qty}</td>
                          <td>{approvedQty}</td>
                          <td>{money(rate)}</td>
                          <td>{money(linePrice)}</td>
                          <td>
                            <span className={`status ${statusClass}`}>{statusText}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ Summary Boxes */}
            <div className="order-info-grid">
              <div className="order-info-gridLft">
                <div className="order-box">
                  <h4>Order Summary</h4>
                  <div className="order-box-inner">
                    <p>
                      <strong>Order Code:</strong> {order?.code || "-"}
                    </p>

                    <p>
                      <strong>Customer:</strong> {shipping?.company_name || shipping?.name || "-"}
                    </p>

                    <p>
                      <strong>Shipping Address:</strong>{" "}
                      {shipping
                        ? `${shipping.address || ""}${
                            shipping.postal_code ? `, ${shipping.postal_code}` : ""
                          }${shipping.city ? `, ${shipping.city}` : ""}${
                            shipping.state ? `, ${shipping.state}` : ""
                          }`
                        : "-"}
                    </p>

                    <p>
                      <strong>Order Date:</strong> {formatDateTime(order?.date)}
                    </p>

                    <p>
                      <strong>Order status:</strong> {orderRes?.orderStatus || order?.delivery_status || "-"}
                    </p>

                    <p>
                      <strong>Total Order Amount:</strong> {money(order?.grand_total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-info-gridRgt">
                <div className="order-box">
                  <h4>Order Amount</h4>
                  <div className="order-box-inner amount-box">
                    <p>
                      <label>Subtotal:</label>
                      <span>{money(subtotal)}</span>
                    </p>

                    <p>
                      <label>Shipping:</label>
                      <span>{money(0)}</span>
                    </p>

                    <p>
                      <label>Tax:</label>
                      <span>{money(0)}</span>
                    </p>

                    <p>
                      <label>Payment Discount:</label>
                      <span>{money(order?.payment_discount)}</span>
                    </p>

                    <p>
                      <label>Coupon:</label>
                      <span>{money(order?.coupon_discount)}</span>
                    </p>

                    <p className="total-price">
                      <label>Total Amount:</label>
                      <span>{money(order?.grand_total)}</span>
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className="order-info-gridRgt">
                <div className="order-box">
                  <h4>Logistics Details</h4>
                  <div className="order-box-inner">
                    <p>
                      <strong>Shipping Provider:</strong> BlueDart Express
                    </p>
                    <p>
                      <strong>Tracking Number: </strong> BLUEDART-987654321
                    </p>

                    <p>
                      <strong>Current Status: </strong> In Transit
                    </p>

                    <p>
                      <strong>Shipping Milestones:</strong>
                    </p>

                    <div class="timeline">
                      <div class="milestone completed">
                        <div className="milestone-info">
                          <div class="milestone-title">Order Confirmed </div>
                          <div class="milestone-date">2024-11-23 14:30</div>
                        </div>

                        <div class="milestone-location">E-commerce warehouse</div>
                      </div>

                      <div class="milestone completed">
                        <div className="milestone-info">
                          <div class="milestone-title">Picked Up</div>
                          <div class="milestone-date">2024-11-23 18:00</div>
                        </div>

                        <div class="milestone-location">Pune, Maharashtra</div>
                      </div>

                      <div class="milestone completed">
                        <div className="milestone-info">
                          <div class="milestone-title">In Transit</div>
                          <div class="milestone-date">2024-11-24 09:15</div>
                        </div>

                        <div class="milestone-location">Mumbai, Maharashtra</div>
                      </div>

                      <div class="milestone completed laststatus">
                        <div className="milestone-info">
                          <div class="milestone-title">Reached Near Hub</div>
                          <div class="milestone-date">2024-11-25 02:45</div>
                        </div>

                        <div class="milestone-location">Bangalore, Karnataka</div>
                      </div>

                      <div class="milestone pending">
                        <div className="milestone-info">
                          <div class="milestone-title">Out for Delivery</div>
                          <div class="milestone-date">2024-11-25</div>
                        </div>

                        <div class="milestone-location">Pending</div>
                      </div>

                      <div class="milestone pending">
                        <div className="milestone-info">
                          <div class="milestone-title">Delivered</div>
                          <div class="milestone-date">2024-11-25</div>
                        </div>

                        <div class="milestone-location">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </>
        )}
      </div>
    </UserProfileLayout>
  );
};

export default ProfileOrderDetails;
