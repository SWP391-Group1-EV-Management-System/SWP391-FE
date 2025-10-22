import { useState, useEffect } from "react";
import { getStatusConfig } from "../utils/energyUtils";
import { energySessionService } from "../services/energySessionService";

export const useEnergySession = (userID = null) => {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch session data từ API
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!userID) {
        setIsLoading(false);
        setError("Vui lòng đăng nhập để xem phiên sạc");
        console.warn("useEnergySession: userID is null or undefined");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await energySessionService.getCurrentSession(userID);
        
        if (response.success && response.data) {
          setSessionData(response.data);
        } else {
          setSessionData(null);
          setError(response.message || "Không có phiên sạc đang hoạt động");
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
    if (!userID || !sessionData?.sessionId) return;

    const updateInterval = setInterval(async () => {
      try {
        const response = await energySessionService.getCurrentSession(userID);
        if (response.success && response.data) {
          setSessionData(response.data);
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
      const response = await energySessionService.updateSessionStatus(sessionData.sessionId, status);
      
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
    if (!userID) return;
    
    try {
      setIsLoading(true);
      setError(null);
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
    createSession,
    updateSessionStatus,
    refetch
  };
};