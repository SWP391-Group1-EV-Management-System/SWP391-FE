import React from "react";
import { Card, Typography, Space, Row, Col, Divider } from "antd";
import { DollarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PricingInfo = ({ sessionData }) => {
  const pricingItems = [
    {
      label: "Giá theo kWh",
      value: `${sessionData.pricePerKwh}đ`,
    },
    {
      label: "Giá theo phút",
      value: `${sessionData.pricePerMin}đ`,
    },
    {
      label: "Tổng thời gian",
      value: sessionData.timeElapsed,
    },
    {
      label: "Tổng năng lượng",
      value: `${sessionData.energyCharged} kWh`,
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
          marginBottom: "20px",
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

      <Divider style={{ margin: "15px 0"}} />

      {/* Cost Summary */}
      <div
        style={{
          background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          padding: "15px",
          borderRadius: "12px",
          border: "2px solid #10b981",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            color: "#065f46",
            fontSize: "14px",
            fontWeight: 600,
            display: "block",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Tổng chi phí dự kiến
        </Text>
        <div
          style={{
            color: "#047857",
            fontSize: "32px",
            fontWeight: 800,
            fontFamily: "monospace",
          }}
        >
          {sessionData.estimatedCost}đ
        </div>
      </div>
    </Card>
  );
};

export default PricingInfo;
