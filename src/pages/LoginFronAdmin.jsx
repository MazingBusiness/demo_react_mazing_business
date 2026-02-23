import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginFromAdmin() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const handoff = params.get("handoff");

      if (!handoff) {
        setErr("Missing handoff token.");
        return;
      }

      try {
        // If Laravel is different domain, set in .env:
        // VITE_API_BASE=https://your-laravel-domain.com
        const API_BASE = (import.meta?.env?.VITE_API_BASE || "").replace(/\/$/, "");

        const url = `${API_BASE}/impersonation/handoff?handoff=${encodeURIComponent(handoff)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Accept": "application/json" },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.success) {
          setErr(data?.message || "Handoff failed.");
          return;
        }

        localStorage.setItem("adminImpersonation", JSON.stringify(data));

        // remove token from URL
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("handoff");
        window.history.replaceState({}, "", cleanUrl.toString());

        navigate("/profileDashbord", { replace: true });
      } catch (e) {
        setErr("Something went wrong.");
      }
    })();
  }, [navigate]);

  if (err) return <div style={{ padding: 20, color: "red" }}>{err}</div>;

  return <div style={{ padding: 20 }}>Logging you in…</div>;
}
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function LoginFromAdmin() {
//   const navigate = useNavigate();
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     (async () => {
//       const params = new URLSearchParams(window.location.search);
//       const handoff = params.get("handoff");

//       if (!handoff) {
//         setErr("Missing handoff token.");
//         return;
//       }

//       try {
//         // If Laravel is DIFFERENT DOMAIN, use full URL:
//         // const API_BASE = "https://your-laravel-domain.com";
//         // const url = `${API_BASE}/impersonation/handoff?handoff=${encodeURIComponent(handoff)}`;

//         const url = `/impersonation/handoff?handoff=${encodeURIComponent(handoff)}`;

//         const res = await fetch(url, { credentials: "include" });
//         const data = await res.json();

//         if (!res.ok || !data?.success) {
//           setErr(data?.message || "Handoff failed.");
//           return;
//         }

//         localStorage.setItem("adminImpersonation", JSON.stringify(data));

//         // remove token from URL
//         const cleanUrl = new URL(window.location.href);
//         cleanUrl.searchParams.delete("handoff");
//         window.history.replaceState({}, "", cleanUrl.toString());

//         navigate("/profileDashbord", { replace: true });
//       } catch (e) {
//         setErr("Something went wrong.");
//       }
//     })();
//   }, [navigate]);

//   if (err) return <div style={{ padding: 20, color: "red" }}>{err}</div>;

//   return <div style={{ padding: 20 }}>Logging you in…</div>;
// }