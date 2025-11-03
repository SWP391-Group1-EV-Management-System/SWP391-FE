import React from "react";
import { Card, Typography, Space, Row, Col, Divider } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
// Component 2: Waiting Time (maxWaitingTime)
export const WaitingTime = ({ sessionData }) => {
  const waitingSpecs = [
    {
      label: "Thời gian chờ tối đa",
      value: `${sessionData.maxWaitingTime || 0} phút`,
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
                border: spec.highlight
                  ? "2px solid #10b981"
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
            {index < waitingSpecs.length - 1 && (
              <Divider style={{ margin: "8px 0", borderColor: "#e2e8f0" }} />
            )}
          </div>
        ))}
      </Space>
    </Card>
  );
};
