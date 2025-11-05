import axios from "../utils/axios";

/**
 * User Status Service - Tương tác với Redis để lấy/set driver status
 * Backend API: GET /api/users/status/{userId}
 */

/**
 * Lấy status của user từ Redis
 * @param {string} userId - ID của user
 * @returns {Promise<string|null>} - Status của user (booking, charging, waiting, null)
 */
export const getUserStatus = async (userId) => {
  try {
    if (!userId) {
      console.warn("⚠️ [userStatusService] No userId provided");
      return null;
    }

    const response = await axios.get(`/api/users/status/${userId}`);
    console.log(
      `✅ [userStatusService] Got user status for ${userId}:`,
      response.data
    );
    return response.data; // Backend trả về string: "booking", "charging", "waiting", etc.
  } catch (error) {
    console.error("❌ [userStatusService] Error fetching user status:", error);
    // Nếu lỗi 404 hoặc không có status → return null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Set status của user vào Redis
 * @param {string} userId - ID của user
 * @param {string} status - Status: "booking", "charging", "waiting", null
 */
export const setUserStatus = async (userId, status) => {
  try {
    if (!userId) {
      console.warn(
        "⚠️ [userStatusService] No userId provided for setUserStatus"
      );
      return null;
    }

    // ✅ Call backend POST endpoint
    const response = await axios.post(`/api/users/status/${userId}`, {
      status: status,
    });

    console.log(
      `✅ [userStatusService] Set user status for ${userId}:`,
      status
    );

    // Dispatch event để useDriverStatus refetch
    window.dispatchEvent(
      new CustomEvent("driverStatusChanged", {
        detail: { status },
      })
    );

    return response.data;
  } catch (error) {
    console.error("❌ [userStatusService] Error setting user status:", error);
    throw error;
  }
};

export default {
  getUserStatus,
  setUserStatus,
};
