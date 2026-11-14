import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaBoxOpen,
  FaChartLine,
  FaEllipsisH,
  FaMedal,
  FaRegCalendarAlt,
  FaRegFileAlt,
  FaRupeeSign,
  FaStore,
} from "react-icons/fa";
import DownloadBtn from "../../assets/icons/DownloadBtn.svg";
import SaveLater from "../../assets/icons/SaveLater.svg";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { userDetails } from "../../api/apiRequest";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value).split("T")[0]
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const numberToIndianWords = (value) => {
  const amount = Math.floor(Number(value) || 0);
  if (amount === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const toWordsBelowThousand = (number) => {
    const words = [];
    if (number >= 100) words.push(`${ones[Math.floor(number / 100)]} Hundred`);
    const remainder = number % 100;
    if (remainder >= 20) {
      words.push(`${tens[Math.floor(remainder / 10)]}${remainder % 10 ? ` ${ones[remainder % 10]}` : ""}`);
    } else if (remainder) {
      words.push(ones[remainder]);
    }
    return words.join(" ");
  };

  let remaining = Math.abs(amount);
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const words = [];
  if (crore) words.push(`${toWordsBelowThousand(crore)} Crore`);
  if (lakh) words.push(`${toWordsBelowThousand(lakh)} Lakh`);
  if (thousand) words.push(`${toWordsBelowThousand(thousand)} Thousand`);
  if (remaining) words.push(toWordsBelowThousand(remaining));

  return `${amount < 0 ? "Minus " : ""}${words.join(" ")}`;
};

const getAttachmentUrl = (attachments) => {
  if (Array.isArray(attachments)) return attachments[0] || "";
  if (typeof attachments !== "string") return "";

  try {
    const parsedAttachments = JSON.parse(attachments);
    return Array.isArray(parsedAttachments) ? parsedAttachments[0] || "" : attachments;
  } catch {
    return attachments;
  }
};

const getLogisticsUrl = (invoice) => getAttachmentUrl(invoice?.logistics_attachments);
const getInvoiceUrl = (invoice) => getAttachmentUrl(invoice?.invoice_attachments);

const GoldUserDashboard = () => {
  const [goldUser, setGoldUser] = useState(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userResponse = await userDetails();
        const user = userResponse?.data?.userDetails ?? userResponse?.data?.user ?? userResponse?.data ?? userResponse;
        setGoldUser(user?.gold_user || null);
      } catch (error) {
        console.error("Failed to load Gold User dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  const salesTarget = Number(goldUser?.sales_target || 0);
  const totalSale = Number(goldUser?.total_sale || 0);
  const hasAchievedTarget = Number(goldUser?.target_achived) === 1;
  const targetProgress = salesTarget > 0
    ? Math.min(100, Math.round((totalSale / salesTarget) * 100))
    : 0;
  const targetProgressColor = targetProgress <= 30
    ? "#e74c3c"
    : targetProgress <= 50
      ? "#f28c28"
      : targetProgress <= 80
        ? "#7ac943"
        : "#13aa5d";
  const mCoin = Number(goldUser?.token_m_coin || 0);
  const displayedInvoices = useMemo(() => Object.values(goldUser?.monthly_invoice || {})
    .flatMap((month) => month?.invoice_details || [])
    .sort((first, second) => new Date(second?.created_at || 0) - new Date(first?.created_at || 0))
    .slice(0, 6), [goldUser]);
  const monthlySales = useMemo(() => {
    const monthLabels = String(goldUser?.month_name || "")
      .split(",")
      .map((month) => month.trim())
      .filter(Boolean);
    const monthlyInvoices = goldUser?.monthly_invoice || {};
    const currentDate = new Date();
    const currentMonthKey = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${currentDate.getFullYear()}`;
    let cumulativeSale = 0;

    return Object.entries(monthlyInvoices).map(([monthKey, monthData], index) => {
      const amount = Number(monthData?.total_order_amount || 0);
      const [monthNumber, yearNumber] = monthKey.split("-").map(Number);
      const monthDate = new Date(yearNumber, monthNumber - 1, 1);
      const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      cumulativeSale += amount;

      return {
        key: monthKey,
        label: monthLabels[index] || monthKey,
        amount,
        achievedPercentage: salesTarget > 0 ? Math.min(100, Math.round((cumulativeSale / salesTarget) * 100)) : 0,
        isCurrent: monthKey === currentMonthKey,
        isFuture: monthDate > currentMonthDate,
      };
    });
  }, [goldUser, salesTarget]);
  const highestMonthlySale = Math.max(...monthlySales.map((month) => month.amount), 0);
  const selectedMonth = monthlySales.find((month) => month.key === selectedMonthKey);
  const dailySales = useMemo(() => {
    if (!selectedMonthKey) return [];

    const [monthNumber, yearNumber] = selectedMonthKey.split("-").map(Number);
    const daysInMonth = new Date(yearNumber, monthNumber, 0).getDate();
    const dailyAmounts = Array(daysInMonth).fill(0);
    const invoices = goldUser?.monthly_invoice?.[selectedMonthKey]?.invoice_details || [];

    invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice?.created_at);
      if (Number.isNaN(invoiceDate.getTime()) || invoiceDate.getMonth() + 1 !== monthNumber || invoiceDate.getFullYear() !== yearNumber) return;

      const amount = invoice?.invoice_products?.reduce(
        (total, product) => total + Number(product?.billed_amt || 0),
        0,
      ) || Number(invoice?.grand_total || 0);
      dailyAmounts[invoiceDate.getDate() - 1] += amount;
    });

    return dailyAmounts.map((amount, index) => ({
      key: `${selectedMonthKey}-${index + 1}`,
      label: index + 1,
      amount,
    }));
  }, [goldUser, selectedMonthKey]);
  const chartBars = selectedMonthKey ? dailySales : monthlySales;
  const highestChartSale = Math.max(...chartBars.map((bar) => bar.amount), 0);

  const openUrl = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <UserProfileLayout>
      <section className="gold-dashboard-page">
        <div className="gold-dashboard-heading">
          <div>
            <span className="gold-dashboard-kicker"><FaMedal /> Gold Member Area</span>
            <h1>Gold Dashboard</h1>
            <p>Track your Gold sales goal, performance, and recent orders.</p>
          </div>
          {/* <div className="gold-dashboard-period"><FaRegCalendarAlt /> Current validity period</div> */}
        </div>

        <div className="gold-dashboard-grid">
          <article className="gold-panel gold-overview-panel">
            <div className="gold-panel-title"><span className="gold-icon-circle"><FaChartLine /></span><h2>{selectedMonth ? `${selectedMonth.label} Daily Sales` : "Total Sales Overview"}</h2>{selectedMonth ? <button className="gold-chart-back-button" type="button" onClick={() => setSelectedMonthKey(null)}>Back to Months</button> : <button type="button"><FaEllipsisH /></button>}</div>
            <div className="gold-overview-number"><small>Sales Target: </small> {formatCurrency(salesTarget)}</div>
            <div className="gold-dashboard-heading"><p>{numberToIndianWords(salesTarget)}</p></div>
            <p className="gold-positive"><FaArrowUp /> Sales target for the current Gold period</p>
            <div className={`gold-bar-chart ${selectedMonth ? "daily-sales-chart" : ""}`}>
              {chartBars.map((bar) => {
                const height = bar.amount > 0 && highestChartSale > 0
                  ? Math.max(4, (bar.amount / highestChartSale) * 100)
                  : 0;

                return (
                  <div
                    className={`gold-bar-item ${selectedMonth ? "daily" : ""} ${bar.isCurrent ? "featured" : ""}`}
                    key={bar.key}
                    data-amount={formatCurrency(bar.amount)}
                    onClick={selectedMonth ? undefined : () => setSelectedMonthKey(bar.key)}
                    onKeyDown={selectedMonth ? undefined : (event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedMonthKey(bar.key);
                    }}
                    role={selectedMonth ? undefined : "button"}
                    tabIndex={selectedMonth ? undefined : 0}
                  >
                    {!selectedMonth && !bar.isFuture && <span className="gold-bar-value">{bar.achievedPercentage}%</span>}
                    <div className="gold-bar-track"><div className="gold-bar-fill" style={{ height: `${height}%` }} /></div>
                    <small>{bar.label}</small>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="gold-panel gold-performance-panel">
            <div className="gold-panel-title"><span className="gold-icon-circle"><FaStore /></span><h2>Sales Performance</h2><button type="button"><FaEllipsisH /></button></div>
            <div className="gold-gauge" style={{ "--gold-progress": `${targetProgress * 1.8}deg`, "--gold-progress-color": targetProgressColor }}><div><strong>{targetProgress}%</strong><span>Total Sale: {formatCurrency(totalSale)}</span></div></div>
            <div className="gold-mini-stats"><div><span>Sales Target</span><strong>{formatCurrency(salesTarget)}</strong></div><div><span>Gold M Coin</span><strong>{hasAchievedTarget ? "Target Achieved" : mCoin.toLocaleString("en-IN")}</strong></div></div>
            <div className="gold-notice"><FaMedal /> Keep growing to unlock your Gold M Coin benefit.</div>
          </article>

          <article className="gold-panel gold-transactions-panel">
            <div className="gold-panel-title"><span className="gold-icon-circle"><FaRegFileAlt /></span><h2>Recent Transaction</h2><button type="button"><FaEllipsisH /></button></div>
            <div className="gold-transaction-table-wrap">
              <table className="gold-transaction-table">
                <thead><tr><th>Invoice No</th><th>Date &amp; Time</th><th>Amount</th><th>Invoice Download</th><th>Logistic Download</th></tr></thead>
                <tbody>
                  {displayedInvoices.length ? displayedInvoices.map((invoice, index) => {
                    const invoiceUrl = getInvoiceUrl(invoice);
                    const logisticsUrl = getLogisticsUrl(invoice);

                    return (
                      <tr key={invoice?.id || index}>
                        <td>#{invoice?.invoice_no || invoice?.id || "-"}</td>
                        <td>{formatDate(invoice?.created_at)}</td>
                        <td><span className="gold-status">{formatCurrency(invoice?.invoice_products?.reduce((total, product) => total + Number(product?.billed_amt || 0), 0) || invoice?.grand_total)}</span></td>
                        <td>
                          <button
                            className="ordertbl-icon-btn repeat"
                            title="Download Invoice"
                            onClick={() => openUrl(invoiceUrl)}
                            type="button"
                            disabled={!invoiceUrl}
                          >
                            <img src={SaveLater} alt="Download invoice" />
                          </button>
                        </td>
                        <td>
                          <button
                            className="ordertbl-icon-btn repeat"
                            title="Download Logistic"
                            onClick={() => openUrl(logisticsUrl)}
                            type="button"
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
                        
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan="5" className="gold-empty-row">No recent transactions available.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>

          <div className="gold-side-stack">
            <article className="gold-panel gold-market-panel"><div className="gold-panel-title"><span className="gold-icon-circle"><FaRupeeSign /></span><h2>Gold Benefits</h2><button type="button"><FaEllipsisH /></button></div><div className="gold-benefit"><span>Valid From</span><strong>{formatDate(goldUser?.valid_from)}</strong></div><div className="gold-benefit"><span>Valid To</span><strong>{formatDate(goldUser?.valid_to)}</strong></div><div className="gold-benefit highlight"><span>M Coin Reward</span><strong>{hasAchievedTarget ? "Target Achieved" : mCoin.toLocaleString("en-IN")}</strong></div></article>
            <article className="gold-panel gold-product-panel"><div className="gold-panel-title"><span className="gold-icon-circle"><FaMedal /></span><h2>Gold Status</h2><button type="button"><FaEllipsisH /></button></div><div className="gold-status-card"><FaMedal /><strong>Active Gold User</strong><span>Your account is eligible for Gold benefits.</span></div></article>
          </div>
        </div>
      </section>
    </UserProfileLayout>
  );
};

export default GoldUserDashboard;
