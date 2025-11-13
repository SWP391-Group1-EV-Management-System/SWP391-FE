import { useState, useCallback } from "react";

// Hook lấy random pin từ backend
export const useRandomPin = () => {
  const [pinData, setPinData] = useState(null);
  const [maxChargingTime, setMaxChargingTime] = useState(240);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy random pin
  const fetchRandomPin = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error("userId is required");
      }

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

      const formattedData = {
        pinNow: data.currentPin,
        minuteMax: data.minuteMax,
      };

      setPinData(formattedData);
      setMaxChargingTime(data.minuteMax || 240);

      return formattedData;
    } catch (err) {
      setError(err.message);
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
