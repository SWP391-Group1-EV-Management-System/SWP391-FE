import { useState, useCallback } from "react";
import { energySessionService } from "../services/energySessionService";

// Hook quản lý charging preference (targetPin và maxSecond)
export const useChargingPreference = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cập nhật preference xuống backend
  const updatePreference = useCallback(
    async (userId, currentBattery, selectedMinutes) => {
      try {
        setLoading(true);
        setError(null);

        const batteryIncrease = Math.floor(selectedMinutes * (60 / 13.25));
        const targetPin = Math.min(100, currentBattery + batteryIncrease);
        const maxSecond = selectedMinutes * 60;

        const result = await energySessionService.updateChargingPreference(
          userId,
          targetPin,
          maxSecond
        );

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
    },
    []
  );

  return {
    updatePreference,
    loading,
    error,
  };
};
