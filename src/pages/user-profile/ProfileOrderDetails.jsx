import React, { useEffect, useMemo, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiMinus } from "react-icons/fi";

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

  const orderId = location?.state?.orderId;
  const orderCodeFromState = location?.state?.code;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderRes, setOrderRes] = useState(null);

  // ✅ expand/collapse state (keyed by part_no)
  const [openMap, setOpenMap] = useState({}); // { [partNo]: true/false }

  useEffect(() => {
    if (!orderId) {
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
  const shipping = useMemo(
    () => safeJsonParse(order?.shipping_address),
    [order?.shipping_address]
  );

  const subtotal = useMemo(() => {
    return details.reduce((sum, row) => sum + Number(row?.price || 0), 0);
  }, [details]);

  const orderCode = order?.code || orderCodeFromState || `#${orderId}`;

  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleInvoice = async () => {
    if (!order?.id || invoiceLoading) return;

    setInvoiceLoading(true);
    try {
      const res = await downloadInvoice(order.id);
      const pdfUrl = res?.pdf_url;

      if (!pdfUrl) {
        alert("Invoice PDF not found.");
        return;
      }

      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e?.message || "Failed to download invoice.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  // ✅ Group finalDetails by part_number so each product row can show its items
  const finalDetailsByPart = useMemo(() => {
    const arr = Array.isArray(orderRes?.finalDetails) ? orderRes.finalDetails : [];
    const map = {};
    for (const x of arr) {
      const key = String(x?.part_number || "").trim();
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(x);
    }
    return map;
  }, [orderRes?.finalDetails]);

  const toggleRow = (partNo) => {
    if (!partNo) return;
    setOpenMap((prev) => ({ ...prev, [partNo]: !prev[partNo] }));
  };

  const openUrl = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
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
            <button
              // className={`invoice-btn ${invoiceLoading ? "loading" : ""}`}
              className='download-pdf-btn'
              type="button"
              onClick={handleInvoice}
              disabled={invoiceLoading}
              title="Download Invoice"
            >
              {/* {invoiceLoading ? (
                <span className="btn-spinner" aria-label="Loading" />
              ) : (
                <img src={InvoiceBtn} alt="Invoice" />
              )} */}
              Download Performa
            </button>
          </div>
        </div>

        {loading && <div style={{ padding: 12 }}>Loading order details...</div>}
        {!loading && error && <div style={{ padding: 12, color: "red" }}>{error}</div>}

        {!loading && !error && (
          <>
            <div className="order-section">
              <h3>Order Details</h3>

              <table className="order-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>SL No</th>
                    <th>Product</th>
                    <th style={{ width: 160 }}>Part No</th>
                    <th style={{ width: 150 }}>Order Quantity</th>
                    <th style={{ width: 170 }}>Approved Quantity</th>
                    <th style={{ width: 140 }}>Rate</th>
                    <th style={{ width: 140 }}>Price</th>
                    {/* ✅ Removed Status column */}
                    <th style={{ width: 110, textAlign: "center" }}>Actions</th>
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
                      const partNo = String(row?.product?.part_no || "").trim() || "-";
                      const qty = row?.quantity ?? "-";
                      const approvedQty = row?.approved_quantity ?? "-";

                      const rate =
                        row?.approved_rate ??
                        row?.product?.unit_price ??
                        Number(row?.price || 0) / (Number(row?.quantity || 1) || 1);

                      const linePrice = row?.price ?? 0;

                      const isOpen = !!openMap[partNo];
                      const finalList = partNo !== "-" ? finalDetailsByPart[partNo] || [] : [];

                      return (
                        <React.Fragment key={row?.id || idx}>
                          {/* ✅ Main Row */}
                          <tr>
                            <td>{String(idx + 1).padStart(2, "0")}</td>
                            <td>{productName}</td>
                            <td>{partNo}</td>
                            <td>{qty}</td>
                            <td>{approvedQty}</td>
                            <td>{money(rate)}</td>
                            <td>{money(linePrice)}</td>

                            {/* ✅ Actions with + / - */}
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => toggleRow(partNo)}
                                className="order-expand-btn"
                                aria-label={isOpen ? "Collapse" : "Expand"}
                                title={isOpen ? "Hide details" : "Show details"}
                                style={{
                                  border: "1px solid #2a66f0",
                                  background: "#fff",
                                  width: 44,
                                  height: 44,
                                  borderRadius: 8,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                }}
                              >
                                {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                              </button>
                            </td>
                          </tr>

                          {/* ✅ Collapsible Row */}
                          {isOpen && (
                            <tr className="order-collapsible-row">
                              <td colSpan={8} style={{ padding: 0 }}>
                                <div
                                  style={{
                                    padding: 14,
                                    background: "#f7f9fc",
                                    borderTop: "1px solid #e6eaf2",
                                  }}
                                >
                                  {finalList.length === 0 ? (
                                    <div style={{ padding: 10, background: "#fff", borderRadius: 10 }}>
                                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                        Billing / Logistics Details
                                      </div>
                                      <div style={{ color: "#666" }}>No billing details found.</div>
                                    </div>
                                  ) : (
                                    <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden" }}>
                                      <table className="order-table" style={{ margin: 0 }}>
                                        <thead>
                                          <tr>
                                            <th style={{ width: 160 }}>Billed Quantity</th>
                                            <th style={{ width: 140 }}>Rate</th>
                                            <th style={{ width: 140 }}>Price</th>
                                            <th>Invoice No.</th>
                                            <th style={{ width: 190 }}>Place of Dispatch</th>
                                            <th style={{ width: 140 }}>Status</th>
                                            <th style={{ width: 190 }}>Actions</th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          {finalList.map((fd, i2) => {
                                            const invNo = fd?.invoice_no || "-";
                                            const invDate = fd?.invoice_date ? `(${fd.invoice_date})` : "";
                                            const dispatchFrom = fd?.dispatch_from || "-";
                                            const billedQty = fd?.billed_qty ?? "-";
                                            const rate2 = (fd?.rate / fd?.billed_qty) ?? "-";
                                            const price2 = fd?.price ?? "-";
                                            const status2 = fd?.status || "-";

                                            const invUrl = fd?.invoice_attachments || "";
                                            const logisticsArr = Array.isArray(fd?.logistics_attachments)
                                              ? fd.logistics_attachments
                                              : [];
                                            const logisticsUrl = logisticsArr?.[0] || "";

                                            return (
                                              <tr key={`${partNo}-${i2}`}>
                                                <td>{billedQty}</td>
                                                <td>{money(rate2)}</td>
                                                <td>{money(price2)}</td>
                                                <td>
                                                  <div style={{ fontWeight: 600 }}>{invNo}</div>
                                                  <div style={{ fontSize: 12, color: "#666" }}>{invDate}</div>
                                                </td>
                                                <td>{dispatchFrom}</td>
                                                <td>
                                                  <span
                                                    style={{
                                                      display: "inline-block",
                                                      padding: "6px 10px",
                                                      borderRadius: 999,
                                                      fontSize: 12,
                                                      fontWeight: 600,
                                                      background:
                                                        String(status2).toLowerCase() === "completed"
                                                          ? "#d8f5e1"
                                                          : "#ffe8c7",
                                                    }}
                                                  >
                                                    {status2}
                                                  </span>
                                                </td>

                                                <td>
                                                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                    <button
                                                      type="button"
                                                      onClick={() => openUrl(invUrl)}
                                                      disabled={!invUrl}
                                                      style={{
                                                        border: "none",
                                                        padding: "10px 14px",
                                                        borderRadius: 999,
                                                        cursor: invUrl ? "pointer" : "not-allowed",
                                                        background: invUrl ? "#16a34a" : "#cbd5e1",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                      }}
                                                    >
                                                      Invoice
                                                    </button>

                                                    <button
                                                      type="button"
                                                      onClick={() => openUrl(logisticsUrl)}
                                                      disabled={!logisticsUrl}
                                                      style={{
                                                        border: "none",
                                                        padding: "10px 14px",
                                                        borderRadius: 999,
                                                        cursor: logisticsUrl ? "pointer" : "not-allowed",
                                                        background: logisticsUrl ? "#f97316" : "#cbd5e1",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                      }}
                                                    >
                                                      Logistic
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ Summary Boxes (same as your code) */}
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
                      <strong>Order status:</strong>{" "}
                      {orderRes?.orderStatus || order?.delivery_status || "-"}
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
            </div>
          </>
        )}
      </div>
    </UserProfileLayout>
  );
};

export default ProfileOrderDetails;