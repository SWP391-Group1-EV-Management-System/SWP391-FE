import React from "react";
import { Card, Progress, Typography, Space, Tag } from "antd";


const { Title } = Typography;

const BatteryProgress = ({
  batteryLevel = 75,
  isCharging = false,
  isCompleted = false,
}) => {
  /**
   * Custom Battery Icon Component
   */
  const BatteryIcon = ({ level, color = "#10b981" }) => {
    const batteryWidth = 24;
    const batteryHeight = 14;
    const fillWidth = (batteryWidth - 4) * (level / 100);

    return (
      <svg
        width="28"
        height="18"
        viewBox="0 0 28 18"
        style={{ display: "inline-block", verticalAlign: "middle" }}
      >
        {/* Battery body */}
        <rect
          x="1"
          y="3"
          width={batteryWidth}
          height={batteryHeight}
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Battery positive terminal */}
        <rect
          x={batteryWidth + 1}
          y="7"
          width="2"
          height="6"
          rx="1"
          fill={color}
        />

        {/* Battery fill */}
        <rect
          x="3"
          y="5"
          width={fillWidth}
          height={batteryHeight - 4}
          rx="1"
          fill={color}
          opacity="0.8"
        />
      </svg>
    );
  };
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
          <BatteryIcon level={batteryLevel} color="#10b981" />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            Trạng thái pin
          </Title>
        </Space>
        
      </div>

      {/* Main Progress Circle Only */}
      <Progress
        type="circle"
        percent={batteryLevel}
        format={(percent) => (
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "700",
              color: "#10b981",
              lineHeight: 1,
            }}
          >
            {percent}%
          </div>
        )}
        strokeColor="#10b981"
        trailColor="#f0f0f0"
        strokeWidth={8}
        size={180}
        strokeLinecap="round"
      />
    </Card>
  );
};

export default BatteryProgress;
