import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginFromAdmin() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const handoff = params.get("handoff");

      if (!handoff) {
        setErr("Missing handoff token.");
        return;
      }

      try {
        // ✅ If Laravel is another domain, use full URL:
        // const API_BASE = "https://your-laravel-domain.com";
        // const url = `${API_BASE}/impersonation/handoff?handoff=${encodeURIComponent(handoff)}`;

        const url = `/impersonation/handoff?handoff=${encodeURIComponent(handoff)}`;

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        if (!res.ok) {
          setErr(data?.message || "Handoff failed.");
          return;
        }

        // ✅ Store impersonation info for later API calls if you want
        localStorage.setItem("mazingBusinessLoginInfo", JSON.stringify(data));
        // data = { user_id, staff_id, cl_name, impersonating: true }

        // ✅ Remove token from URL (recommended)
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("handoff");
        window.history.replaceState({}, "", cleanUrl.toString());

        // ✅ Now go to your real React page
        navigate("/profileDashbord", { replace: true });
        // or navigate("/quickorder", { replace: true });

      } catch (e) {
        setErr("Something went wrong. Please try again.");
      }
    };

    run();
  }, [navigate]);

  if (err) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Login From Admin</h3>
        <p style={{ color: "red" }}>{err}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Logging you in…</h3>
      <p>Please wait</p>
    </div>
  );
}