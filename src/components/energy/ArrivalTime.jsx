import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Space, Progress, Tag, Button, message } from "antd";
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { energySessionService } from "../../services/energySessionService.js";
import "../../assets/styles/ArrivalTime.css";

const { Title, Text } = Typography;

const ArrivalTime = ({
  bookingData = null, // Dữ liệu booking từ API
  onSessionCreate = null, // Callback khi tạo session thành công
  onSessionEnd = null, // Callback khi session kết thúc
  onTimeExpired = null, // Callback khi hết thời gian
  onCancel = null, // Callback khi hủy booking
}) => {
  // State quản lý session và thời gian
  const [sessionData, setSessionData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 phút = 900 giây
  const [isRunning, setIsRunning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Tính toán phần trăm thời gian đã trôi qua
  const totalTime = 15 * 60; // 15 phút
  const timeElapsed = totalTime - timeRemaining;
  const progressPercent = Math.round((timeElapsed / totalTime) * 100);

  // Hàm định dạng thời gian mm:ss
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Tự động bắt đầu session khi có sessionData từ booking
  useEffect(() => {
    if (sessionData?.chargingSessionId) {
      setIsRunning(true);
      setIsExpired(false);
      setTimeRemaining(15 * 60); // Reset về 15 phút
    }
  }, [sessionData]);

  // Tạo phiên sạc mới
  const createSession = async () => {
    if (!bookingData) {
      message.error("Không có dữ liệu booking!");
      return;
    }

    setIsCreating(true);
    try {
      // Sử dụng energySessionService để tạo session
      const sessionResponse = await energySessionService.createSession(
        bookingData
      );
      // Handle backend signal that user is overpaying
      const statusStr = (
        sessionResponse?.data?.status ||
        sessionResponse?.message ||
        ""
      )
        .toString()
        .toLowerCase();
      const sessionIdStr = (
        sessionResponse?.data?.sessionId ||
        sessionResponse?.sessionId ||
        ""
      )
        .toString()
        .toLowerCase();
      if (
        statusStr.includes("overpay") ||
        sessionIdStr === "overpaying" ||
        sessionResponse?.data?.idAction === "overpaying"
      ) {
        console.warn(
          "⚠️ [ArrivalTime] User overpaying - block create session",
          sessionResponse
        );
        message.error(
          "Tài khoản của bạn đang có khoản nợ trên 100.000 VND. Vui lòng thanh toán trước khi bắt đầu phiên sạc."
        );
        setIsCreating(false);
        return;
      }

      if (sessionResponse.success) {
        const sessionInfo = sessionResponse.data;
        setSessionData(sessionInfo);

        message.success("Tạo phiên sạc thành công!");

        // Gọi callback khi tạo session thành công
        if (onSessionCreate) {
          onSessionCreate(sessionInfo);
        }
      } else {
        message.error(sessionResponse.message || "Không thể tạo phiên sạc!");
      }
    } catch (error) {
      console.error("Lỗi tạo phiên sạc:", error);
      message.error("Có lỗi xảy ra khi tạo phiên sạc!");
    } finally {
      setIsCreating(false);
    }
  };

  // Kết thúc phiên sạc
  const endSession = () => {
    setIsRunning(false);
    setSessionData(null);

    if (onSessionEnd && sessionData) {
      onSessionEnd(sessionData);
    }
  };

  // Logic đếm ngược
  useEffect(() => {
    let interval = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            // Hết thời gian
            setIsRunning(false);
            setIsExpired(true);
            if (onTimeExpired) {
              onTimeExpired();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onTimeExpired]);

  // Xử lý bắt đầu/kết thúc phiên sạc
  const handleToggleSession = () => {
    if (isRunning) {
      endSession();
    } else if (bookingData && !sessionData) {
      createSession();
    } else if (sessionData) {
      setIsRunning(true);
    }
  };

  // Reset timer
  const handleReset = () => {
    setTimeRemaining(15 * 60);
    setIsRunning(false);
    setIsExpired(false);
    setSessionData(null);
  };

  // Xác định màu sắc dựa trên thời gian còn lại
  const getColorByTime = () => {
    if (isExpired) return "danger"; // Đỏ - hết thời gian
    if (timeRemaining <= 300) return "warning"; // Cam - còn 5 phút
    return "normal"; // Xanh - còn nhiều thời gian
  };

  // Lấy class CSS cho countdown time
  const getCountdownTimeClass = () => {
    return `countdown-time ${getColorByTime()}`;
  };

  // Lấy class CSS cho primary button
  const getPrimaryButtonClass = () => {
    return `primary-button ${getColorByTime()}`;
  };

  // Lấy stroke color cho progress
  const getProgressStrokeColor = () => {
    const colorType = getColorByTime();
    switch (colorType) {
      case "danger":
        return "#ff4d4f";
      case "warning":
        return "#faad14";
      default:
        return "#10b981";
    }
  };

  return (
    <Card className="arrival-time-container">
      <div>
        {/* Header */}
        <div className="arrival-time-header">
          <ClockCircleOutlined className="arrival-time-icon" />
          <Title level={4} className="arrival-time-title">
            Thời gian đến trạm
          </Title>
        </div>

        {/* Thông tin Session nếu có */}
        {sessionData?.chargingSessionId && (
          <div className="session-info">
            <Text className="session-info-item">
              Phiên sạc: {sessionData.chargingSessionId}
            </Text>
            {sessionData.chargingStation?.name && (
              <Text className="session-info-item">
                Trạm: {sessionData.chargingStation.name}
              </Text>
            )}
          </div>
        )}

        {/* Hiển thị thời gian đếm ngược */}
        <div className="countdown-display">
          <div className={getCountdownTimeClass()}>
            {formatTime(timeRemaining)}
          </div>
          <Text className="countdown-label">Thời gian còn lại</Text>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <Progress
            percent={progressPercent}
            strokeColor={getProgressStrokeColor()}
            showInfo={false}
          />
        </div>

        {/* Các nút điều khiển */}
        <div className="controls-container">
          <Button
            danger
            type="primary"
            onClick={() => {
              if (onCancel) {
                onCancel();
              }
            }}
          >
            Hủy đặt chỗ
          </Button>
        </div>

        {/* Thông báo hết thời gian */}
        {isExpired && (
          <div className="expired-warning">
            <Text className="expired-text">
              ⚠️ Phiên sạc đã hết thời gian cho phép!
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ArrivalTime;
