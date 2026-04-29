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
  } = {}) => {
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
        setRewardProducts([]);
        setRewardPage(1);
        setRewardLastPage(1);
        setRewardTotal(0);
        setRewardError(json?.msg || "Failed to fetch reward products.");
        return;
      }

      const paginatedData = json?.data || {};

      setRewardProducts(
        Array.isArray(paginatedData?.data) ? paginatedData.data : []
      );

      setRewardPage(Number(paginatedData?.current_page || page || 1));
      setRewardLastPage(Number(paginatedData?.last_page || 1));
      setRewardTotal(Number(paginatedData?.total || 0));
    } catch (e) {
      setRewardProducts([]);
      setRewardPage(1);
      setRewardLastPage(1);
      setRewardTotal(0);
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
      setRedeemMsg("Successfully added on cart.");
    } catch (e) {
      setRewardError(e?.message || "Failed to add product to cart.");
    } finally {
      setRedeemLoadingId(null);
    }
  };

  useEffect(() => {
    fetchData({ from_date: "", to_date: "" });
    fetchRewardProducts({ page: 1, searchText: "", sortValue: "featured" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("From Date cannot be greater than To Date.");
      return;
    }

    fetchData();
  };

  const handleRewardSearch = () => {
    fetchRewardProducts({
      page: 1,
      searchText: rewardSearch,
      sortValue: rewardSort,
    });
  };

  const handleRewardSortChange = (e) => {
    const value = e.target.value;
    setRewardSort(value);

    fetchRewardProducts({
      page: 1,
      searchText: rewardSearch,
      sortValue: value,
    });
  };

  const handleRewardPageChange = (page) => {
    if (page < 1 || page > rewardLastPage || rewardLoading) return;

    fetchRewardProducts({
      page,
      searchText: rewardSearch,
      sortValue: rewardSort,
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

    const closingBalance = totalDr - totalCr;
    const closingDr = closingBalance >= 0 ? Math.abs(closingBalance) : 0;
    const closingCr = closingBalance < 0 ? Math.abs(closingBalance) : 0;

    const grandTotalDr = totalDr + closingCr;
    const grandTotalCr = totalCr + closingDr;

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
        <div className="mcoin-balance-card">
          <div className="mcoin-balance-label">
            <span className="mcoin-star">★</span>
            Redeemable Rewards Balance
          </div>

          <div className="mcoin-balance-amount">
            <h1>{formatCoins(balance)}</h1>
            <span>Coins</span>
          </div>

          <div className="mcoin-mini-cards">
            <div className="mcoin-mini-card">
              <small>Pending</small>
              <strong>12,400</strong>
            </div>

            <div className="mcoin-mini-card">
              <small>Expiring Soon</small>
              <strong>450</strong>
            </div>
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
                  {rewardLoading ? "Loading..." : "Filter"}
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

            {rewardError ? (
              <div className="alert alert-danger">{rewardError}</div>
            ) : null}

            {redeemMsg ? (
              <div className="alert alert-success">{redeemMsg}</div>
            ) : null}

            {rewardLoading ? (
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

                <div className="mcoin-pagination">
                  <button
                    type="button"
                    className="mcoin-page-btn"
                    disabled={rewardPage <= 1 || rewardLoading}
                    onClick={() => handleRewardPageChange(rewardPage - 1)}
                  >
                    Previous
                  </button>

                  <span className="mcoin-page-info">
                    Page {rewardPage} of {rewardLastPage}
                    {rewardTotal ? ` (${rewardTotal} Products)` : ""}
                  </span>

                  <button
                    type="button"
                    className="mcoin-page-btn"
                    disabled={rewardPage >= rewardLastPage || rewardLoading}
                    onClick={() => handleRewardPageChange(rewardPage + 1)}
                  >
                    Next
                  </button>
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

                        if (toDate && value && new Date(value) > new Date(toDate)) {
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
                            <td>{formatDateDMY(row?.created_at)}</td>
                            <td>{toCamelCaseLabel(row?.type)}</td>
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
                            <strong>{formatCoins(totals.closingCr)}</strong>
                          </td>
                          <td>
                            <strong>{formatCoins(totals.closingDr)}</strong>
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