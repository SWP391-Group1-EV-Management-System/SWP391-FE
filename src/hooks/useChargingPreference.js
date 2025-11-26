import { useState, useCallback } from "react";
import { energySessionService } from "../services/energySessionService";

// Hook quản lý charging preference (targetPin và maxSecond)
export const useChargingPreference = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cập nhật preference xuống backend
  // NOTE: `selectedSeconds` is expected (FE will pass seconds)
  const updatePreference = useCallback(async (userId, currentBattery, selectedSeconds) => {
    try {
      setLoading(true);
      setError(null);

      // Hardcode target pin to 100 (user requested default)
      const targetPin = 100;
      const maxSecond = selectedSeconds; // already in seconds

      const result = await energySessionService.updateChargingPreference(userId, targetPin, maxSecond);

      if (!result.success) {
        setError(result.message || "Không thể cập nhật preference");
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi cập nhật preference";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updatePreference,
    loading,
    error,
  };
};
