import { useState } from "react";
import { logoutApi } from "../services/authService";

export default function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutApi();
    } catch (e) {
      console.error("Logout API error:", e);
      setError(e);
      // continue to clear client session even if server fails
    } finally {
      try { localStorage.removeItem("user"); } catch (e) { console.error(e); }
      setLoading(false);
      // redirect to login (force reload)
      window.location.href = "/login";
    }
  };

  return { logout, loading, error };
}