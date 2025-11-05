import { useState, useEffect, useRef } from "react";

/**
 * Custom hook để theo dõi countdown pin và thời gian sạc qua SSE
 * @param {number} currentBattery - Mức pin hiện tại (%)
 * @param {number} remainingMinutes - Thời gian sạc còn lại (phút)
 * @param {boolean} isActive - Bật/tắt SSE connection
 * @returns {Object} { batteryLevel, remainingSeconds, displayTime, status, isCompleted }
 */
export const useBatteryCountdown = (
  currentBattery,
  remainingMinutes,
  isActive = false
) => {
  const [batteryLevel, setBatteryLevel] = useState(currentBattery || 0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [displayTime, setDisplayTime] = useState("00:00:00");
  const [status, setStatus] = useState("IDLE");
  const [isCompleted, setIsCompleted] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Nếu không active hoặc thiếu params thì không kết nối
    if (!isActive || !currentBattery || !remainingMinutes) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const url = `${apiUrl}/api/countdown/battery/${currentBattery}/${remainingMinutes}`;

    console.log("🔋 [useBatteryCountdown] Connecting to SSE:", url);

    // ⚠️ EventSource không hỗ trợ withCredentials trực tiếp
    // Cần backend cho phép anonymous access hoặc dùng token trong URL
    // Tạm thời thử không cần credentials
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("charging", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📊 [useBatteryCountdown] Received data:", data);

        setBatteryLevel(data.batteryLevel);
        setRemainingSeconds(data.remainingSeconds);
        setDisplayTime(data.displayTime || "00:00:00");
        setStatus(data.status);

        // Kiểm tra nếu hoàn thành
        if (data.status === "COMPLETED") {
          setIsCompleted(true);
          console.log("✅ [useBatteryCountdown] Charging completed!");
          eventSource.close();
        }
      } catch (error) {
        console.error(
          "❌ [useBatteryCountdown] Error parsing SSE data:",
          error
        );
      }
    });

    eventSource.onerror = (error) => {
      console.error("❌ [useBatteryCountdown] SSE error:", error);
      eventSource.close();
    };

    // Cleanup khi component unmount hoặc dependencies thay đổi
    return () => {
      console.log("🔌 [useBatteryCountdown] Closing SSE connection");
      eventSource.close();
    };
  }, [currentBattery, remainingMinutes, isActive]);

  return {
    batteryLevel,
    remainingSeconds,
    displayTime,
    status,
    isCompleted,
  };
};
