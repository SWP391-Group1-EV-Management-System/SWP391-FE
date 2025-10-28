import React from "react";
import { Card, Typography, Space, Row, Col, Button } from "antd";
import "./PricingInfo.css";
import { DollarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PricingInfo = ({ sessionData = {}, onPay }) => {
  const pricePerKwh = sessionData.pricePerKwh ?? '-';
  const pricingItems = [
    {
      label: 'Giá theo kWh',
      value: typeof pricePerKwh === 'number' ? `${pricePerKwh}đ` : pricePerKwh,
    },
  ];

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

      {/* Payment Button */}
      <div className="controls-container-pay">
        <Button className="pay-button" type="success" onClick={handlePayClick} size="large" disabled={!onPay}>
          THANH TOÁN
        </Button>
      </div>
    </Card>
  );
};

export default PricingInfo;
