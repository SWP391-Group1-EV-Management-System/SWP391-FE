import { useState } from "react";
import { logoutApi } from "../services/authService";

export default function useAuth() {
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
    } finally {
      localStorage.removeItem("user");
      setLoading(false);
      window.location.href = "/login";
    }
  };

  return { logout, loading, error };
}