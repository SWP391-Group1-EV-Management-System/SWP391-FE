import React, { useMemo } from "react";
import { Card, Typography, Space, Row, Col, Divider } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
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
      console.log("⏱️ [WaitingTime] maxWaitingTime is a number (minutes):", maxWaitingTime);
      return maxWaitingTime;
    }

    // ✅ Case 2: maxWaitingTime là string datetime → Tính chênh lệch
    if (typeof maxWaitingTime === "string" && createdAt) {
      console.log("⏱️ [WaitingTime] maxWaitingTime is a datetime string");

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

      console.log("⏱️ [WaitingTime] Calculating waiting time:");
      console.log("   - maxWaitingTime:", maxWaitingTime);
      console.log("   - createdAt:", createdAt);
      console.log("   - diffMinutes:", diffMinutes);

      return diffMinutes > 0 ? diffMinutes : 0;
    }

    console.warn("⚠️ [WaitingTime] Unexpected maxWaitingTime format:", maxWaitingTime);
    return 0;
  } catch (error) {
    console.error("❌ [WaitingTime] Error calculating waiting time:", error);
    return 0;
  }
};

// Component 2: Waiting Time (maxWaitingTime)
export const WaitingTime = ({ sessionData }) => {
  // ✅ Tính số phút cần chờ
  const waitingMinutes = useMemo(() => {
    return calculateWaitingMinutes(
      sessionData.maxWaitingTime || sessionData.expectedWaitingTime,
      sessionData.createdAt
    );
  }, [sessionData.maxWaitingTime, sessionData.expectedWaitingTime, sessionData.createdAt]);

  // ✅ Tạo unique storage key dựa vào waitingListId hoặc bookingId
  const storageKey = useMemo(() => {
    const id = sessionData.waitingListId || sessionData.bookingId || "default";
    return `countdown_${id}`;
  }, [sessionData.waitingListId, sessionData.bookingId]);

  // ✅ Sử dụng local countdown (không cần backend SSE nữa!)
  const { countdown, status } = useCountdown(waitingMinutes, waitingMinutes > 0, storageKey);

  // ✅ Display time: Ưu tiên countdown, fallback về tính toán local
  const displayTime = countdown?.displayTime || `${waitingMinutes} phút`;
  const displayStatus = 
    status === "CANCELLED" ? "🛑 Đã hủy" :
    status === "RUNNING" ? "⏳ Đang đếm..." : 
    status === "COMPLETED" ? "✅ Hoàn thành" : "";

  const waitingSpecs = [
    {
      label: "Thời gian chờ tối đa",
      value: displayTime,
      highlight: status === "RUNNING" || status === "CANCELLED",
    },
    ...(displayStatus
      ? [
          {
            label: "Trạng thái",
            value: displayStatus,
          },
        ]
      : []),
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
                border: spec.highlight ? "2px solid #10b981" : "1px solid #e2e8f0",
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
            {index < waitingSpecs.length - 1 && <Divider style={{ margin: "8px 0", borderColor: "#e2e8f0" }} />}
          </div>
        ))}
      </Space>
    </Card>
  );
};
