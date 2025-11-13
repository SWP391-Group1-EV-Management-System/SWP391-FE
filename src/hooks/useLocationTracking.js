import { useState, useEffect, useRef } from "react";

const STORAGE_KEYS = {
  CURRENT_LOCATION: "gps_current_location",
  LAST_SENT_LOCATION: "gps_last_sent_location",
  TRACKING_STATUS: "gps_tracking_status",
  LAST_UPDATE_TIME: "gps_last_update_time",
};

// Load dữ liệu từ localStorage
const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// Lưu dữ liệu vào localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Bỏ qua lỗi
  }
};

// Hook theo dõi vị trí GPS
export const useLocationTracking = (isActive = false) => {
  const [currentLocation, setCurrentLocation] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.CURRENT_LOCATION);
    return loaded;
  });
  const [trackingStatus, setTrackingStatus] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.TRACKING_STATUS) || "idle";
  });
  const lastSentLocationRef = useRef(
    (() => {
      return loadFromStorage(STORAGE_KEYS.LAST_SENT_LOCATION);
    })()
  );
  const watchIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Tính khoảng cách giữa 2 điểm GPS
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Gửi vị trí lên server
  const sendLocationToServer = async (location, reason = "update") => {
    try {
      const response = await fetch("http://localhost:8000/update_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return true;
      } else {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Xử lý GPS update
    const handlePositionUpdate = async (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setCurrentLocation(newLocation);
      saveToStorage(STORAGE_KEYS.CURRENT_LOCATION, newLocation);
      saveToStorage(STORAGE_KEYS.LAST_UPDATE_TIME, new Date().toISOString());

      let shouldSend = false;
      let sendReason = "";

      if (!lastSentLocationRef.current) {
        shouldSend = true;
        sendReason = "initial";
      } else {
        const distance = calculateDistance(
          lastSentLocationRef.current.latitude,
          lastSentLocationRef.current.longitude,
          newLocation.latitude,
          newLocation.longitude
        );

        const distanceMeters = distance * 1000;

        if (distanceMeters >= 500) {
          shouldSend = true;
          sendReason = `moved ${distanceMeters.toFixed(0)}m`;
        }
      }

      if (shouldSend) {
        const success = await sendLocationToServer(newLocation, sendReason);
        if (success) {
          lastSentLocationRef.current = newLocation;
          saveToStorage(STORAGE_KEYS.LAST_SENT_LOCATION, newLocation);
        }
      }
    };

    // Xử lý lỗi GPS
    const handlePositionError = (error) => {
      setTrackingStatus("error");
      saveToStorage(STORAGE_KEYS.TRACKING_STATUS, "error");

      const errorMessages = {
        [error.PERMISSION_DENIED]: "⛔ User denied GPS permission",
        [error.POSITION_UNAVAILABLE]: "📍 Location information unavailable",
        [error.TIMEOUT]: "⏱️ GPS request timeout",
      };
    };

    if (!isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      setTrackingStatus("idle");
      saveToStorage(STORAGE_KEYS.TRACKING_STATUS, "idle");
      return;
    }

    if (!navigator.geolocation) {
      setTrackingStatus("error");
      return;
    }

    setTrackingStatus("tracking");
    saveToStorage(STORAGE_KEYS.TRACKING_STATUS, "tracking");

    navigator.geolocation.getCurrentPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    watchIdRef.current = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });

    // Heartbeat: Gửi lại location mỗi 2 phút
    heartbeatIntervalRef.current = setInterval(async () => {
      if (lastSentLocationRef.current) {
        await sendLocationToServer(lastSentLocationRef.current, "heartbeat");
      }
    }, 120000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [isActive]);

  return {
    location: currentLocation,
    trackingStatus,
    isTracking: trackingStatus === "tracking",
    lastSentLocation: lastSentLocationRef.current,
    lastUpdateTime: loadFromStorage(STORAGE_KEYS.LAST_UPDATE_TIME),
    clearStorage: () => {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    },
  };
};
