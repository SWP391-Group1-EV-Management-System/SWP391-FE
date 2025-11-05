import React, { useMemo, useEffect, useRef } from "react";
import { Card, Typography, Space, Row, Col, Divider, Button } from "antd";
import { ClockCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useCountdown } from "../../hooks/useCountdown";

const { Title, Text } = Typography;

/**
 * Tính số phút chờ
 * - Nếu maxWaitingTime là STRING (ISO datetime) → Tính maxWaitingTime - createdAt
 * - Nếu maxWaitingTime là NUMBER (phút) → Dùng trực tiếp
 */
const calculateWaitingMinutes = (maxWaitingTime, createdAt) => {
  if (!maxWaitingTime) return 0;

  try {
    // ✅ Case 1: maxWaitingTime là số (phút) → Dùng trực tiếp
    if (typeof maxWaitingTime === "number") {
      return maxWaitingTime;
    }

    // ✅ Case 2: maxWaitingTime là string datetime → Tính chênh lệch
    if (typeof maxWaitingTime === "string" && createdAt) {
      const endTime = new Date(maxWaitingTime);
      const startTime = new Date(createdAt);

      // Kiểm tra valid dates
      if (isNaN(endTime.getTime()) || isNaN(startTime.getTime())) {
        console.warn("⚠️ [WaitingTime] Invalid datetime format");
        return 0;
      }

      // Tính số milliseconds chênh lệch
      const diffMs = endTime - startTime;

      // Convert sang phút
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      return diffMinutes > 0 ? diffMinutes : 0;
    }

    console.warn(
      "⚠️ [WaitingTime] Unexpected maxWaitingTime format:",
      maxWaitingTime
    );
    return 0;
  } catch (error) {
    console.error("❌ [WaitingTime] Error calculating waiting time:", error);
    return 0;
  }
};

// Component 2: Waiting Time (maxWaitingTime)
export const WaitingTime = ({ sessionData, onCancel, isCancelled }) => {
  // ✅ Tính số phút cần chờ
  const waitingMinutes = useMemo(() => {
    return calculateWaitingMinutes(
      sessionData.maxWaitingTime || sessionData.expectedWaitingTime,
      sessionData.createdAt
    );
  }, [
    sessionData.maxWaitingTime,
    sessionData.expectedWaitingTime,
    sessionData.createdAt,
  ]);

  // ✅ Tạo unique storage key dựa vào waitingListId hoặc bookingId
  const storageKey = useMemo(() => {
    const id = sessionData.waitingListId || sessionData.bookingId || "default";
    return `countdown_${id}`;
  }, [sessionData.waitingListId, sessionData.bookingId]);

  // ✅ Sử dụng local countdown (không cần backend SSE nữa!)
  const { countdown, status } = useCountdown(
    waitingMinutes,
    waitingMinutes > 0,
    storageKey
  );

  // ✅ Ref để track việc đã auto-cancel chưa (tránh gọi nhiều lần)
  const autoCancelledRef = useRef(false);

  // ✅ Auto-cancel khi countdown về 0
  useEffect(() => {
    // Chỉ auto-cancel nếu:
    // 1. Status = "COMPLETED" (countdown hết giờ)
    // 2. Có callback onCancel
    // 3. Chưa bị cancelled
    // 4. Chưa auto-cancel trước đó
    if (
      status === "COMPLETED" &&
      onCancel &&
      !isCancelled &&
      !autoCancelledRef.current
    ) {
      console.log(
        "⏰ [WaitingTime] Countdown completed, auto-cancelling booking..."
      );
      autoCancelledRef.current = true; // ✅ Đánh dấu đã auto-cancel
      onCancel(); // ✅ Gọi API cancel booking
    }
  }, [status, onCancel, isCancelled]);

  // ✅ Display time: Ưu tiên countdown, fallback về tính toán local
  const displayTime = countdown?.displayTime || `${waitingMinutes} phút`;
  const waitingSpecs = [
    {
      label: "Thời gian chờ tối đa",
      value: displayTime,
      highlight: status === "RUNNING" || status === "CANCELLED",
    },
  ];

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
          <ClockCircleOutlined style={{ fontSize: "24px", color: "#10b981" }} />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            Thời gian chờ
          </Title>
        </Space>
      </div>

      {/* Waiting Time Details - Each Row */}
      <Space direction="vertical" size="medium" style={{ width: "100%" }}>
        {waitingSpecs.map((spec, index) => (
          <div key={index}>
            <Row
              justify="space-between"
              align="middle"
              style={{
                padding: "16px 20px",
                backgroundColor: spec.highlight ? "#d1fae5" : "#f8fafc",
                borderRadius: "12px",
                border: spec.highlight
                  ? "2px solid #10b981"
                  : "1px solid #e2e8f0",
                transition: "all 0.3s ease",
              }}
            >
              <Col>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  {spec.label}
                </Text>
              </Col>
              <Col>
                <Text
                  style={{
                    color: spec.highlight ? "#10b981" : "#1f2937",
                    fontSize: "16px",
                    fontWeight: spec.highlight ? 700 : 600,
                    fontFamily: "monospace",
                  }}
                >
                  {spec.value}
                </Text>
              </Col>
            </Row>

            {/* Add divider between items except last one */}
            {index < waitingSpecs.length - 1 && (
              <Divider style={{ margin: "8px 0", borderColor: "#e2e8f0" }} />
            )}
          </div>
        ))}
      </Space>

      {/* Cancel Button (chỉ hiển thị cho booking) */}
      {onCancel && (
        <>
          <Button
            danger
            type="primary"
            icon={<StopOutlined />}
            onClick={onCancel}
            disabled={isCancelled}
            size="large"
            style={{
              width: "100%",
              height: "56px",
              fontSize: "18px",
              fontWeight: "600",
              borderRadius: "12px",
              marginTop: "13px",
              opacity: isCancelled ? 0.5 : 1,
            }}
          >
            {isCancelled ? "Đã hủy" : "Hủy booking"}
          </Button>

          {/* Info Text */}
          {!isCancelled && (
            <div
              style={{
                marginTop: "13px",
                padding: "12px",
                backgroundColor: "#dbeafe",
                borderRadius: "8px",
                border: "1px solid #93c5fd",
              }}
            >
              <Text style={{ fontSize: "12px", color: "#1e40af" }}>
                💡 Bạn có thể hủy booking trước khi đến trạm. Vui lòng đến đúng
                giờ để tránh bị hủy tự động.
              </Text>
            </div>
          )}

          {isCancelled && (
            <div
              style={{
                marginTop: "13px",
                padding: "12px",
                backgroundColor: "#fee2e2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
              }}
            >
              <Text style={{ fontSize: "12px", color: "#991b1b" }}>
                ❌ Booking đã bị hủy. Vui lòng đặt lại nếu muốn tiếp tục sử
                dụng.
              </Text>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
