import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginFromAdmin } from "../api/apiRequestChild";

function getParamsFromHash() {
  // Example hash: "#/login-from-admin?user_id=MjQxODU&staff_id=MQ"
  const hash = window.location.hash || "";
  const idx = hash.indexOf("?");
  if (idx === -1) return { user_id: "", staff_id: "" };

  const qs = hash.slice(idx + 1); // remove '?'
  const params = new URLSearchParams(qs);
  // alert(params.get("user_id"));
  setUserId(params.get("user_id") || "");

  return {
    user_id: params.get("user_id") || "",
    staff_id: params.get("staff_id") || "",
  };
}

export default function LoginFromAdmin() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [userId, setUserId] = useState("");
  const [staffId, setStaffId] = useState("");
  const handleLogin = async () => {
      if (!validate()) return;
      try {
        const login_info = useEmail
      ? { email, password }
      : { email: "", phone: selectedCountry.code + mobile, password }; //  added `email: ""`
  
        const res = await loginFromAdmin(userId);
        const data = await res.json();
        console.log("Login API Response:", data);
  
        if (data && data.id) {
          localStorage.setItem("mazingBusinessLoginInfo", JSON.stringify(data));
          navigate("/profileDashbord");
        } else if (data && data.res === false) {
          setErrors({ general: data.msg || "Login failed" });
          setTimeout(() => setErrors({}), 3000);
        } else {
          setErrors({ general: data.message || "Login failed" });
          setTimeout(() => setErrors({}), 3000);
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({ general: "Something went wrong. Please try again." });
        setTimeout(() => setErrors({}), 3000);
      }
  };

  useEffect(() => {
    (async () => {
      const { user_id, staff_id } = getParamsFromHash();

      if (!user_id || !staff_id) {
        setErr("Missing user_id or staff_id in URL.");
        return;
      }

      try {
        const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000")
          .replace(/\/$/, "");

        // ✅ call your Laravel endpoint (change route if needed)
        const url =
          `${API_BASE}/get-data-from-react?user_id=${encodeURIComponent(user_id)}` +
          `&staff_id=${encodeURIComponent(staff_id)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.res === false || data?.success === false) {
          setErr(data?.msg || data?.message || `Request failed (HTTP ${res.status})`);
          return;
        }

        // store whatever you need
        localStorage.setItem("loginFromAdmin", JSON.stringify({ user_id, staff_id, data }));

        // ✅ optional: remove query params from hash after success
        if (window.location.hash.includes("?")) {
          window.history.replaceState({}, "", window.location.hash.split("?")[0]);
        }

        navigate("/profileDashbord", { replace: true });
      } catch (e) {
        console.error(e);
        setErr("Something went wrong.");
      }
    })();
  }, [navigate]);

  if (err) return <div style={{ padding: 20, color: "red" }}>{err}</div>;
  return <div style={{ padding: 20 }}>Logging you in…</div>;
}