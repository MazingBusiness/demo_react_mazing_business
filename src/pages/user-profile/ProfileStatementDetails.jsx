import React, { useEffect, useMemo, useRef, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";

import Paycust from "../../assets/icons/paycust.svg";
import DownloadCloud from "../../assets/icons/DownloadCloud.svg";
import WhatsButton from "../../assets/icons/WhatsButton.svg";
import calendarIcon from "../../assets/icons/calendar-icon.svg";
import RefreshIcon from "../../assets/icons/refresh-btn-Icon.svg";

import {
  getStatementDetails,
  refreshStatementDetails,
  downloadUserStatement,
  deleteDownloadedFile,
  sendStatementWhatsapp,
} from "../../api/apiRequest";

const money = (val) => {
  const n = Number(val || 0);
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
};

const formatDateDMY = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return "";
  const d = new Date(yyyy_mm_dd);
  if (Number.isNaN(d.getTime())) return yyyy_mm_dd;
  return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
};

const ProfileStatementDetails = () => {
  const location = useLocation();

  // ✅ coming from navigate state
  const partyCode = location?.state?.party_code || location?.state?.acc_code || "";
  const dataFrom = location?.state?.data_from || "database";

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    dueAmount: 0,
    overdueAmount: 0,
    totalDrBalance: 0,
    totalCrBalance: 0,
    clossingDrBalance: 0,
    clossingCrBalance: 0,
    grandTotalDrBalance: 0,
    grandTotalCrBalance: 0,
    avgPaymentDays: null,
    creditDays: null,
  });

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const fetchData = async (opts = {}) => {
    if (!partyCode) {
      setError("Party code missing. Please go back and open details again.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const json = await getStatementDetails({
        party_code: partyCode,
        data_from: dataFrom,
        from_date: opts.from_date ?? fromDate,
        to_date: opts.to_date ?? toDate,
      });

      if (!json?.res) {
        setRows([]);
        setSummary((p) => ({ ...p }));
        setError(json?.msg || "Failed to fetch statement.");
        return;
      }

      setRows(Array.isArray(json.data) ? json.data : []);

      setSummary({
        dueAmount: json.dueAmount ?? 0,
        overdueAmount: json.overdueAmount ?? 0,
        totalDrBalance: json.totalDrBalance ?? 0,
        totalCrBalance: json.totalCrBalance ?? 0,
        clossingDrBalance: json.clossingDrBalance ?? 0,
        clossingCrBalance: json.clossingCrBalance ?? 0,
        grandTotalDrBalance: json.grandTotalDrBalance ?? 0,
        grandTotalCrBalance: json.grandTotalCrBalance ?? 0,
        avgPaymentDays: json.avgPaymentDays ?? null,
        creditDays: json.userDetails?.credit_days ?? null,
      });
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const refreshStatement = async (opts = {}) => {
    if (!partyCode) {
      setError("Party code missing. Please go back and open details again.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const json = await refreshStatementDetails({
        party_code: partyCode,
        data_from: 'live'
      });

      if (!json?.res) {
        setRows([]);
        setSummary((p) => ({ ...p }));
        setError(json?.msg || "Failed to fetch statement.");
        return;
      }

      setRows(Array.isArray(json.data) ? json.data : []);

      setSummary({
        dueAmount: json.dueAmount ?? 0,
        overdueAmount: json.overdueAmount ?? 0,
        totalDrBalance: json.totalDrBalance ?? 0,
        totalCrBalance: json.totalCrBalance ?? 0,
        clossingDrBalance: json.clossingDrBalance ?? 0,
        clossingCrBalance: json.clossingCrBalance ?? 0,
        grandTotalDrBalance: json.grandTotalDrBalance ?? 0,
        grandTotalCrBalance: json.grandTotalCrBalance ?? 0,
        avgPaymentDays: json.avgPaymentDays ?? null,
        creditDays: json.userDetails?.credit_days ?? null,
      });
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const openPdfAndScheduleDeletion = (fileUrl, fileType = "PDF") => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");

    // Allow the browser time to receive the PDF before deleting the
    // temporary server copy.
    window.setTimeout(async () => {
      try {
        await deleteDownloadedFile(fileUrl);
      } catch (deleteError) {
        console.error(`${fileType} delete failed:`, deleteError);
      }
    }, 30000);
  };

  const StatementDownloadBtn = ({ party_code, data_from = "live" }) => {
    const [downloading, setDownloading] = useState(false);

    const downloadStatement = async () => {
      if (!party_code || downloading) return;

      try {
        setDownloading(true);

        // const r = await downloadUserStatement({ party_code, data_from });
        const response = await downloadUserStatement({
          party_code,
          data_from: "live",
          from_date: fromDate,
          to_date: toDate,
        });

        if (response?.pdf_url) {
          openPdfAndScheduleDeletion(response.pdf_url, "Statement PDF");
        } else {
          console.log("pdf_url missing:", response);
          alert("PDF link not found");
        }
      } catch (err) {
        console.error("Statement download failed:", err);
        alert("Failed to download statement");
      } finally {
        setDownloading(false);
      }
    };

    return (
        <button
          className="invoice-btn"
          type="button"
          onClick={downloadStatement}
          disabled={downloading}
          title="Download Statement"
          style={{ position: "relative" }}
        >
          {/* icon */}
          <img
            src={DownloadCloud}
            alt="download"
            style={{ opacity: downloading ? 0.25 : 1 }}
          />

          {/* spinner overlay */}
          {downloading && (
            <span
              className="btn-spinner"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </button>
      );
  };

  const SendStatementWhatsappBtn = () => {
    const [sending, setSending] = useState(false);

    const onSendWhatsapp = async () => {
      if (sending) return;
      try {
        setSending(true);
        const r = await sendStatementWhatsapp();
        if (r?.res) toast.success(r?.msg || "Statement sent to WhatsApp");
        else toast.error(r?.msg || "Failed to send statement");
      } catch (e) {
        console.error(e);
        toast.error("Something went wrong");
      } finally {
        setSending(false);
      }
    };

    return (
      <button
        className="invoice-btn"
        type="button"
        onClick={onSendWhatsapp}
        disabled={sending}
        title="Send to WhatsApp"
        style={{ position: "relative" }}
      >
        <img src={WhatsButton} alt="whatsapp" style={{ opacity: sending ? 0.25 : 1 }} />

        {sending && (
          <span
            className="btn-spinner"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </button>
    );
  };


  // ✅ first load
  useEffect(() => {
    fetchData({ from_date: "", to_date: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyCode]);

  const handleSearch = () => {
    // optional validation
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("From Date cannot be greater than To Date.");
      return;
    }
    fetchData();
  };

  const handleRefresh = () => {
    refreshStatement()
  };

  const computedTotals = useMemo(() => {
    // If API already gives totals, you can skip this.
    // But sometimes you want totals only from visible transactions
    const totalDr = rows.reduce((s, r) => s + Number(r?.dramount || 0), 0);
    const totalCr = rows.reduce((s, r) => s + Number(r?.cramount || 0), 0);
    return { totalDr, totalCr };
  }, [rows]);

  const averagePaymentDays = Number(summary.avgPaymentDays);
  const creditDays = Number(summary.creditDays);
  const showAveragePaymentDays =
    summary.avgPaymentDays !== null &&
    summary.creditDays !== null &&
    Number.isFinite(averagePaymentDays) &&
    Number.isFinite(creditDays);
  const isWithinCreditDays = creditDays > averagePaymentDays;

  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="statement-breadcrumb-row">
              <div className="breadcrumb">
                <Link to="/statement">
                  <IoIosArrowBack />
                  My Statement
                </Link>
                / Party Code: <span>{partyCode || "-"}</span>
              </div>
              {/* {showAveragePaymentDays && (
                <span
                  className={`average-payment-days ${
                    isWithinCreditDays ? "within-credit-days" : "outside-credit-days"
                  }`}
                >
                  Average Payment Clearance Time: {summary.avgPaymentDays} Days
                </span>
              )} */}
            </div>
          </div>
          <div className="orderdetailsHrRgt">
            {/* <button className="invoice-btn" type="button">
              <img src={Paycust} alt="paycust" />
            </button> */}
            {/* <button className="invoice-btn" type="button" onClick={() => downloadStatement()}>
              <img src={DownloadCloud} alt="download" />
            </button> */}
            <StatementDownloadBtn party_code={partyCode} data_from="live" />
            {/* <button clStatementDownloadBtnassName="download-pdf" onClick={() => downloadStatement()}>
              <BsCloudArrowDownFill /> {downloading ? "Downloading..." : "Download Statement"}
            </button> */}
            {/* <button className="invoice-btn" type="button">
              <img src={WhatsButton} alt="whatsapp" />
            </button> */}
            <SendStatementWhatsappBtn />
          </div>
        </div>

        <div className="statement-table-filters">
          <div className="date-filters">
            {/* From Date */}
            <div
              className={`date-input-wrapper ${fromDate ? "filled" : ""}`}
              onClick={() => fromInputRef.current?.showPicker()}
            >
              <input
                type="date"
                id="fromDate"
                ref={fromInputRef}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (toDate && new Date(e.target.value) > new Date(toDate)) {
                    setToDate("");
                  }
                }}
              />
              {!fromDate && <span className="date-placeholder">From Date</span>}
              <span className="calendar-icon">
                <img src={calendarIcon} alt="calendar" />
              </span>
            </div>

            {/* To Date */}
            <div
              className={`date-input-wrapper ${toDate ? "filled" : ""}`}
              onClick={() => toInputRef.current?.showPicker()}
            >
              <input
                type="date"
                id="toDate"
                ref={toInputRef}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || ""}
              />
              {!toDate && <span className="date-placeholder">To Date</span>}
              <span className="calendar-icon">
                <img src={calendarIcon} alt="calendar" />
              </span>
            </div>

            <button className="search-btn" type="button" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <button className="refresh-btn" type="button" onClick={handleRefresh} disabled={loading}>
            <img src={RefreshIcon} alt="RefreshIcon" />
          </button>
        </div>

        <div className="order-table-hr">
          <div className="order-table-hrLft">
            <h2>Statement</h2>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {/* Table */}
        <div className="order-table-container statement-table-container">
          <table className="order-table statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th>Txn No</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
                <th>Dr / Cr</th>
                <th>Overdue By Day</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const dr = Number(r?.dramount || 0);
                  const cr = Number(r?.cramount || 0);
                  const drcr = (r?.dr_or_cr || "").toLowerCase(); // "dr" / "cr"
                  const invoiceLink = r?.invoice_download_link;
                  const overdue_status = r?.overdue_status || '';
                  const overdue_by_day = (r?.overdue_by_day || "-").toString();

                  let rowBg = "";
                  if (overdue_status === "Partial Overdue") {
                    rowBg = "#f6d2d2";
                  } else if (overdue_status === "Overdue") {
                    rowBg = "#fe8888";
                  }
                  
                  const isClosing = (r?.ledgername || "").trim().toLowerCase() === "closing c/f...";

                  if (!isClosing) {
                    return (
                      <tr
                        key={`${r?.trn_no || "row"}-${idx}`}
                        style={{ cursor: invoiceLink ? "pointer" : "default",backgroundColor: rowBg }}
                        onClick={() => {
                          if (invoiceLink) {
                            window.open(invoiceLink, "_blank", "noopener,noreferrer");
                          }
                        }}
                        title={invoiceLink ? "Open invoice" : ""}
                      >
                        <td>{formatDateDMY(r?.trn_date)}</td>
                        <td>
                          {r?.vouchertypebasename || r?.ledgername || "-"}                          
                          <p><small>{overdue_status}</small></p>
                          </td>
                        <td>
                          {r?.trn_no || "-"}
                          {r?.early_payment_m_coin && (
                              <p>
                                  <small style={{ fontSize: "9px", fontWeight: "bold" }}>Early Payment M Coin : {r.early_payment_m_coin}</small>
                              </p>
                          )}
                          {r?.invoice_creation_m_coin && (
                              <p>
                                  <small style={{ fontSize: "9px", fontWeight: "bold" }}>Invoice Creation M Coin : {r.invoice_creation_m_coin}</small>
                              </p>
                          )}
                          {r?.overdue_m_coin && (
                              <p>
                                  <small style={{ fontSize: "9px", fontWeight: "bold" }}>Overdue M Coin : {r.overdue}</small>
                              </p>
                          )}
                          {r?.credit_note_m_coin && (
                              <p>
                                  <small style={{ fontSize: "9px", fontWeight: "bold" }}>Reedem M Coin : {r.credit_note_m_coin}</small>
                              </p>
                          )}
                        </td>
                        <td>
                          <span className={dr > 0 ? "red" : ""}>{money(dr)}</span>
                        </td>
                        <td>{money(cr)}</td>
                        <td>{money(r?.running_balance ?? r?.balance ?? 0)}</td>
                        <td>
                          <span className={drcr === "cr" ? "cr" : "dr"}>
                            {(r?.dr_or_cr || "-").toString()}
                          </span>
                        </td>
                        <td>{overdue_by_day}</td>
                      </tr>
                    );
                  }
                })
              )}

              {/* Totals from API (recommended) */}
              {!loading && rows.length > 0 ? (
                <>
                  <tr className="total-row">
                    <td colSpan="3">Total</td>
                    <td>{money(summary.totalDrBalance || computedTotals.totalDr)}</td>
                    <td>{money(summary.totalCrBalance || computedTotals.totalCr)}</td>
                    <td colSpan="3"></td>
                  </tr>

                  <tr className="total-row">
                    <td colSpan="3">Closing Balance</td>
                    <td>{money(summary.clossingCrBalance)}</td>
                    <td>{money(summary.clossingDrBalance)}</td>
                    <td colSpan="3"></td>
                  </tr>

                  <tr className="total-row">
                    <td colSpan="3">Grand Total</td>
                    <td>{money(summary.grandTotalDrBalance)}</td>
                    <td>{money(summary.grandTotalCrBalance)}</td>
                    <td colSpan="3"></td>
                  </tr>
                </>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileStatementDetails;
