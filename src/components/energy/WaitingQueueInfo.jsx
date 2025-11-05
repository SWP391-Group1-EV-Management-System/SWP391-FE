import React from "react";
import { Card, Typography, Space, Row, Col, Button, Divider } from "antd";
import { TeamOutlined, StopOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WaitingQueueInfo = ({
  sessionData,
  queueRank,
  onCancel,
  isCancelled,
}) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const queueInfo = [
    {
      label: "Vị trí trong hàng đợi",
      value:
        queueRank !== null && queueRank !== undefined
          ? `#${queueRank}`
          : "Đang cập nhật...",
      highlight: true,
    },
    {
      label: "Trạng thái",
      value: isCancelled
        ? "Đã hủy"
        : sessionData?.status === "waiting"
        ? "Đang chờ"
        : sessionData?.status || "Đang chờ",
    },
    ...(sessionData?.outedAt
      ? [
          {
            label: "Rời hàng đợi lúc",
            value: formatDateTime(sessionData.outedAt),
            highlight: true,
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
          <TeamOutlined style={{ fontSize: "24px", color: "#10b981" }} />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            Thông tin hàng đợi
          </Title>
        </Space>
      </div>

      {/* Queue Details */}
      <Space
        direction="vertical"
        size="medium"
        style={{ width: "100%", marginBottom: "14px" }}
      >
        {queueInfo.map((item, index) => (
          <div key={index}>
            <Row
              justify="space-between"
              align="middle"
              style={{
                padding: "16px 20px",
                backgroundColor: item.highlight ? "#fef3c7" : "#f8fafc",
                borderRadius: "12px",
                border: item.highlight
                  ? "2px solid #f59e0b"
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
                  {item.label}
                </Text>
              </Col>
              <Col>
                <Text
                  style={{
                    color: item.highlight ? "#f59e0b" : "#1f2937",
                    fontSize: "16px",
                    fontWeight: item.highlight ? 700 : 600,
                    fontFamily: "monospace",
                  }}
                >
                  {item.value}
                </Text>
              </Col>
            </Row>

            {index < queueInfo.length - 1 && (
              <Divider style={{ margin: "8px 0", borderColor: "#e2e8f0" }} />
            )}
          </div>
        ))}
      </Space>

      {/* Cancel Button */}
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
          opacity: isCancelled ? 0.5 : 1,
        }}
      >
        {isCancelled ? "Đã hủy" : "Hủy hàng đợi"}
      </Button>

      {/* Info Text */}
      {!isCancelled && (
        <div
          style={{
            marginTop: "13px",
            padding: "12px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #fde68a",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#78350f" }}>
            💡 Bạn sẽ được thông báo khi đến lượt. Vui lòng đến trạm đúng giờ để
            tránh bị hủy tự động.
          </Text>
        </div>
      )}

      {isCancelled && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#fee2e2",
            borderRadius: "8px",
            border: "1px solid #fecaca",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#991b1b" }}>
            ❌ Hàng đợi đã bị hủy. Vui lòng đặt lại nếu muốn tiếp tục.
          </Text>
        </div>
      )}
    </Card>
  );
};

export default WaitingQueueInfo;
