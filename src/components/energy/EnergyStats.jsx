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
      {/* Năng lượng đã sạc - 1/3 width */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            height: "100%",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <ThunderboltOutlined
              style={{
                fontSize: "32px",
                color: "#10b981",
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

      {/* Thời gian đã sạc - 1/3 width */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            height: "100%",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <ClockCircleOutlined
              style={{
                fontSize: "32px",
                color: "#10b981",
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
          </Space>
        </Card>
      </Col>

      {/* Chi phí ước tính - 1/3 width */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            height: "100%",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <DollarOutlined
              style={{
                fontSize: "32px",
                color: "#10b981",
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
