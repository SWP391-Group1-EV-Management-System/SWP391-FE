import React from "react";
import { Card, Typography, Space, Row, Col, Button, Divider } from "antd";
import { DollarOutlined, StopOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const BookingActions = ({ sessionData, onCancel, isCancelled }) => {
  const pricePerKwh = sessionData?.pricePerKwh ?? "-";

  const pricingItems = [
    {
      label: "Giá theo kWh",
      value:
        typeof pricePerKwh === "number"
          ? `${pricePerKwh.toLocaleString("vi-VN")}đ`
          : pricePerKwh,
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
        {isCancelled ? "Đã hủy" : "Hủy booking"}
      </Button>

      {/* Info Text */}
      {!isCancelled && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #fde68a",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#78350f" }}>
            💡 Bạn có thể hủy booking trước khi đến trạm. Sau khi hủy, vui lòng
            đặt lại nếu muốn sử dụng.
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
            ❌ Booking đã bị hủy. Vui lòng đặt lại nếu muốn tiếp tục sử dụng.
          </Text>
        </div>
      )}
    </Card>
  );
};

export default BookingActions;
