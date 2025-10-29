/**
 * PRICING INFO COMPONENT (Updated)
 *
 * Component hiển thị thông tin giá cả
 * Bao gồm nút "Dừng sạc" và "Thanh toán"
 * Logic: Hiển thị nút "Dừng sạc" trước, sau khi dừng sạc mới hiển thị nút "Thanh toán"
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Modal,
  message,
} from "antd";
import "./PricingInfo.css";
import {
  DollarOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { confirm } = Modal;

const PricingInfo = ({
  sessionData = {},
  onPay,
  finishSession, // Từ hook
  isFinishing, // Loading state từ hook
}) => {
  const [pausedAt, setPausedAt] = useState(null);
  // Lock the stop button for the first 60 seconds from session start
  const [stopLocked, setStopLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  const formatMsToMMSS = (seconds) => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    // If no session or already completed, ensure unlocked
    if (!sessionData || sessionData?.isDone) {
      setStopLocked(false);
      setLockRemaining(0);
      return;
    }

    const start = sessionData.startTime ? new Date(sessionData.startTime) : null;
    if (!start) {
      setStopLocked(false);
      setLockRemaining(0);
      return;
    }

    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);

    if (elapsed < 60) {
      const remaining = 60 - elapsed;
      setStopLocked(true);
      setLockRemaining(remaining);

      const t = setInterval(() => {
        setLockRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(t);
            setStopLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(t);
    }

    // already past lock period
    setStopLocked(false);
    setLockRemaining(0);
  }, [sessionData?.startTime, sessionData?.isDone]);

  const pricePerKwh = sessionData.pricePerKwh ?? "-";
  const pricingItems = [
    {
      label: "Giá theo kWh",
      value: typeof pricePerKwh === "number" ? `${pricePerKwh}đ` : pricePerKwh,
    },
  ];

  const isCompleted = sessionData?.isDone || false;
  const isDisabled = isFinishing || !sessionData?.chargingSessionId || stopLocked;

  /**
   * Tính tổng năng lượng đã sạc tại một thời điểm
   */
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

  /**
   * Tính thời gian còn lại tại một thời điểm
   */
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

    // Freeze calculations
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
        setPausedAt(null);
        try {
          localStorage.removeItem("currentSessionPausedAt");
        } catch (e) {
          console.warn("Failed to remove currentSessionPausedAt:", e);
        }
      },
      onCancel: () => {
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
      } else {
        message.error(response.message || "Không thể dừng sạc");
      }
    } catch (error) {
      console.error("Error finishing session:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handlePayClick = () => {
    if (onPay) onPay();
  };

  return (
    <Card
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 16px rgba(5, 119, 70, 0.08)",
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
          <DollarOutlined style={{ fontSize: "24px", color: "#10b981" }} />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            Thông tin giá cả
          </Title>
        </Space>
      </div>

      {/* Pricing Details */}
      <Space
        direction="vertical"
        size="medium"
        style={{ width: "100%", marginBottom: "24px" }}
      >
        {pricingItems.map((item, index) => (
          <Row
            key={index}
            justify="space-between"
            align="middle"
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              marginBottom: index !== pricingItems.length - 1 ? "8px" : 0,
            }}
          >
            <Col>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Text>
            </Col>
            <Col>
              <Text
                style={{
                  color: "#1f2937",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                {item.value}
              </Text>
            </Col>
          </Row>
        ))}
      </Space>

      {/* Action Buttons */}
      <div className="controls-container-pay">
        {/* Hiển thị nút Dừng sạc nếu chưa hoàn thành */}
        {!isCompleted && (
          <Button
            className="pay-button"
            type="primary"
            danger
            icon={<PauseCircleOutlined />}
            loading={isFinishing}
            disabled={isDisabled}
            size="large"
            onClick={handleStopCharging}
            style={{
              width: "100%",
              height: "56px",
              fontSize: "18px",
              fontWeight: "600",
              opacity: stopLocked ? 0.6 : 1,
            }}
          >
            {isFinishing ? "Đang xử lý..." : "Dừng sạc"}
          </Button>
        )}

        {/* show small helper text when locked */}
        {!isCompleted && stopLocked && (
          <div style={{ marginTop: 8, textAlign: "center", color: "#6b7280" }}>
            Bạn có thể dừng sạc sau {formatMsToMMSS(lockRemaining)}
          </div>
        )}
        {/* Hiển thị nút Thanh toán sau khi đã hoàn thành */}
        {isCompleted && (
          <Button
            className="pay-button"
            type="success"
            onClick={handlePayClick}
            size="large"
            disabled={!onPay}
            style={{
              width: "100%",
              height: "56px",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            THANH TOÁN
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PricingInfo;
