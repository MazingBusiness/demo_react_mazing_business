import React, { useEffect, useMemo, useRef, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { FaFilter, FaCube } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";

import calendarIcon from "../../assets/icons/calendar-icon.svg";
import {
  getMCoinStatement,
  getRewardProducts,
  addToCart,
} from "../../api/apiRequest";

const formatDateDMY = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
};

const formatCoins = (val) => {
  const n = Number(val || 0);
  return n.toLocaleString("en-IN");
};

const toCamelCaseLabel = (value) => {
  if (!value) return "-";

  return value
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRewardImage = (product) => {
  if (product?.images?.length > 0 && product.images[0]?.file_name) {
    return product.images[0].file_name;
  }

  if (product?.thumb_img?.file_name) {
    return product.thumb_img.file_name;
  }

  return "";
};

const FlashMessage = ({ type = "success", message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`custom-toast custom-toast-${type}`}>
      <span>{message}</span>

      <button
        type="button"
        className="custom-toast-close"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  );
};

const MCoinStatement = () => {
  const location = useLocation();

  const initialPartyCode =
    location?.state?.party_code || location?.state?.acc_code || "";

  const [activeTab, setActiveTab] = useState("rewards");

  const [partyCode, setPartyCode] = useState(initialPartyCode);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [balance, setBalance] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState("");
  const [rewardProducts, setRewardProducts] = useState([]);
  const [rewardSearch, setRewardSearch] = useState("");
  const [rewardSort, setRewardSort] = useState("featured");

  const [rewardPage, setRewardPage] = useState(1);
  const [rewardLastPage, setRewardLastPage] = useState(1);
  const [rewardTotal, setRewardTotal] = useState(0);
  const rewardPagination = 16;

  const [redeemLoadingId, setRedeemLoadingId] = useState(null);
  const [redeemMsg, setRedeemMsg] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const rewardLoaderRef = useRef(null);

  const fetchData = async (opts = {}) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        from_date: opts.from_date ?? fromDate,
        to_date: opts.to_date ?? toDate,
      };

      if (partyCode) {
        payload.party_code = partyCode;
      }

      const json = await getMCoinStatement(payload);

      if (!json?.res) {
        setRows([]);
        setError(json?.msg || "Failed to fetch M Coin statement.");
        return;
      }

      if (json?.party_code) {
        setPartyCode(json.party_code);
      }

      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardProducts = async ({
    page = 1,
    searchText = rewardSearch,
    sortValue = rewardSort,
    append = false,
  } = {}) => {
    if (rewardLoading) return;

    setRewardLoading(true);
    setRewardError("");
    setRedeemMsg("");

    try {
      const apiSort =
        sortValue === "high_to_low" || sortValue === "low_to_high"
          ? sortValue
          : "";

      const response = await getRewardProducts({
        search_text: searchText,
        price_sort: apiSort,
        page,
        pagination: rewardPagination,
      });

      const json = await response.json();

      if (!json?.res) {
        if (!append) {
          setRewardProducts([]);
        }

        setRewardPage(1);
        setRewardLastPage(1);
        setRewardTotal(0);
        setRewardError(json?.msg || "Failed to fetch reward products.");
        return;
      }

      const paginatedData = json?.data || {};
      const newProducts = Array.isArray(paginatedData?.data)
        ? paginatedData.data
        : [];

      setRewardProducts((prev) => {
        if (!append) return newProducts;

        const existingIds = new Set(prev.map((item) => item.id));
        const filteredNewProducts = newProducts.filter(
          (item) => !existingIds.has(item.id)
        );

        return [...prev, ...filteredNewProducts];
      });

      setRewardPage(Number(paginatedData?.current_page || page || 1));
      setRewardLastPage(Number(paginatedData?.last_page || 1));
      setRewardTotal(Number(paginatedData?.total || 0));
    } catch (e) {
      if (!append) {
        setRewardProducts([]);
      }

      setRewardError(e?.message || "Something went wrong.");
    } finally {
      setRewardLoading(false);
    }
  };

  const handleRedeem = async (productId) => {
    setRedeemMsg("");
    setRewardError("");

    try {
      setRedeemLoadingId(productId);

      await addToCart({
        product_id: productId,
        quantity: 1,
        type: "piece",
      });

      window.dispatchEvent(new Event("cart-updated"));
      setRedeemMsg("Successfully added to cart.");
    } catch (e) {
      setRewardError(
        e?.message || "You do not have enough M Coins to redeem this product."
      );
    } finally {
      setRedeemLoadingId(null);
    }
  };

  useEffect(() => {
    fetchData({ from_date: "", to_date: "" });
    fetchRewardProducts({
      page: 1,
      searchText: "",
      sortValue: "featured",
      append: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rewardError && !redeemMsg) return;

    const timer = setTimeout(() => {
      setRewardError("");
      setRedeemMsg("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [rewardError, redeemMsg]);

  useEffect(() => {
    if (activeTab !== "rewards") return;

    const target = rewardLoaderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (
          firstEntry.isIntersecting &&
          !rewardLoading &&
          rewardPage < rewardLastPage
        ) {
          fetchRewardProducts({
            page: rewardPage + 1,
            searchText: rewardSearch,
            sortValue: rewardSort,
            append: true,
          });
        }
      },
      {
        root: null,
        rootMargin: "250px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    activeTab,
    rewardLoading,
    rewardPage,
    rewardLastPage,
    rewardSearch,
    rewardSort,
  ]);

  const handleSearch = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("From Date cannot be greater than To Date.");
      return;
    }

    fetchData();
  };

  const handleRewardSearch = () => {
    setRewardPage(1);
    setRewardLastPage(1);
    setRewardTotal(0);

    fetchRewardProducts({
      page: 1,
      searchText: rewardSearch,
      sortValue: rewardSort,
      append: false,
    });
  };

  const handleRewardSortChange = (e) => {
    const value = e.target.value;
    setRewardSort(value);
    setRewardPage(1);
    setRewardLastPage(1);
    setRewardTotal(0);

    fetchRewardProducts({
      page: 1,
      searchText: rewardSearch,
      sortValue: value,
      append: false,
    });
  };

  const statementRows = useMemo(() => {
    let runningBalance = 0;

    return rows.map((row) => {
      const coins = Number(row?.coins || 0);
      const rowType = String(row?.dr_or_cr || "").toLowerCase();

      const drCoins = rowType === "dr" ? coins : 0;
      const crCoins = rowType === "cr" ? coins : 0;

      runningBalance += drCoins;
      runningBalance -= crCoins;

      return {
        ...row,
        drCoins,
        crCoins,
        runningBalance,
        runningBalanceAbs: Math.abs(runningBalance),
        runningBalanceType: runningBalance >= 0 ? "DR" : "CR",
      };
    });
  }, [rows]);

  const totals = useMemo(() => {
    const totalDr = statementRows.reduce(
      (sum, row) => sum + Number(row.drCoins || 0),
      0
    );

    const totalCr = statementRows.reduce(
      (sum, row) => sum + Number(row.crCoins || 0),
      0
    );

    const closingBalance = totalCr - totalDr;
    const closingDr = closingBalance >= 0 ? Math.abs(closingBalance) : 0;
    const closingCr = closingBalance < 0 ? Math.abs(closingBalance) : 0;

    const grandTotalDr = totalCr + closingCr;
    const grandTotalCr = totalDr + closingDr;

    setBalance(closingBalance);

    return {
      totalDr,
      totalCr,
      closingDr,
      closingCr,
      grandTotalDr,
      grandTotalCr,
    };
  }, [statementRows]);

  return (
    <UserProfileLayout>
      <div className="mcoin-page">
        <style>{`
          .custom-toast {
            position: fixed;
            top: 30px;
            right: 25px;
            z-index: 99999;
            min-width: 320px;
            max-width: 460px;
            padding: 14px 45px 14px 18px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 800;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: toastSlideIn 0.35s ease-out, toastFadeOut 0.6s ease-in 2.4s forwards;
          }

          .custom-toast-success {
            background: #d1e7dd;
            color: #0f5132;
            border-left: 7px solid #198754;
          }

          .custom-toast-danger {
            background: #f8d7da;
            color: #842029;
            border-left: 7px solid #dc3545;
          }

          .custom-toast-close {
            position: absolute;
            top: 8px;
            right: 12px;
            border: 0;
            background: transparent;
            color: inherit;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            opacity: 0.8;
          }

          .custom-toast-close:hover {
            opacity: 1;
          }

          .mcoin-scroll-loader {
            text-align: center;
            padding: 25px 0;
            font-size: 15px;
            color: #777;
            font-weight: 600;
          }

          .mcoin-scroll-end {
            text-align: center;
            padding: 25px 0;
            font-size: 14px;
            color: #999;
          }

          @keyframes toastSlideIn {
            from {
              opacity: 0;
              transform: translateX(60px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes toastFadeOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(60px);
            }
          }
        `}</style>

        <FlashMessage
          type="danger"
          message={rewardError}
          onClose={() => setRewardError("")}
        />

        <FlashMessage
          type="success"
          message={redeemMsg}
          onClose={() => setRedeemMsg("")}
        />

        <div className="mcoin-balance-card">
          <div className="mcoin-balance-label">
            <span className="mcoin-star">★</span>
            Redeemable Rewards Balance
          </div>

          <div className="mcoin-balance-amount">
            <h1>{formatCoins(balance)}</h1>
            <span>Coins</span>
          </div>
        </div>

        <div className="mcoin-tabs">
          <button
            type="button"
            className={`mcoin-tab-btn ${
              activeTab === "rewards" ? "active" : ""
            }`}
            onClick={() => setActiveTab("rewards")}
          >
            Rewards
          </button>

          <button
            type="button"
            className={`mcoin-tab-btn ${
              activeTab === "statement" ? "active" : ""
            }`}
            onClick={() => setActiveTab("statement")}
          >
            Statement
          </button>
        </div>

        {activeTab === "rewards" && (
          <div className="mcoin-rewards-section">
            <div className="mcoin-rewards-head">
              <div className="mcoin-rewards-title">
                <h2>Rewards</h2>
                <p>Exclusive products curated for high-performing merchants.</p>
              </div>

              <div className="mcoin-rewards-actions">
                <input
                  type="text"
                  className="mcoin-search-box"
                  placeholder="Search product..."
                  value={rewardSearch}
                  onChange={(e) => setRewardSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRewardSearch();
                    }
                  }}
                />

                <button
                  type="button"
                  className="mcoin-action-btn"
                  onClick={handleRewardSearch}
                  disabled={rewardLoading}
                >
                  <FaFilter />
                  {rewardLoading && rewardPage === 1 ? "Loading..." : "Filter"}
                </button>

                <select
                  className="mcoin-sort-select"
                  value={rewardSort}
                  onChange={handleRewardSortChange}
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="high_to_low">Price: High to Low</option>
                  <option value="low_to_high">Price: Low to High</option>
                </select>
              </div>
            </div>

            {rewardLoading && rewardProducts.length === 0 ? (
              <div className="mcoin-empty">Loading reward products...</div>
            ) : rewardProducts.length === 0 ? (
              <div className="mcoin-empty">No reward products found</div>
            ) : (
              <>
                <div className="mcoin-products-grid">
                  {rewardProducts.map((product) => {
                    const imageUrl = getRewardImage(product);
                    const coinValue = product?.redeem_m_coin || 0;

                    return (
                      <div className="mcoin-product-card" key={product.id}>
                        <div className="mcoin-product-img">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product?.name || "Reward"}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <div className="mcoin-product-body">
                          <div className="mcoin-product-cat">
                            {product?.category?.name ||
                              product?.categoryGroup?.name ||
                              "Rewards"}
                          </div>

                          <div className="mcoin-product-name">
                            {product?.name || product?.billing_name || "-"}
                          </div>

                          <div className="mcoin-product-bottom">
                            <div className="mcoin-price">
                              <FaCube />
                              {formatCoins(coinValue)}
                              <small>Coins</small>
                            </div>

                            <button
                              type="button"
                              className="redeem-btn"
                              disabled={redeemLoadingId === product.id}
                              onClick={() => handleRedeem(product.id)}
                            >
                              {redeemLoadingId === product.id
                                ? "Adding..."
                                : "Redeem"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div ref={rewardLoaderRef} className="mcoin-scroll-loader">
                  {rewardLoading && rewardPage > 1
                    ? "Loading more products..."
                    : rewardPage < rewardLastPage
                    ? "Scroll down to load more"
                    : rewardTotal > 0
                    ? `All ${rewardProducts.length} products loaded`
                    : ""}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "statement" && (
          <div className="mcoin-statement-wrap">
            <div className="order-details">
              <div className="orderdetailsHr">
                <div className="orderdetailsHrLft">
                  <div className="breadcrumb">
                    <Link to="/statement">
                      <IoIosArrowBack />
                      Statement
                    </Link>
                    {" / Party Code: "}
                    <span>{partyCode || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="statement-table-filters">
                <div className="date-filters">
                  <div
                    className={`date-input-wrapper ${fromDate ? "filled" : ""}`}
                    onClick={() => fromInputRef.current?.showPicker?.()}
                  >
                    <input
                      type="date"
                      id="fromDate"
                      ref={fromInputRef}
                      value={fromDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFromDate(value);

                        if (
                          toDate &&
                          value &&
                          new Date(value) > new Date(toDate)
                        ) {
                          setToDate("");
                        }
                      }}
                    />
                    {!fromDate && (
                      <span className="date-placeholder">From Date</span>
                    )}
                    <span className="calendar-icon">
                      <img src={calendarIcon} alt="calendar" />
                    </span>
                  </div>

                  <div
                    className={`date-input-wrapper ${toDate ? "filled" : ""}`}
                    onClick={() => toInputRef.current?.showPicker?.()}
                  >
                    <input
                      type="date"
                      id="toDate"
                      ref={toInputRef}
                      value={toDate}
                      min={fromDate || ""}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                    {!toDate && <span className="date-placeholder">To Date</span>}
                    <span className="calendar-icon">
                      <img src={calendarIcon} alt="calendar" />
                    </span>
                  </div>

                  <button
                    className="search-btn"
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              <div className="order-table-hr">
                <div className="order-table-hrLft">
                  <h2>M Coin Statement</h2>
                </div>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}

              <div className="order-table-container statement-table-container">
                <table className="order-table statement-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>Invoice No</th>
                      <th>Dr Coins</th>
                      <th>Cr Coins</th>
                      <th>Running Coin Balance</th>
                      <th>Dr / Cr</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          Loading...
                        </td>
                      </tr>
                    ) : statementRows.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          No records found
                        </td>
                      </tr>
                    ) : (
                      <>
                        {statementRows.map((row, idx) => (
                          <tr key={`${row?.id || "row"}-${idx}`}>
                            <td>
                              {formatDateDMY(
                                row?.type === "invoice_creation"
                                  ? row?.invoice_date
                                  : row?.type === "early_payment" ||
                                    row?.type === "overdue"
                                  ? row?.bill_date
                                  : row?.created_at
                              )}
                            </td>

                            <td>
                              {toCamelCaseLabel(row?.type)}

                              {["early_payment", "overdue"].includes(row?.type) &&
                                row?.bill_clear_date_difference && (
                                  <p className="mb-0">
                                    <small>
                                      <strong>
                                        {row?.bill_clear_date_difference}
                                      </strong>
                                    </small>
                                  </p>
                                )}
                            </td>

                            <td>{row?.invoice_no || "-"}</td>
                            <td>
                              {row?.drCoins ? formatCoins(row.drCoins) : "-"}
                            </td>
                            <td>
                              {row?.crCoins ? formatCoins(row.crCoins) : "-"}
                            </td>
                            <td>{formatCoins(row?.runningBalanceAbs)}</td>
                            <td>
                              <span
                                className={
                                  row?.runningBalanceType === "CR" ? "cr" : "dr"
                                }
                              >
                                {row?.runningBalanceType}
                              </span>
                            </td>
                          </tr>
                        ))}

                        <tr className="total-row">
                          <td colSpan="3">
                            <strong>Total</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.totalDr)}</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.totalCr)}</strong>
                          </td>
                          <td colSpan="2"></td>
                        </tr>

                        <tr className="total-row">
                          <td colSpan="3">
                            <strong>Closing Balance</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.closingDr)}</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.closingCr)}</strong>
                          </td>
                          <td colSpan="2"></td>
                        </tr>

                        <tr className="total-row">
                          <td colSpan="3">
                            <strong>Grand Total</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.grandTotalDr)}</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.grandTotalCr)}</strong>
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserProfileLayout>
  );
};

export default MCoinStatement;