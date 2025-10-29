/**
 * statusUtils.js - Helper functions để quản lý driver status
 *
 * localStorage key: "driverStatus"
 * Giá trị hợp lệ: "session" | "waiting" | "booking" | null
 */

const STORAGE_KEY = "driverStatus";

/**
 * Lưu status vào localStorage và dispatch event
 * @param {string} status - "session" | "waiting" | "booking"
 */
export const setDriverStatus = (status) => {
  try {
    if (!status) {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ Removed driver status");
    } else {
      const normalizedStatus = status.toLowerCase();
      localStorage.setItem(STORAGE_KEY, normalizedStatus);
      console.log("✅ Set driver status:", normalizedStatus);
    }

    // Dispatch custom event để Menu update ngay (cùng tab)
    window.dispatchEvent(
      new CustomEvent("driverStatusChanged", {
        detail: { status: status ? status.toLowerCase() : null },
      })
    );
  } catch (error) {
    console.error("Error setting driver status:", error);
  }
};

/**
 * Lấy status hiện tại từ localStorage
 * @returns {string|null} - "session" | "waiting" | "booking" | null
 */
export const getDriverStatus = () => {
  try {
    const status = localStorage.getItem(STORAGE_KEY);
    return status ? status.toLowerCase() : null;
  } catch (error) {
    console.error("Error getting driver status:", error);
    return null;
  }
};

/**
 * Xóa status khỏi localStorage
 */
export const clearDriverStatus = () => {
  setDriverStatus(null);
};

/**
 * Kiểm tra xem có status hay không
 * @returns {boolean}
 */
export const hasDriverStatus = () => {
  return !!getDriverStatus();
};

/**
 * Xử lý response từ API và tự động lưu status
 * @param {Object} response - Response từ API {status: "...", ...}
 * @returns {Object} - Response gốc
 */
export const handleApiResponseWithStatus = (response) => {
  if (response?.status) {
    setDriverStatus(response.status);
  }
  return response;
};

export default {
  setDriverStatus,
  getDriverStatus,
  clearDriverStatus,
  hasDriverStatus,
  handleApiResponseWithStatus,
};
