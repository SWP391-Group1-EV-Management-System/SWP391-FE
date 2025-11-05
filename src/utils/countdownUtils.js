/**
 * countdownUtils.js - Countdown localStorage cleanup utilities
 *
 * Quản lý việc cleanup countdown keys trong localStorage
 */

/**
 * Xóa tất cả countdown keys trong localStorage
 * @param {string[]} excludeKeys - Array of keys to exclude from cleanup
 */
export const cleanupAllCountdowns = (excludeKeys = []) => {
  try {
    const allKeys = Object.keys(localStorage);
    const countdownKeys = allKeys.filter(
      (key) =>
        (key.startsWith("countdown_") || key.startsWith("countdown_frozen_")) &&
        !excludeKeys.includes(key)
    );

    if (countdownKeys.length > 0) {
      console.log(
        "🧹 [countdownUtils] Cleaning up countdown keys:",
        countdownKeys
      );
      countdownKeys.forEach((key) => localStorage.removeItem(key));
      return countdownKeys.length;
    }
    return 0;
  } catch (err) {
    console.error("❌ [countdownUtils] Error cleaning countdown keys:", err);
    return 0;
  }
};

/**
 * Xóa countdown keys cũ hơn X ngày
 * @param {number} days - Số ngày (mặc định 1)
 */
export const cleanupExpiredFrozenCountdowns = (days = 1) => {
  try {
    const allKeys = Object.keys(localStorage);
    const frozenKeys = allKeys.filter((key) =>
      key.startsWith("countdown_frozen_")
    );

    if (frozenKeys.length === 0) return 0;

    // Note: Frozen keys chỉ lưu "HH:MM:SS", không có timestamp
    // Vì vậy ta sẽ xóa tất cả frozen keys khi cleanup
    console.log(
      "🧹 [countdownUtils] Cleaning expired frozen keys:",
      frozenKeys
    );
    frozenKeys.forEach((key) => localStorage.removeItem(key));
    return frozenKeys.length;
  } catch (err) {
    console.error(
      "❌ [countdownUtils] Error cleaning expired frozen keys:",
      err
    );
    return 0;
  }
};

/**
 * Xóa countdown keys cụ thể theo pattern
 * @param {string} pattern - Pattern để match (e.g., bookingId, waitingListId)
 */
export const cleanupCountdownByPattern = (pattern) => {
  try {
    const allKeys = Object.keys(localStorage);
    const matchingKeys = allKeys.filter(
      (key) =>
        (key.startsWith("countdown_") || key.startsWith("countdown_frozen_")) &&
        key.includes(pattern)
    );

    if (matchingKeys.length > 0) {
      console.log(
        `🧹 [countdownUtils] Cleaning countdown keys matching "${pattern}":`,
        matchingKeys
      );
      matchingKeys.forEach((key) => localStorage.removeItem(key));
      return matchingKeys.length;
    }
    return 0;
  } catch (err) {
    console.error("❌ [countdownUtils] Error cleaning by pattern:", err);
    return 0;
  }
};

/**
 * Lấy danh sách tất cả countdown keys hiện có
 */
export const getAllCountdownKeys = () => {
  try {
    const allKeys = Object.keys(localStorage);
    return allKeys.filter(
      (key) =>
        key.startsWith("countdown_") || key.startsWith("countdown_frozen_")
    );
  } catch (err) {
    console.error("❌ [countdownUtils] Error getting countdown keys:", err);
    return [];
  }
};

export default {
  cleanupAllCountdowns,
  cleanupExpiredFrozenCountdowns,
  cleanupCountdownByPattern,
  getAllCountdownKeys,
};
