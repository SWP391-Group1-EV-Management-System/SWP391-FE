import React from "react";
import { Card, Typography, Space, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const CurrentTime = ({ currentTime }) => {
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
          <ClockCircleOutlined style={{ fontSize: "24px", color: "#10b981" }} />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            Thời gian hiện tại
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
          marginBottom: "16px",
        }}
      >
        {currentTime.toLocaleTimeString()}
      </div>

      {/* Date Display */}
      <Text
        style={{
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        {currentTime.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      {/* Stop Charging Button in its own border */}
      <div
        style={{
          marginTop: "32px",
          padding: "10px",
        }}
      >
        <Button
          type="primary"
          danger
          style={{ width: "100%", fontSize: "20px", height: "56px", border: "none", outline: "none", boxShadow: "none" }}
          onClick={() => {
            
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>
            Dừng sạc
          </span>
        </Button>
      </div>

    </Card>
  );
};

export default CurrentTime;
