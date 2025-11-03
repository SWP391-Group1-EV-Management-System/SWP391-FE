import { useState, useEffect, useRef } from "react";

// ✅ LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_LOCATION: "gps_current_location",
  LAST_SENT_LOCATION: "gps_last_sent_location",
  TRACKING_STATUS: "gps_tracking_status",
  LAST_UPDATE_TIME: "gps_last_update_time",
};

/**
 * Load data từ localStorage
 */
const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`⚠️ Failed to load ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Save data vào localStorage
 */
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`⚠️ Failed to save ${key} to localStorage:`, error);
  }
};

/**
 * Hook để theo dõi vị trí GPS của người dùng
 * @param {boolean} isActive - Bật/tắt tracking (true khi chatbox mở)
 * @returns {object} { location, trackingStatus, isTracking, lastSentLocation }
 */
export const useLocationTracking = (isActive = false) => {
  // ✅ Khôi phục data từ localStorage khi component mount
  const [currentLocation, setCurrentLocation] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.CURRENT_LOCATION);
    if (loaded) {
      console.log("🔄 Restoring currentLocation from localStorage:", loaded);
    } else {
      console.log("ℹ️ No currentLocation in localStorage");
    }
    return loaded;
  });
  const [trackingStatus, setTrackingStatus] = useState(() => {
    const status = loadFromStorage(STORAGE_KEYS.TRACKING_STATUS) || "idle";
    console.log("🔄 Restoring trackingStatus:", status);
    return status;
  });
  const lastSentLocationRef = useRef(
    (() => {
      const loaded = loadFromStorage(STORAGE_KEYS.LAST_SENT_LOCATION);
      if (loaded) {
        console.log("🔄 Restoring lastSentLocation from localStorage:", loaded);
      }
      return loaded;
    })()
  ); // ✅ Vị trí ĐÃ GỬI lên server
  const watchIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  /**
   * Tính khoảng cách giữa 2 điểm GPS (công thức Haversine)
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Khoảng cách (km)
  };

  /**
   * Gửi location lên server
   */
  const sendLocationToServer = async (location, reason = "update") => {
    try {
      console.log(`📡 Sending location (${reason}):`, {
        lat: location.latitude.toFixed(6),
        lon: location.longitude.toFixed(6),
      });

      const response = await fetch("http://localhost:8000/update_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Gửi cookie JWT
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Location sent (${reason}):`, data);
        return true;
      } else {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        console.error("❌ Failed to send location:", response.status, error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending location:", error);
      return false;
    }
  };

  // ✅ Main Effect - Bật/tắt tracking
  useEffect(() => {
    /**
     * Xử lý GPS update
     */
    const handlePositionUpdate = async (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      // ✅ Update UI ngay (không chờ API)
      setCurrentLocation(newLocation);
      // ✅ Lưu vào localStorage với timestamp
      saveToStorage(STORAGE_KEYS.CURRENT_LOCATION, newLocation);
      saveToStorage(STORAGE_KEYS.LAST_UPDATE_TIME, new Date().toISOString());
      console.log("💾 Saved to localStorage:", STORAGE_KEYS.CURRENT_LOCATION);

      // ✅ Kiểm tra có cần gửi lên server không
      let shouldSend = false;
      let sendReason = "";

      if (!lastSentLocationRef.current) {
        // ✅ Lần đầu tiên - GỬI NGAY
        shouldSend = true;
        sendReason = "initial";
        console.log("📍 First location - sending to server");
      } else {
        // ✅ Tính khoảng cách so với vị trí ĐÃ GỬI (không phải vị trí hiện tại)
        const distance = calculateDistance(
          lastSentLocationRef.current.latitude,
          lastSentLocationRef.current.longitude,
          newLocation.latitude,
          newLocation.longitude
        );

        const distanceMeters = distance * 1000;

        // ✅ CHỈ GỬI KHI DI CHUYỂN >= 500m
        if (distanceMeters >= 500) {
          shouldSend = true;
          sendReason = `moved ${distanceMeters.toFixed(0)}m`;
          console.log(`🚗 Moved ${distanceMeters.toFixed(0)}m → Updating server`);
        } else {
          // ✅ Bỏ qua nếu < 500m
          console.log(`⏭️ Skip - only moved ${distanceMeters.toFixed(0)}m`);
        }
      }

      // Gửi lên server
      if (shouldSend) {
        const success = await sendLocationToServer(newLocation, sendReason);
        if (success) {
          // ✅ CHỈ CẬP NHẬT lastSentLocation KHI GỬI THÀNH CÔNG
          lastSentLocationRef.current = newLocation;
          // ✅ Lưu vào localStorage
          saveToStorage(STORAGE_KEYS.LAST_SENT_LOCATION, newLocation);
        }
      }
    };

    /**
     * Xử lý lỗi GPS
     */
    const handlePositionError = (error) => {
      console.error("GPS error:", error);
      setTrackingStatus("error");
      // ✅ Lưu status vào localStorage
      saveToStorage(STORAGE_KEYS.TRACKING_STATUS, "error");

      const errorMessages = {
        [error.PERMISSION_DENIED]: "⛔ User denied GPS permission",
        [error.POSITION_UNAVAILABLE]: "📍 Location information unavailable",
        [error.TIMEOUT]: "⏱️ GPS request timeout",
      };

      console.error(errorMessages[error.code] || "Unknown GPS error");
    };
    // ======== CHATBOT ĐÓNG ========
    if (!isActive) {
      console.log("🔴 Chatbot CLOSED - Stopping GPS tracking");

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      setTrackingStatus("idle");
      // ✅ Lưu status vào localStorage
      saveToStorage(STORAGE_KEYS.TRACKING_STATUS, "idle");
      return;
    }

    // ======== CHATBOT MỞ ========
    if (!navigator.geolocation) {
      console.error("⚠️ Geolocation not supported by this browser");
      setTrackingStatus("error");
      return;
    }

    console.log("🟢 Chatbot OPENED - Starting GPS tracking");
    setTrackingStatus("tracking");
    // ✅ Lưu status vào localStorage
    saveToStorage(STORAGE_KEYS.TRACKING_STATUS, "tracking");

    // ✅ Lấy vị trí ban đầu
    navigator.geolocation.getCurrentPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // ✅ Watch position liên tục
    watchIdRef.current = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000, // Cache 5 giây
    });

    // ✅ HEARTBEAT: Gửi lại location mỗi 2 phút (dù không di chuyển)
    // Mục đích: Giữ location trong Redis (TTL 24 giờ theo API)
    heartbeatIntervalRef.current = setInterval(async () => {
      if (lastSentLocationRef.current) {
        console.log("💓 Heartbeat - refreshing location in Redis");
        await sendLocationToServer(lastSentLocationRef.current, "heartbeat");
        // KHÔNG cập nhật lastSentLocation vì không thực sự di chuyển
      }
    }, 120000); // 2 phút

    // ✅ Cleanup khi unmount hoặc isActive thay đổi
    return () => {
      console.log("🧹 Cleanup GPS tracking");

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [isActive]); // ✅ Chỉ phụ thuộc isActive

  return {
    location: currentLocation,
    trackingStatus,
    isTracking: trackingStatus === "tracking",
    lastSentLocation: lastSentLocationRef.current, // ✅ Expose để debug
    lastUpdateTime: loadFromStorage(STORAGE_KEYS.LAST_UPDATE_TIME), // ✅ Thời gian cập nhật cuối
    clearStorage: () => {
      // ✅ Xóa tất cả data trong localStorage
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      console.log("🗑️ Cleared GPS data from localStorage");
    },
  };
};
