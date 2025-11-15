import { useState, useEffect } from "react";
import { getDashboardInformation } from "../services/dashboardService";

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardInformation();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu dashboard");
      console.error("Error in useDashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
};