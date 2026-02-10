import React, { useEffect, useMemo, useRef, useState } from "react";
import View from "../../assets/icons/View.svg";
import SaveLater from "../../assets/icons/SaveLater.svg";
import Delete from "../../assets/icons/Delete.svg";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";

import { getMyOrders, downloadInvoice  } from "../../api/apiRequest";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null); // pagination meta (current_page, links, etc.)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedEntries, setSelectedEntries] = useState("5");
  const entriesOptions = ["5", "10", "25", "50"];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const perPage = useMemo(() => Number(selectedEntries || 5), [selectedEntries]);
  const currentPage = meta?.current_page || 1;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyOrders({ page, per_page: perPage });

      if (!res?.res) {
        setOrders([]);
        setMeta(null);
        setError(res?.msg || "Failed to load orders.");
        return;
      }

      const pageData = res?.data;
      setOrders(pageData?.data || []);
      setMeta(pageData || null);
    } catch (e) {
      setError(e?.message || "Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  };

  // initial + whenever perPage changes => reset to page 1
  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  const formatDate = (unixSecondsOrAny) => {
    // Your API has `date: 1770378132` (seconds)
    const sec = Number(unixSecondsOrAny);
    if (!Number.isFinite(sec) || sec <= 0) return "-";
    const d = new Date(sec * 1000);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getStatusClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("deliver")) return "delivered";
    if (s.includes("cancel")) return "cancelled";
    if (s.includes("reject")) return "cancelled";
    return "pending";
  };

  const onClickPageFromUrl = (url) => {
    if (!url) return;
    try {
      const u = new URL(url);
      const page = Number(u.searchParams.get("page") || 1);
      if (Number.isFinite(page)) fetchOrders(page);
    } catch {
      // if URL parsing fails, ignore
    }
  };

  const [downloadingId, setDownloadingId] = useState(null);
  const handleDownloadInvoice = async (orderId) => {
    if (!orderId || downloadingId) return;

    setDownloadingId(orderId);
    try {
      const res = await downloadInvoice(orderId);
      const pdfUrl = res?.pdf_url;

      if (!pdfUrl) {
        alert("Invoice PDF not found.");
        return;
      }

      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e?.message || "Failed to download invoice.");
    } finally {
      setDownloadingId(null);
    }
  };
  return (
    <div className="order-table-wrapper">
      {/* Header */}
      <div className="order-table-hr">
        <div className="order-table-hrLft">
          <h2>Purchase History</h2>
        </div>

        <div className="order-table-hrRgt">
          {/* ⬇️ Custom Dropdown */}
          <div className="ShowEntries-dropdown" ref={dropdownRef}>
            {/* <label>Showing:</label>

            <div className="show-dropdown-container">
              <div
                className="show-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedEntries}
                <FiChevronDown
                  className={`show-arrow-icon ${dropdownOpen ? "show-rotate" : ""}`}
                />
              </div> */}

              {/* <ul className={`show-dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                {entriesOptions.length === 0 ? (
                  <li className="show-no-data">No Data</li>
                ) : (
                  entriesOptions.map((option) => (
                    <li
                      key={option}
                      className={`show-dropdown-item ${
                        selectedEntries === option ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedEntries(option);
                        setDropdownOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))
                )}
              </ul>
            </div> */}
          </div>
        </div>
      </div>
      {/* Loading / Error */}
      {loading && <div style={{ padding: 10 }}>Loading...</div>}
      {!loading && error && <div style={{ padding: 10, color: "red" }}>{error}</div>}

      {/* Table */}
      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Delivery Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {!loading && orders?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 14 }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td data-label="Order Id">
                    {/* You can pass order id/code in state or params */}
                    <Link
                      to="/profile-order-details"
                      state={{ orderId: o.id, code: o.code }}
                      className="order-link"
                    >
                      {o.code || `#${o.id}`}
                    </Link>
                  </td>
                  <td data-label="Date">{formatDate(o.date)}</td>
                  <td data-label="Amount">
                    ₹{Number(o.grand_total || 0).toFixed(2)}
                  </td>
                  <td data-label="Delivery Status">
                    <span className={`status-badge ${getStatusClass(o.delivery_status)}`}>
                      {o.delivery_status || "Pending"}
                    </span>
                  </td>

                  <td data-label="Options" className="actions">
                    <Link
                      to="/profile-order-details"
                      state={{ orderId: o.id, code: o.code }}
                      className="ordertbl-icon-btn view"
                      title="View"
                    >
                      <img src={View} alt="View" />
                    </Link>

                    {(() => {
                      const isLoading = downloadingId === o.id;

                      return (
                        <button
                          className={`ordertbl-icon-btn repeat ${isLoading ? "loading" : ""}`}
                          title="Download Invoice"
                          onClick={() => handleDownloadInvoice(o.id)}
                          type="button"
                          disabled={isLoading}
                        >
                          {isLoading ? <span className="btn-spinner" /> : <img src={SaveLater} alt="Invoice" />}
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination (Dynamic from API links) */}
      {meta?.links?.length > 0 && (
        <div className="pagination-wrapper">
          {meta.links.map((l, idx) => {
            const labelText = String(l.label || "")
              .replace("&laquo;", "«")
              .replace("&raquo;", "»");

            const isDots = labelText === "...";
            const isDisabled = !l.url || isDots || loading;
            const isActive = !!l.active;

            return (
              <button
                key={`${labelText}-${idx}`}
                className={`pagination-btn ${
                  isActive ? "active" : ""
                } ${isDots ? "dots" : ""} ${isDisabled ? "disabled" : ""}`}
                disabled={isDisabled}
                onClick={() => onClickPageFromUrl(l.url)}
                type="button"
              >
                {labelText}
              </button>
            );
          })}

          {/* optional small meta info */}
          {/* <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
            Page {currentPage} / {meta.last_page}
          </div> */}
        </div>
      )}
    </div>
  );
};

export default OrderTable;
