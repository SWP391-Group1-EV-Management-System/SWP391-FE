import { useState, useCallback } from "react";
import { energySessionService } from "../services/energySessionService";

/**
 * Hook để quản lý charging preference (targetPin và maxSecond)
 * Gọi API update-preference trước khi bắt đầu sạc
 */
export const useChargingPreference = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cập nhật preference xuống backend
   * @param {string} userId - ID của user
   * @param {number} currentBattery - % pin hiện tại
   * @param {number} selectedMinutes - Số phút đã chọn
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  const updatePreference = useCallback(
    async (userId, currentBattery, selectedMinutes) => {
      try {
        setLoading(true);
        setError(null);

        // Tính toán targetPin và maxSecond
        const batteryIncrease = Math.floor(selectedMinutes * (60 / 13.25)); // 13.25 giây = 1% pin
        const targetPin = Math.min(100, currentBattery + batteryIncrease); // Cap tối đa 100%
        const maxSecond = selectedMinutes * 60; // Chuyển phút sang giây

        console.log("📊 [useChargingPreference] Updating preference:", {
          userId,
          currentBattery,
          selectedMinutes,
          batteryIncrease,
          targetPin,
          maxSecond,
        });

        // Gọi API
        const result = await energySessionService.updateChargingPreference(
          userId,
          targetPin,
          maxSecond
        );

        if (!result.success) {
          setError(result.message || "Không thể cập nhật preference");
          return result;
        }

        console.log(
          "✅ [useChargingPreference] Preference updated successfully"
        );
        return result;
      } catch (err) {
        const errorMessage = err.message || "Lỗi khi cập nhật preference";
        console.error("❌ [useChargingPreference] Error:", err);
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
