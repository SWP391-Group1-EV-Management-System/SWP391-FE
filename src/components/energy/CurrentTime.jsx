/**
 * CURRENT TIME COMPONENT (v2 - Optimized)
 *
 * Component hiển thị thời gian kết thúc dự kiến và nút dừng sạc
 * Gọi trực tiếp finishSession từ hook, không qua service
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Modal,
  message,
  Progress,
} from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { confirm } = Modal;

const CurrentTime = ({
  currentTime,
  sessionData,
  finishSession, // Từ hook
  isFinishing, // Loading state từ hook
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);

  /**
   * Tính thời gian còn lại và phần trăm tiến độ
   */
  // When user clicks "Dừng sạc", freeze realtime calculations until they confirm/cancel
  const [pausedAt, setPausedAt] = useState(null); // Date object or null
  useEffect(() => {
    if (!sessionData?.expectedEndTime || !sessionData?.startTime) {
      setTimeRemaining(null);
      setProgressPercent(0);
      return;
    }

    const calculateTimeInfo = () => {
      // Respect pausedAt to freeze the displayed remaining time when confirming stop
      const now = pausedAt ? new Date(pausedAt) : new Date();
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
  }, [sessionData?.expectedEndTime, sessionData?.startTime, pausedAt]);

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

      // Use current time (or pausedAt if present) to compute energy
      const now = pausedAt ? new Date(pausedAt) : new Date();
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

  // Compute energy at an arbitrary timestamp (used to take a synchronous snapshot)
  const calculateEnergyChargedAt = (now) => {
    try {
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

      const diffSeconds = Math.max(
        0,
        Math.floor((now.getTime() - startTime.getTime()) / 1000)
      );

      const hours = diffSeconds / 3600;
      const energyCharged = maxPower * hours;

      return Number(energyCharged.toFixed(2));
    } catch (error) {
      console.error("Error calculating energy charged at snapshot:", error);
      return 0;
    }
  };

  // Compute remaining time string at arbitrary timestamp (used for snapshot in modal)
  const formatRemainingAt = (now) => {
    try {
      if (!sessionData?.expectedEndTime || !sessionData?.startTime) return null;

      const start = new Date(sessionData.startTime);
      const end = new Date(sessionData.expectedEndTime);
      const remaining = end - now;

      if (remaining <= 0) return "00:00:00";

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } catch (e) {
      console.error("Error formatting remaining at snapshot:", e);
      return null;
    }
  };

  /**
   * Xử lý khi người dùng bấm nút "Dừng sạc"
   */
  const handleStopCharging = () => {
    if (!sessionData?.chargingSessionId) {
      message.error("Không tìm thấy thông tin phiên sạc");
      return;
    }

    // Freeze calculations immediately so displayed numbers stop updating while
    // the user confirms. We take a synchronous snapshot using a freezeTime so
    // modal shows stable values immediately (state updates are async).
    const freezeTime = new Date();
    setPausedAt(freezeTime);
    try {
      localStorage.setItem(
        "currentSessionPausedAt",
        JSON.stringify({
          sessionId: sessionData?.chargingSessionId,
          time: freezeTime.toISOString(),
        })
      );
    } catch (e) {
      console.warn("Failed to write currentSessionPausedAt:", e);
    }

    const totalEnergy = calculateEnergyChargedAt(freezeTime);

    const frozenRemaining = formatRemainingAt(freezeTime);

    confirm({
      title: "Xác nhận dừng sạc",
      icon: <ExclamationCircleOutlined />,
      centered: true,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn dừng sạc không?</p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
            Phiên sạc sẽ kết thúc và chuyển sang thanh toán.
          </p>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
            }}
          >
            <Space direction="vertical" size={4}>
              <Text strong style={{ color: "#0369a1" }}>
                Tổng năng lượng: {totalEnergy.toLocaleString("vi-VN")} kWh
              </Text>
              {frozenRemaining && frozenRemaining !== "00:00:00" && (
                <Text style={{ color: "#6b7280", fontSize: "12px" }}>
                  Thời gian còn lại: {frozenRemaining}
                </Text>
              )}
            </Space>
          </div>
        </div>
      ),
      okText: "Dừng sạc",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        await handleFinishSession(totalEnergy);
        // clear pausedAt so UI state flows from hook's finished state
        setPausedAt(null);
        try {
          localStorage.removeItem("currentSessionPausedAt");
        } catch (e) {
          console.warn("Failed to remove currentSessionPausedAt:", e);
        }
      },
      onCancel: () => {
        // User cancelled -> resume realtime calculations
        setPausedAt(null);
        try {
          localStorage.removeItem("currentSessionPausedAt");
        } catch (e) {
          console.warn("Failed to remove currentSessionPausedAt:", e);
        }
      },
    });
  };

  /**
   * Gọi finishSession từ hook
   */
  const handleFinishSession = async (totalEnergy) => {
    if (!finishSession) {
      message.error("Chức năng không khả dụng");
      return;
    }

    try {
      const response = await finishSession(
        sessionData.chargingSessionId,
        totalEnergy
      );

      if (response.success) {
        message.success("Đã dừng sạc thành công!");
        // Hook sẽ tự động clear sessionData
      } else {
        message.error(response.message || "Không thể dừng sạc");
      }
    } catch (error) {
      console.error("Error finishing session:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const isCompleted = sessionData?.isDone || false;
  const isDisabled =
    isFinishing || isCompleted || !sessionData?.chargingSessionId;

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

      {/* Energy Info */}
      {!isCompleted && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <Space direction="vertical" size={4}>
            <Text style={{ color: "#065f46", fontSize: "12px" }}>
              Năng lượng hiện tại
            </Text>
            <Text strong style={{ color: "#047857", fontSize: "18px" }}>
              {calculateEnergyCharged().toLocaleString("vi-VN")} kWh
            </Text>
          </Space>
        </div>
      )}

      {/* Stop Charging Button */}
      {!isCompleted && (
        <Button
          type="primary"
          danger
          icon={<PauseCircleOutlined />}
          loading={isFinishing}
          disabled={isDisabled}
          size="large"
          style={{
            width: "100%",
            height: "56px",
            fontSize: "18px",
            fontWeight: "600",
          }}
          onClick={handleStopCharging}
        >
          {isFinishing ? "Đang xử lý..." : "Dừng sạc"}
        </Button>
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
