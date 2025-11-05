/**
 * statusUtils.js - Driver status event dispatcher
 *
 * ✅ Redis-based: Status lưu ở backend Redis
 * Frontend chỉ dispatch event để trigger useDriverStatus hook refetch
 */

import { cleanupAllCountdowns } from "./countdownUtils";

/**
 * Trigger refetch driver status từ Redis
 * Dispatch event để useDriverStatus hook gọi API lấy status mới
 *
 * @param {string|null} status - Optional status hint for logging
 */
export const setDriverStatus = (status) => {
  try {
    console.log(
      "🔄 [statusUtils] Trigger status refetch:",
      status || "cleared"
    );

    // ✅ Xóa tất cả countdown keys khi status thay đổi
    const cleanedCount = cleanupAllCountdowns();
    if (cleanedCount > 0) {
      console.log(`🧹 [statusUtils] Cleaned ${cleanedCount} countdown keys`);
    }

    // Dispatch event để useDriverStatus hook refetch từ Redis
    window.dispatchEvent(
      new CustomEvent("driverStatusChanged", {
        detail: { status: status ? status.toLowerCase() : null },
      })
    );
  } catch (error) {
    console.error("❌ [statusUtils] Error dispatching event:", error);
  }
};

/**
 * Xóa status và trigger refetch
 * Backend sẽ xóa khỏi Redis
 */
export const clearDriverStatus = () => {
  // ✅ Xóa countdown keys trước khi clear status
  cleanupAllCountdowns();
  setDriverStatus(null);
};

export default {
  setDriverStatus,
  clearDriverStatus,
};
