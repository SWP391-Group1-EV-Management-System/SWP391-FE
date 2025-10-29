/**
 * CURRENT TIME COMPONENT (v3 - Stop Button Removed)
 *
 * Component hiển thị thời gian kết thúc dự kiến
 * Nút dừng sạc đã được chuyển sang PricingInfo component
 */

import React, { useState, useEffect } from "react";
import { Card, Typography, Space, Progress } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const CurrentTime = ({ currentTime, sessionData }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);

  /**
   * Tính thời gian còn lại và phần trăm tiến độ
   */
  useEffect(() => {
    if (!sessionData?.expectedEndTime || !sessionData?.startTime) {
      setTimeRemaining(null);
      setProgressPercent(0);
      return;
    }

    const calculateTimeInfo = () => {
      const now = new Date();
      const start = new Date(sessionData.startTime);
      const end = new Date(sessionData.expectedEndTime);

      // Tổng thời gian dự kiến (ms)
      const totalDuration = end - start;
      // Thời gian đã trôi qua (ms)
      const elapsed = now - start;
      // Thời gian còn lại (ms)
      const remaining = end - now;

      // Tính phần trăm tiến độ
      const percent =
        totalDuration > 0
          ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
          : 0;

      setProgressPercent(Math.round(percent));

      // Nếu đã hết thời gian
      if (remaining <= 0) {
        setTimeRemaining("00:00:00");
        return;
      }

      // Format thời gian còn lại
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      const formatted = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      setTimeRemaining(formatted);
    };

    // Tính ngay khi mount
    calculateTimeInfo();

    // Update mỗi giây
    const interval = setInterval(calculateTimeInfo, 1000);

    return () => clearInterval(interval);
  }, [sessionData?.expectedEndTime, sessionData?.startTime]);

  /**
   * Tính tổng năng lượng đã sạc realtime
   * Công thức: energy (kWh) = maxPower (kW) × time (hours)
   */
  const calculateEnergyCharged = () => {
    try {
      // If the session is already finished, use the stored energy value from backend/hook
      if (sessionData?.isDone) {
        return sessionData.energyCharged
          ? Number(sessionData.energyCharged)
          : 0;
      }
      const startTime = sessionData?.startTime
        ? new Date(sessionData.startTime)
        : null;
      const maxPower = sessionData?.maxPower;

      if (!startTime || !maxPower) {
        return 0;
      }

      const now = new Date();
      const diffSeconds = Math.max(
        0,
        Math.floor((now.getTime() - startTime.getTime()) / 1000)
      );

      const hours = diffSeconds / 3600;
      const energyCharged = maxPower * hours;

      return Number(energyCharged.toFixed(2));
    } catch (error) {
      console.error("Error calculating energy charged:", error);
      return 0;
    }
  };

  const isCompleted = sessionData?.isDone || false;

  return (
    <Card
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 16px rgba(5, 119, 70, 0.08)",
        textAlign: "center",
      }}
      styles={{
        body: { padding: "24px" },
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Space>
          <ClockCircleOutlined
            style={{
              fontSize: "24px",
              color: isCompleted ? "#10b981" : "#3b82f6",
            }}
          />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            {isCompleted ? "Đã hoàn thành" : "Thời gian kết thúc dự kiến"}
          </Title>
        </Space>
      </div>

      {/* Time Display */}
      <div
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {currentTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>

      {/* Date Display */}
      <Text
        style={{
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: 500,
          display: "block",
          marginBottom: "16px",
        }}
      >
        {currentTime.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      {/* Time Remaining Info */}
      {timeRemaining && !isCompleted && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f0f9ff",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#0369a1", fontSize: "14px" }}>
                Thời gian còn lại
              </Text>
              <Text
                strong
                style={{
                  color: timeRemaining === "00:00:00" ? "#dc2626" : "#0369a1",
                  fontSize: "16px",
                }}
              >
                {timeRemaining}
              </Text>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor={{
                "0%": "#10b981",
                "100%": "#3b82f6",
              }}
              showInfo={false}
              size="small"
            />
          </Space>
        </div>
      )}

      {/* Completed Status */}
      {isCompleted && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            border: "2px solid #10b981",
          }}
        >
          <Space direction="vertical" align="center" size={8}>
            <CheckCircleOutlined
              style={{ fontSize: "48px", color: "#10b981" }}
            />
            <Text strong style={{ color: "#047857", fontSize: "16px" }}>
              Phiên sạc đã hoàn thành
            </Text>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default CurrentTime;
