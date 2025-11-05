import api from "../utils/axios";

/**
 * Add user to waiting list (accept to charge)
 */
export const addToWaitingList = async (chargingPostId) => {
  try {
    const response = await api.post(`/api/waiting-list/add/${chargingPostId}`);
    return response.data;
  } catch (error) {
    console.error("Error adding to waiting list:", error);
    throw error;
  }
};

/**
 * Cancel waiting list
 */
export const cancelWaitingList = async (waitingListId) => {
  try {
    const response = await api.post(
      `/api/waiting-list/cancel/${waitingListId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error canceling waiting list:", error);
    throw error;
  }
};

/**
 * Get waiting list by post ID
 */
export const getWaitingListByPost = async (chargingPostId) => {
  try {
    const response = await api.get(
      `/api/waiting-list/queue/post/${chargingPostId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching waiting list by post:", error);
    throw error;
  }
};

/**
 * Get waiting list by station ID
 */
export const getWaitingListByStation = async (chargingStationId) => {
  try {
    const response = await api.get(
      `/api/waiting-list/queue/station/${chargingStationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching waiting list by station:", error);
    throw error;
  }
};

/**
 * Get waiting list by user ID
 */
export const getWaitingListByUser = async (userId) => {
  try {
    console.log(
      "🌐 [waitingListService] Calling API:",
      `/api/waiting-list/queue/users/${userId}`
    );
    const response = await api.get(`/api/waiting-list/queue/users/${userId}`);
    console.log("✅ [waitingListService] Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching waiting list by user:", error);
    throw error;
  }
};

/**
 * Get waiting list by date
 */
export const getWaitingListByDate = async (date) => {
  try {
    const response = await api.get(`/api/waiting-list/queue/date?date=${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching waiting list by date:", error);
    throw error;
  }
};

/**
 * Get waiting list by waiting list ID
 */
export const getWaitingListById = async (waitingListId) => {
  try {
    console.log(
      "🌐 [waitingListService] Calling API:",
      `/api/waiting-list/queue/${waitingListId}`
    );
    const response = await api.get(`/api/waiting-list/queue/${waitingListId}`);
    console.log("✅ [waitingListService] Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching waiting list by ID:", error);
    throw error;
  }
};

// ⚠️ WARNING: DO NOT add getQueuePosition or any API to fetch queue position!
// ⚠️ Queue position (rank) is ONLY accurate from:
//    1. /api/booking/create response (initial rank)
//    2. WebSocket real-time messages (position updates)
// ⚠️ Other APIs like getWaitingListByPost DO NOT return correct rank/position!

/**
 * Accept early charging offer (when A rút sạc sớm)
 * User đồng ý sạc ngay thay vì đợi đến giờ dự kiến
 */
export const acceptEarlyCharging = async (userId, chargingPostId) => {
  try {
    console.log("🌐 [waitingListService] Accepting early charging:");
    console.log("   - userId:", userId);
    console.log("   - chargingPostId:", chargingPostId);
    const response = await api.post(
      `/api/waiting-list/accept-early-charging/${userId}/${chargingPostId}`
    );
    console.log("✅ [waitingListService] Accept response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error accepting early charging:", error);
    throw error;
  }
};

/**
 * Decline early charging offer (when A rút sạc sớm)
 * User từ chối, chọn đợi đến đúng giờ dự kiến
 */
export const declineEarlyCharging = async (userId, chargingPostId) => {
  try {
    console.log("🌐 [waitingListService] Declining early charging:");
    console.log("   - userId:", userId);
    console.log("   - chargingPostId:", chargingPostId);
    const response = await api.post(
      `/api/waiting-list/decline-early-charging/${userId}/${chargingPostId}`
    );
    console.log("✅ [waitingListService] Decline response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error declining early charging:", error);
    throw error;
  }
};
