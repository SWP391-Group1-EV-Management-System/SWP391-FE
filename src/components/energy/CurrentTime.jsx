import React from "react";
import { Card, Typography, Space, Button, Modal } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const CurrentTime = ({ currentTime, onStopCharging }) => {
  const handleStopCharging = () => {
    Modal.confirm({
      title: "Xác nhận dừng sạc",
      content: "Bạn có chắc chắn muốn dừng phiên sạc không?",
      okText: "Dừng sạc",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        if (onStopCharging) {
          onStopCharging();
        }
      },
    });
  };

  return (
    <div>
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 16px rgba(5, 119, 70, 0.08)",
          textAlign: "center",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Space>
            <ClockCircleOutlined style={{ fontSize: "24px", color: "#10b981" }} />
            <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
              Thời gian hiện tại
            </Title>
          </Space>
        </div>
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
      </Card>
     
        <Button
          type="primary"
          danger
          size="large"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
            height: "60px",
            borderRadius: "16px",
          }}
          onClick={handleStopCharging}
        >
          Dừng Sạc
        </Button>
    </div>
  );
};

export default CurrentTime;
