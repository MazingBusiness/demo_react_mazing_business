import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginFromAdmin } from "../api/apiRequestChild";

function getParamsFromHash() {
  const hash = window.location.hash || "";
  const idx = hash.indexOf("?");
  if (idx === -1) return { user_id: "", staff_id: "" };

  const qs = hash.slice(idx + 1);
  const params = new URLSearchParams(qs);

  return {
    user_id: params.get("user_id") || "",
    staff_id: params.get("staff_id") || "",
  };
}

export default function LoginFromAdmin() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { user_id, staff_id } = getParamsFromHash();

      if (!user_id || !staff_id) {
        setErr("Missing user_id or staff_id in URL.");
        return;
      }

      try {
        // ✅ send object, not string
        const payload = { user_id, staff_id };

        const res = await loginFromAdmin(payload);
        const data = await res.json().catch(() => ({}));

        // ✅ handle backend error
        if (!res.ok || data?.res === false) {
          setErr(data?.msg || data?.message || `Login failed (HTTP ${res.status})`);
          return;
        }

        // ✅ success: save login info
        localStorage.setItem("mazingBusinessLoginInfo", JSON.stringify(data));

        // ✅ optional: clean hash query
        if (window.location.hash.includes("?")) {
          window.history.replaceState({}, "", window.location.hash.split("?")[0]);
        }

        // ✅ redirect
        navigate("/quick-order", { replace: true });
      } catch (e) {
        console.error(e);
        setErr("Something went wrong.");
      }
    })();
  }, [navigate]);

  if (err) return <div style={{ padding: 20, color: "red" }}>{err}</div>;
  return <div style={{ padding: 20 }}>Logging you in…</div>;
}