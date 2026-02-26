import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginFromAdmin } from "../api/apiRequestChild";

function getParams() {
  // ✅ supports BrowserRouter: /login-from-admin?user_id=...&staff_id=...
  const sp = new URLSearchParams(window.location.search);
  const u1 = sp.get("user_id");
  const s1 = sp.get("staff_id");
  if (u1 && s1) return { user_id: u1, staff_id: s1 };

  // ✅ supports HashRouter: #/login-from-admin?user_id=...&staff_id=...
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
    let alive = true;

    (async () => {
      const { user_id, staff_id } = getParams();

      if (!user_id || !staff_id) {
        if (alive) setErr("Missing user_id or staff_id in URL.");
        return;
      }

      try {
        const payload = { user_id, staff_id };

        const res = await loginFromAdmin(payload);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.res === false) {
          if (alive) {
            setErr(
              data?.msg ||
                data?.message ||
                `Login failed (HTTP ${res.status})`
            );
          }
          return;
        }

        localStorage.setItem("mazingBusinessLoginInfo", JSON.stringify(data));
        localStorage.setItem("mazingBusinessStaffId", JSON.stringify(staff_id));

        // ✅ clean URL (hash)
        if (window.location.hash.includes("?")) {
          window.history.replaceState({}, "", window.location.hash.split("?")[0]);
        }

        // ✅ clean URL (search)
        if (window.location.search.includes("?")) {
          window.history.replaceState({}, "", window.location.pathname + window.location.hash);
        }

        navigate("/quick-order", { replace: true });
      } catch (e) {
        console.error(e);
        if (alive) setErr("Something went wrong.");
      }
    })();

    return () => {
      alive = false; // prevent setState after unmount
    };
  }, [navigate]);

  if (err) return <div style={{ padding: 20, color: "red" }}>{err}</div>;
  return <div style={{ padding: 20 }}>Logging you in…</div>;
}