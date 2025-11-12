import { useState, useEffect, useRef } from "react";
import { cleanupAllCountdowns } from "../utils/countdownUtils";

// Hook kết nối SSE countdown từ backend
export const useCountdown = (
  minutes,
  enabled = true,
  storageKey = "countdownEndTime"
) => {
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState("IDLE");
  const [error] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !minutes || minutes <= 0) {
      return;
    }

    // Xóa tất cả countdown keys cũ trừ key hiện tại
    const cleanedCount = cleanupAllCountdowns([
      storageKey,
      storageKey.replace("countdown_", "countdown_frozen_"),
    ]);

    // Lấy endTime từ localStorage
    let endTime = null;
    try {
      const savedEndTime = localStorage.getItem(storageKey);
      if (savedEndTime) {
        endTime = new Date(savedEndTime);

        const now = new Date();
        if (endTime <= now) {
          endTime = null;
          localStorage.removeItem(storageKey);
        }
      }
    } catch (err) {
      // Bỏ qua lỗi
    }

    // Tính endTime mới nếu chưa có
    if (!endTime) {
      endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + minutes);

      try {
        localStorage.setItem(storageKey, endTime.toISOString());
      } catch (err) {
        // Bỏ qua lỗi
      }
    }

    setStatus("RUNNING");

    // Cập nhật countdown mỗi giây
    const updateCountdown = () => {
      const savedEndTime = localStorage.getItem(storageKey);
      if (!savedEndTime) {
        const frozenKey = `${storageKey.replace(
          "countdown_",
          "countdown_frozen_"
        )}`;
        const frozenTime = localStorage.getItem(frozenKey);

        if (frozenTime) {
          setCountdown({
            remainingSeconds: 0,
            remainingMinutes: 0,
            displayTime: frozenTime,
            endTime: null,
            isFrozen: true,
          });
          setStatus("CANCELLED");
        } else {
          setCountdown(null);
          setStatus("IDLE");
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const now = new Date();
      const remainingMs = endTime - now;

      if (remainingMs <= 0) {
        setCountdown({
          remainingSeconds: 0,
          remainingMinutes: 0,
          displayTime: "00:00:00",
          endTime: endTime.toISOString(),
        });
        setStatus("COMPLETED");

        try {
          localStorage.removeItem(storageKey);
        } catch (err) {
          // Bỏ qua lỗi
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      const remainingSeconds = Math.floor(remainingMs / 1000);
      const remainingMinutes = Math.floor(remainingSeconds / 60);

      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      const secs = remainingSeconds % 60;
      const displayTime = `${String(hours).padStart(2, "0")}:${String(
        mins
      ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      setCountdown({
        remainingSeconds,
        remainingMinutes,
        displayTime,
        endTime: endTime.toISOString(),
      });
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [minutes, enabled, storageKey]);

  return {
    countdown,
    status,
    error,
  };
};
