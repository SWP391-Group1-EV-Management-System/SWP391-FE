import { useState, useEffect } from "react";
import { getStatusConfig } from "../utils/energyUtils";
import { energySessionService } from "../services/energySessionService";

export const useEnergySession = (userID = null) => {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch session data từ API
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setErrorCode(null);

        // Ưu tiên lấy session từ sessionId trong localStorage
        const storedSessionId = localStorage.getItem("currentSessionId");

        if (storedSessionId) {
          console.log("🔍 Lấy session từ sessionId:", storedSessionId);
          const response = await energySessionService.getSessionById(
            storedSessionId
          );

          if (response.success && response.data) {
            console.log("✅ Đã lấy session từ sessionId");
            setSessionData(response.data);
            setIsLoading(false);
            return;
          } else {
            console.warn("⚠️ Không tìm thấy session với ID:", storedSessionId);

            // Xử lý các error code đặc biệt
            if (response.errorCode === 403) {
              setError("Bạn không có quyền truy cập phiên sạc này");
              setErrorCode(403);
              setIsLoading(false);
              return;
            } else if (response.errorCode === 404) {
              console.log("Session không tồn tại, xóa khỏi localStorage");
              localStorage.removeItem("currentSessionId");
            } else if (response.errorCode) {
              setError(response.message || "Không thể lấy thông tin phiên sạc");
              setErrorCode(response.errorCode);
              setIsLoading(false);
              return;
            }
          }
        }

        // Nếu không có sessionId hoặc không tìm thấy, thử lấy theo userID
        if (!userID) {
          setIsLoading(false);
          setError("Vui lòng đăng nhập để xem phiên sạc");
          console.warn("useEnergySession: userID is null or undefined");
          return;
        }

        console.log("🔍 Lấy session theo userID:", userID);
        const response = await energySessionService.getCurrentSession(userID);

        if (response.success && response.data) {
          console.log("✅ Đã lấy session theo userID:", response.data);
          setSessionData(response.data);
        } else {
          setSessionData(null);

          // Xử lý error code
          if (response.errorCode === 403) {
            setError("Bạn không có quyền truy cập phiên sạc");
            setErrorCode(403);
          } else {
            setError(response.message || "Không có phiên sạc đang hoạt động");
            setErrorCode(response.errorCode);
          }
        }
      } catch (err) {
        console.error("Error fetching session data:", err);
        setError("Không thể tải thông tin phiên sạc");
        setSessionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [userID]);

  // Update current time mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time update session data (polling mỗi 30 giây)
  useEffect(() => {
    if (!sessionData?.sessionId) return;

    const updateInterval = setInterval(async () => {
      try {
        // Ưu tiên update bằng sessionId
        const storedSessionId = localStorage.getItem("currentSessionId");
        const sessionIdToUse = storedSessionId || sessionData.sessionId;

        if (sessionIdToUse) {
          console.log("🔄 Polling update session:", sessionIdToUse);
          const response = await energySessionService.getSessionById(
            sessionIdToUse
          );

          if (response.success && response.data) {
            setSessionData(response.data);
          }
        } else if (userID) {
          // Fallback: update theo userID
          const response = await energySessionService.getCurrentSession(userID);

          if (response.success && response.data) {
            setSessionData(response.data);
          }
        }
      } catch (err) {
        console.error("Error updating session data:", err);
      }
    }, 30000); // Update mỗi 30 giây

    return () => clearInterval(updateInterval);
  }, [userID, sessionData?.sessionId]);

  const statusConfig = sessionData ? getStatusConfig(sessionData.status) : null;

  // Functions để tương tác với API
  const createSession = async (bookingData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await energySessionService.createSession(bookingData);

      if (response.success) {
        setSessionData(response.data);
        return response;
      } else {
        setError(response.message);
        return response;
      }
    } catch (err) {
      const errorMsg = "Không thể tạo phiên sạc";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (status) => {
    if (!sessionData?.sessionId) {
      const errorMsg = "Không tìm thấy phiên sạc";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    try {
      const response = await energySessionService.updateSessionStatus(
        sessionData.sessionId,
        status
      );

      if (response.success) {
        setSessionData(response.data);
        return response;
      } else {
        setError(response.message);
        return response;
      }
    } catch (err) {
      const errorMsg = "Không thể cập nhật trạng thái";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ưu tiên refetch bằng sessionId
      const storedSessionId = localStorage.getItem("currentSessionId");

      if (storedSessionId) {
        console.log("🔄 Refetch session từ sessionId:", storedSessionId);
        const response = await energySessionService.getSessionById(
          storedSessionId
        );

        if (response.success && response.data) {
          setSessionData(response.data);
          setIsLoading(false);
          return;
        } else {
          console.warn("⚠️ Không tìm thấy session khi refetch");
          localStorage.removeItem("currentSessionId");
        }
      }

      // Fallback: refetch theo userID
      if (!userID) {
        setIsLoading(false);
        return;
      }

      console.log("🔄 Refetch session theo userID:", userID);
      const response = await energySessionService.getCurrentSession(userID);

      if (response.success && response.data) {
        setSessionData(response.data);
      } else {
        setSessionData(null);
        setError(response.message || "Không có phiên sạc đang hoạt động");
      }
    } catch (err) {
      console.error("Error refetching session data:", err);
      setError("Không thể tải lại thông tin phiên sạc");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessionData,
    setSessionData,
    currentTime,
    statusConfig,
    isLoading,
    error,
    errorCode,
    createSession,
    updateSessionStatus,
    refetch,
  };
};
