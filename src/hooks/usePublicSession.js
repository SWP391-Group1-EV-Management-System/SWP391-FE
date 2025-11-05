import { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/axios";

/**
 * Hook để lấy thông tin session công khai (không cần authentication)
 * Dùng cho VirtualStationPage để hiển thị trạng thái sạc
 * SSE endpoint:
 * - /api/charging/session/progress/{sessionId} → chargingProgress event
 *
 * Bao gồm cả function để hoàn thành phiên sạc
 */
const usePublicSession = (sessionId) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finishLoading, setFinishLoading] = useState(false);

  // SSE ref
  const progressSourceRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Battery level từ sessionData.pin
  const [batteryLevel, setBatteryLevel] = useState(null);

  /**
   * Hoàn thành phiên sạc
   * @param {string} sessionId - ID của phiên sạc
   * @param {number} totalEnergy - Tổng năng lượng đã sạc (kWh)
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const finishSession = useCallback(async (sessionId, totalEnergy) => {
    try {
      setFinishLoading(true);

      console.log("🏁 [usePublicSession] Finishing session:", {
        sessionId,
        totalEnergy: `${totalEnergy} kWh`,
      });

      // Gọi API finish session
      const response = await api.post(
        `/api/charging/session/finish/${sessionId}`,
        totalEnergy,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("✅ [usePublicSession] Session finished successfully");
        return {
          success: true,
          message: response.data || "Hoàn thành phiên sạc thành công",
        };
      }

      return {
        success: false,
        message: "Không thể hoàn thành phiên sạc",
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Lỗi khi hoàn thành phiên sạc";

      console.error("❌ [usePublicSession] Error finishing session:", err);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setFinishLoading(false);
    }
  }, []);

  // SSE để nhận real-time updates của session
  useEffect(() => {
    if (!sessionId) {
      console.warn("⚠️ [usePublicSession] No sessionId for SSE");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const connectSSE = () => {
      try {
        console.log(
          `🔌 [usePublicSession] Connecting SSE for session: ${sessionId}`
        );

        // ✅ SSE: Charging progress (energy, elapsed time, etc.)
        const progressSource = new EventSource(
          `${apiUrl}/api/charging/session/progress/${sessionId}`
        );

        progressSource.addEventListener("chargingProgress", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📡 [usePublicSession] SSE chargingProgress:", data);

            // Reset reconnect attempts on successful message
            reconnectAttemptsRef.current = 0;

            // ✅ Parse dữ liệu mới từ backend:
            // - pin: % pin hiện tại
            // - targetPin: % pin mục tiêu
            // - secondRemaining: thời gian còn lại (giây)
            // - maxSeconds: tổng thời gian sạc (giây)
            // - chargedEnergy_kWh: năng lượng đã sạc
            // - elapsedSeconds: thời gian đã trôi qua

            const parsedData = {
              ...data,
              pin: parseInt(data.pin || "0", 10),
              targetPin: parseInt(data.targetPin || "100", 10),
              secondRemaining: parseInt(data.secondRemaining || "0", 10),
              maxSeconds: parseInt(data.maxSeconds || "0", 10),
              elapsedSeconds: parseInt(data.elapsedSeconds || "0", 10),
              chargedEnergy_kWh: parseFloat(
                (data.chargedEnergy_kWh || "0").toString().replace(",", ".")
              ),
            };

            // ✅ Set full sessionData từ SSE
            setSessionData((prevData) => ({
              ...prevData,
              ...parsedData,
            }));

            // ✅ Set batteryLevel
            if (parsedData.pin !== undefined && parsedData.pin !== null) {
              setBatteryLevel(parsedData.pin);
              console.log(
                "🔋 [usePublicSession] Battery:",
                parsedData.pin,
                "→",
                parsedData.targetPin
              );
            }
          } catch (err) {
            console.error(
              "❌ [usePublicSession] Error parsing progress data:",
              err
            );
          }
        });

        progressSource.onerror = (err) => {
          console.error("❌ [usePublicSession] Progress SSE error:", err);

          // Đóng connection hiện tại
          if (progressSource) {
            progressSource.close();
          }

          // Retry nếu chưa quá số lần thử
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            console.log(
              `🔄 [usePublicSession] Reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
            setTimeout(() => {
              connectSSE();
            }, 2000 * reconnectAttemptsRef.current); // Exponential backoff: 2s, 4s, 6s
          } else {
            console.warn(
              "⚠️ [usePublicSession] Max reconnect attempts reached. Stopping reconnection."
            );
            setError("Connection lost after multiple attempts");
          }
        };

        progressSourceRef.current = progressSource;
      } catch (error) {
        console.error("❌ [usePublicSession] Failed to create SSE:", error);
      }
    };

    // Khởi tạo connection
    connectSSE();

    // Cleanup
    return () => {
      console.log("🔌 [usePublicSession] Closing SSE connection");
      reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent reconnect after unmount
      if (progressSourceRef.current) {
        progressSourceRef.current.close();
        progressSourceRef.current = null;
      }
    };
  }, [sessionId]);

  return {
    sessionData,
    loading,
    error,
    // ✅ Battery level từ sessionData.pin
    batteryLevel,
    // ✅ Function để hoàn thành phiên sạc
    finishSession,
    finishLoading,
  };
};

export default usePublicSession;
