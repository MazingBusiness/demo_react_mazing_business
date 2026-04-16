import React, { useEffect, useMemo, useRef, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, Link } from "react-router-dom";

import calendarIcon from "../../assets/icons/calendar-icon.svg";
import { getMCoinStatement } from "../../api/apiRequest";

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

const MCoinStatement = () => {
  const location = useLocation();

  const initialPartyCode =
    location?.state?.party_code || location?.state?.acc_code || "";

  const [partyCode, setPartyCode] = useState(initialPartyCode);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

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

  useEffect(() => {
    fetchData({ from_date: "", to_date: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("From Date cannot be greater than To Date.");
      return;
    }

    fetchData();
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
    const totalDr = statementRows.reduce((sum, row) => sum + Number(row.drCoins || 0), 0);
    const totalCr = statementRows.reduce((sum, row) => sum + Number(row.crCoins || 0), 0);

    const closingBalance = totalDr - totalCr;
    const closingDr = closingBalance >= 0 ? Math.abs(closingBalance) : 0;
    const closingCr = closingBalance < 0 ? Math.abs(closingBalance) : 0;

    const grandTotalDr = totalDr + closingCr;
    const grandTotalCr = totalCr + closingDr;

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
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="breadcrumb">
              <Link to="/statement">
                <IoIosArrowBack />
                My M Coin Statement
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
              {!fromDate && <span className="date-placeholder">From Date</span>}
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
                      <td>{row?.drCoins ? formatCoins(row.drCoins) : "-"}</td>
                      <td>{row?.crCoins ? formatCoins(row.crCoins) : "-"}</td>
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
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>{formatCoins(totals.totalDr)}</strong></td>
                    <td><strong>{formatCoins(totals.totalCr)}</strong></td>
                    <td colSpan="2"></td>
                  </tr>

                  <tr className="total-row">
                    <td colSpan="3"><strong>Closing Balance</strong></td>
                    <td><strong>{formatCoins(totals.closingCr)}</strong></td>
                    <td><strong>{formatCoins(totals.closingDr)}</strong></td>
                    <td colSpan="2"></td>
                  </tr>

                  <tr className="total-row">
                    <td colSpan="3"><strong>Grand Total</strong></td>
                    <td><strong>{formatCoins(totals.grandTotalDr)}</strong></td>
                    <td><strong>{formatCoins(totals.grandTotalCr)}</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default MCoinStatement;