import { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/axios";

// Hook lấy thông tin session công khai qua SSE
const usePublicSession = (sessionId) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finishLoading, setFinishLoading] = useState(false);

  const progressSourceRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const [batteryLevel, setBatteryLevel] = useState(null);

  // Hoàn thành phiên sạc
  const finishSession = useCallback(async (sessionId, totalEnergy) => {
    try {
      setFinishLoading(true);

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

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setFinishLoading(false);
    }
  }, []);

  // Kết nối SSE để nhận real-time updates
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const connectSSE = () => {
      try {
        const progressSource = new EventSource(
          `${apiUrl}/api/charging/session/progress/${sessionId}`
        );

        progressSource.addEventListener("chargingProgress", (event) => {
          try {
            const data = JSON.parse(event.data);

            reconnectAttemptsRef.current = 0;

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

            setSessionData((prevData) => ({
              ...prevData,
              ...parsedData,
            }));

            if (parsedData.pin !== undefined && parsedData.pin !== null) {
              setBatteryLevel(parsedData.pin);
            }
          } catch (err) {
            // Bỏ qua lỗi parse
          }
        });

        progressSource.onerror = (err) => {
          if (progressSource) {
            progressSource.close();
          }

          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            setTimeout(() => {
              connectSSE();
            }, 2000 * reconnectAttemptsRef.current);
          } else {
            setError("Connection lost after multiple attempts");
          }
        };

        progressSourceRef.current = progressSource;
      } catch (error) {
        // Bỏ qua lỗi
      }
    };

    connectSSE();

    return () => {
      reconnectAttemptsRef.current = maxReconnectAttempts;
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
    batteryLevel,
    finishSession,
    finishLoading,
  };
};

export default usePublicSession;
