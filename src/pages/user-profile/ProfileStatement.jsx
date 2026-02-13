import React, { useEffect, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import View from "../../assets/icons/View.svg";
import { useNavigate, Link } from "react-router-dom";
import { getStatementList } from "../../api/apiRequest";

const formatINR = (value) => {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
};

// Optional: show Dr/Cr based on sign
const formatDrCr = (value) => {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  const label = n >= 0 ? "Dr" : "Cr";
  return `${formatINR(abs)} ${label}`;
};

const ProfileStatement = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [dueAmount, setDueAmount] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStatementList();

      if (!res?.res) {
        setError(res?.msg || "Failed to load statements.");
        setRows([]);
        setDueAmount(0);
        setOverdueAmount(0);
        return;
      }

      setRows(Array.isArray(res?.data) ? res.data : []);
      setDueAmount(res?.dueAmount ?? 0);
      setOverdueAmount(res?.overdueAmount ?? 0);
    } catch (e) {
      setError("Failed to load statement list.");
      setRows([]);
      setDueAmount(0);
      setOverdueAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const goDetails = (item) => {
    navigate("/profile-statement-details", {
      state: {
        party_code: item.acc_code,     // ✅ mandatory param
        data_from: "database",
      },
    });
  };

  return (
    <UserProfileLayout>
      <div>
        <div className="statementHr">
          <div className="statementpaybox">
            <div className="statementpayboxInfo">
              <h2>{formatDrCr(dueAmount)}</h2>
              <p>Due Balance</p>
            </div>
          </div>

          <div className="statementpaybox">
            <div className="statementpayboxInfo">
              <h2>{formatDrCr(overdueAmount)}</h2>
              <p>Overdue Balance</p>
            </div>
          </div>
        </div>

        <div className="statementTable">
          <div className="order-table-hr">
            <div className="order-table-hrLft">
              <h2>Statement</h2>
            </div>
          </div>

          <div className="order-table-container statement-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  {/* <th>Name</th> */}
                  <th>Party Name</th>
                  <th>Party Code</th>
                  <th>Ledger Code</th>
                  <th>GST No</th>
                  <th>Options</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "red" }}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && rows.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No statements found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  rows.map((item) => (
                    <tr key={item.id}>
                      {/* <td>
                        <Link to={`/profileStatementDetails/${item.id}`} className="order-link" state={{ item }} >
                          {item.id}
                        </Link>
                      </td> */}
                      <td>
                        <Link to={`/profile-statement-details`} className="order-link" 
                        state={{
                            acc_code: item.acc_code,
                            data_from: 'database'
                          }} 
                        >
                          {item.company_name || "-"}
                        </Link>  
                      </td>
                      <td>{item.acc_code || "-"}</td>
                      <td>{item.leadger_name || "-"}</td>
                      <td>{item.gstin || "-"}</td> 
                      <td className="actions">
                        <button type="button" className="ordertbl-icon-btn view" title="View" onClick={() => goDetails(item)} >
                          <img src={View} alt="view" />
                        </button> 
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default ProfileStatement;
