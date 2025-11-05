import { useState, useEffect, useRef } from "react";
import { cleanupAllCountdowns } from "../utils/countdownUtils";

/**
 * Hook để kết nối SSE countdown từ backend
 * @param {number} minutes - Số phút cần đếm ngược
 * @param {boolean} enabled - Có bật countdown không
 * @param {string} storageKey - Key để lưu endTime vào localStorage (unique per booking/waiting)
 */
export const useCountdown = (
  minutes,
  enabled = true,
  storageKey = "countdownEndTime"
) => {
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState("IDLE"); // IDLE, RUNNING, COMPLETED, ERROR
  const [error] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !minutes || minutes <= 0) {
      console.log(
        "⏱️ [useCountdown] Countdown not enabled or invalid minutes:",
        minutes
      );
      return;
    }

    console.log(
      "🚀 [useCountdown] Initializing countdown for",
      minutes,
      "minutes"
    );

    // ✅ XÓA TẤT CẢ countdown keys cũ (trừ key hiện tại) khi tạo countdown mới
    const cleanedCount = cleanupAllCountdowns([
      storageKey,
      storageKey.replace("countdown_", "countdown_frozen_"),
    ]);
    if (cleanedCount > 0) {
      console.log(
        `🧹 [useCountdown] Cleaned ${cleanedCount} old countdown keys`
      );
    }

    // ✅ CHECK localStorage xem đã có endTime chưa
    let endTime = null;
    try {
      const savedEndTime = localStorage.getItem(storageKey);
      if (savedEndTime) {
        endTime = new Date(savedEndTime);
        console.log("📦 [useCountdown] Found saved endTime:", endTime);

        // Kiểm tra endTime còn valid không
        const now = new Date();
        if (endTime > now) {
          console.log("✅ [useCountdown] Using saved endTime (not expired)");
        } else {
          console.log(
            "⚠️ [useCountdown] Saved endTime expired, creating new one"
          );
          endTime = null;
          localStorage.removeItem(storageKey);
        }
      }
    } catch (err) {
      console.error("❌ [useCountdown] Error reading localStorage:", err);
    }

    // ✅ Nếu chưa có endTime → Tính endTime mới và LƯU vào localStorage
    if (!endTime) {
      endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + minutes);

      try {
        localStorage.setItem(storageKey, endTime.toISOString());
        console.log(
          "💾 [useCountdown] Saved new endTime to localStorage:",
          endTime
        );
      } catch (err) {
        console.error("❌ [useCountdown] Error saving to localStorage:", err);
      }
    }

    // ✅ Đếm ngược LOCAL (không cần gọi backend SSE nữa!)
    setStatus("RUNNING");

    const updateCountdown = () => {
      // ✅ CHECK localStorage mỗi lần update - nếu bị xóa = đã cancel
      const savedEndTime = localStorage.getItem(storageKey);
      if (!savedEndTime) {
        console.log(
          "🛑 [useCountdown] localStorage key removed - countdown cancelled!"
        );

        // ✅ KIỂM TRA frozen time - nếu có thì hiển thị thời gian đóng băng
        const frozenKey = `${storageKey.replace(
          "countdown_",
          "countdown_frozen_"
        )}`;
        const frozenTime = localStorage.getItem(frozenKey);

        if (frozenTime) {
          console.log("🧊 [useCountdown] Found frozen time:", frozenTime);
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
        // ✅ Hết thời gian
        setCountdown({
          remainingSeconds: 0,
          remainingMinutes: 0,
          displayTime: "00:00:00",
          endTime: endTime.toISOString(),
        });
        setStatus("COMPLETED");

        // Xóa localStorage
        try {
          localStorage.removeItem(storageKey);
          console.log(
            "🗑️ [useCountdown] Removed endTime from localStorage (completed)"
          );
        } catch (err) {
          console.error(
            "❌ [useCountdown] Error removing from localStorage:",
            err
          );
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      // ✅ Tính toán countdown
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

    // ✅ Update ngay lập tức
    updateCountdown();

    // ✅ Update mỗi giây
    intervalRef.current = setInterval(updateCountdown, 1000);

    // Cleanup khi unmount
    return () => {
      console.log("🔚 [useCountdown] Cleaning up countdown");
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
