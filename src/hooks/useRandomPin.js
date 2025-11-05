import { useState, useCallback } from "react";

/**
 * Custom hook để fetch random pin data từ backend
 * API mới: /api/car/random_pin?userId={userId}
 * Backend sẽ lưu currentPin vào Redis
 * @returns {Object} { pinData, maxChargingTime, loading, error, fetchRandomPin }
 */
export const useRandomPin = () => {
  const [pinData, setPinData] = useState(null);
  const [maxChargingTime, setMaxChargingTime] = useState(240); // Default value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomPin = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error("userId is required");
      }

      console.log("🔋 [useRandomPin] Fetching random pin for userId:", userId);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const response = await fetch(
        `${apiUrl}/api/car/random_pin?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch random pin");
      }

      const data = await response.json();
      console.log("✅ [useRandomPin] Random pin data:", data);

      // ✅ API mới trả về: { currentPin, minuteMax }
      const formattedData = {
        pinNow: data.currentPin,
        minuteMax: data.minuteMax,
      };

      setPinData(formattedData);
      setMaxChargingTime(data.minuteMax || 240);

      return formattedData;
    } catch (err) {
      console.error("❌ [useRandomPin] Error fetching random pin:", err);
      setError(err.message);
      // Giữ nguyên maxChargingTime mặc định nếu lỗi
      setMaxChargingTime(240);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pinData,
    maxChargingTime,
    loading,
    error,
    fetchRandomPin,
  };
};
