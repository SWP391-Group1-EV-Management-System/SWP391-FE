/**
 * ENERGY STATS COMPONENT
 *
 * Component hiển thị các thống kê năng lượng và thời gian của phiên sạc
 * Nhận dữ liệu realtime từ component cha (SessionPage) qua props
 *
 * Props:
 * - sessionData: Dữ liệu session ban đầu từ API
 * - realtimeProgress: Dữ liệu realtime từ SSE { energyCharged, timeElapsed }
 */

import React from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import { ThunderboltOutlined, ClockCircleOutlined } from "@ant-design/icons";

/**
 * Component chính hiển thị các thống kê năng lượng/thời gian của phiên sạc
 * Layout: 2 cột responsive
 */
const EnergyStats = ({ sessionData, realtimeProgress }) => {
  // ✅ Debug: Log để kiểm tra props

  // ✅ Ưu tiên dữ liệu realtime từ SSE, fallback về sessionData
  const energyCharged =
    realtimeProgress?.energyCharged != null
      ? realtimeProgress.energyCharged
      : sessionData?.energyCharged || 0;

  const timeElapsed = realtimeProgress?.timeElapsed
    ? realtimeProgress.timeElapsed
    : sessionData?.timeElapsed || "00:00";

  return (
    <Row gutter={[16, 16]}>
      {/* ==================== CARD 1: NĂNG LƯỢNG ĐÃ SẠC ==================== */}
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
              value={Number(energyCharged).toFixed(2)}
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

      {/* ==================== CARD 2: THỜI GIAN ĐÃ SẠC ==================== */}
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
              value={timeElapsed}
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
