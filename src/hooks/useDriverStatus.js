import { useState, useEffect } from "react";
import { getUserStatus } from "../services/userStatusService";
import { useAuth } from "./useAuth";

// Hook lấy driver status từ Redis
export const useDriverStatus = () => {
  const { user } = useAuth();
  const userId = user?.userId || user?.id;

  const [driverStatus, setDriverStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy status từ Redis
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
    } catch (err) {
      setError(err.message);
      setDriverStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ban đầu
  useEffect(() => {
    fetchStatus();
  }, [userId]);

  // Lắng nghe sự kiện thay đổi status
  useEffect(() => {
    const handleStatusChanged = () => {
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
