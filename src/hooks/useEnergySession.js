import { useState, useEffect } from "react";
import { getStatusConfig } from "../utils/energyUtils";
import { energySessionService } from "../services/energySessionService";

export const useEnergySession = (userId = null) => {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch session data từ API
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!userId) {
        // Fallback data nếu không có userId
        setSessionData({
          stationName: "Trạm sạc Vincom Center",
          address: "123 Đường ABC, Quận 1, TP.HCM",
          socketType: "CCS2",
          power: "50kW",
          batteryLevel: 65,
          timeElapsed: "00:45:30",
          estimatedTimeLeft: "01:20:15",
          energyCharged: "32.5",
          estimatedCost: "125,000",
          status: "charging",
          pricePerKwh: "3,500",
          pricePerMin: "500",
          chargingPower: "45.2",
          voltage: "380V",
          current: "118A"
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await energySessionService.getCurrentSession(userId);
        
        if (response.success && response.data) {
          setSessionData(response.data);
        } else {
          // Không có phiên sạc đang hoạt động, dùng dữ liệu mặc định
          setSessionData({
            stationName: "Chưa có phiên sạc",
            address: "Vui lòng tạo phiên sạc mới",
            socketType: "N/A",
            power: "0kW",
            batteryLevel: 0,
            timeElapsed: "00:00:00",
            estimatedTimeLeft: "00:00:00",
            energyCharged: "0",
            estimatedCost: "0",
            status: "idle",
            pricePerKwh: "0",
            pricePerMin: "0",
            chargingPower: "0",
            voltage: "0V",
            current: "0A"
          });
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
  }, [userId]);

  // Update current time mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time update session data (polling mỗi 30 giây)
  useEffect(() => {
    if (!userId || !sessionData?.sessionId) return;

    const updateInterval = setInterval(async () => {
      try {
        const response = await energySessionService.getCurrentSession(userId);
        if (response.success && response.data) {
          setSessionData(response.data);
        }
      } catch (err) {
        console.error("Error updating session data:", err);
      }
    }, 30000); // Update mỗi 30 giây

    return () => clearInterval(updateInterval);
  }, [userId, sessionData?.sessionId]);

  const statusConfig = sessionData ? getStatusConfig(sessionData.status) : null;

  // Functions để tương tác với API
  const createSession = async (bookingData) => {
    try {
      setIsLoading(true);
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
    if (!sessionData?.sessionId) return;

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

  return {
    sessionData,
    setSessionData,
    currentTime,
    statusConfig,
    isLoading,
    error,
    createSession,
    updateSessionStatus,
    refetch: () => {
      if (userId) {
        // Re-fetch session data
        energySessionService.getCurrentSession(userId).then(response => {
          if (response.success && response.data) {
            setSessionData(response.data);
          }
        });
      }
    }
  };
};