import React from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import { ThunderboltOutlined, ClockCircleOutlined } from "@ant-design/icons";

const EnergyStats = ({ sessionData }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Năng lượng đã sạc */}
      <Col xs={24} sm={12} md={12}>
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            height: "100%",
          }}
          styles={{
            body: { padding: "24px" },
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

      {/* Thời gian đã sạc */}
      <Col xs={24} sm={12} md={12}>
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            height: "100%",
          }}
          styles={{
            body: { padding: "24px" },
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
    </Row>
  );
};

export default EnergyStats;
