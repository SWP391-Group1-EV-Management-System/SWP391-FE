import React from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const EnergyStats = ({ sessionData }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Năng lượng đã sạc */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(5, 119, 70, 0.08)",
            textAlign: "center",
          }}
          styles={{
            body: { padding: "24px" },
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <ThunderboltOutlined
              style={{
                fontSize: "32px",
                color: "#1890ff",
                marginBottom: "8px",
              }}
            />
            <Statistic
              title="Năng lượng đã sạc"
              value={sessionData.energyCharged}
              suffix="kWh"
              valueStyle={{
                fontSize: "36px",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            />
          </Space>
        </Card>
      </Col>

      {/* Thời gian đã sạc */}
      <Col xs={24} md={8}>
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
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <ClockCircleOutlined
              style={{
                fontSize: "32px",
                color: "#1890ff",
                marginBottom: "8px",
              }}
            />
            <Statistic
              title="Thời gian đã sạc"
              value={sessionData.timeElapsed}
              valueStyle={{
                fontSize: "36px",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            />
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
                marginTop: "8px",
              }}
            ></div>
          </Space>
        </Card>
      </Col>

      {/* Chi phí ước tính */}
      <Col xs={24} md={8}>
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
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <DollarOutlined
              style={{
                fontSize: "32px",
                color: "#1890ff",
                marginBottom: "8px",
              }}
            />
            <Statistic
              title="Chi phí ước tính"
              value={sessionData.estimatedCost}
              suffix="VNĐ"
              valueStyle={{
                fontSize: "36px",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default EnergyStats;
