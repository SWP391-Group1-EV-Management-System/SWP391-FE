import { useState, useEffect } from "react";
import { getUserStatus } from "../services/userStatusService";
import { useAuth } from "./useAuth";

/**
 * Hook để lấy driver status từ Redis thay vì localStorage
 * Auto-refresh khi có thay đổi
 */
export const useDriverStatus = () => {
  const { user } = useAuth();
  const userId = user?.userId || user?.id;

  const [driverStatus, setDriverStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch status từ Redis
  const fetchStatus = async () => {
    if (!userId) {
      setDriverStatus(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const status = await getUserStatus(userId);
      setDriverStatus(status ? status.toLowerCase() : null);
      console.log("🔄 [useDriverStatus] Fetched status:", status);
    } catch (err) {
      console.error("❌ [useDriverStatus] Error:", err);
      setError(err.message);
      setDriverStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [userId]);

  // Listen to custom events để refresh (khi booking/charging được tạo)
  useEffect(() => {
    const handleStatusChanged = () => {
      console.log("🔔 [useDriverStatus] Status changed event, refetching...");
      fetchStatus();
    };

    window.addEventListener("driverStatusChanged", handleStatusChanged);

    return () => {
      window.removeEventListener("driverStatusChanged", handleStatusChanged);
    };
  }, [userId]);

  return {
    driverStatus,
    loading,
    error,
    refetch: fetchStatus,
  };
};

export default useDriverStatus;
