import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  SafetyOutlined,
  GlobalOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Column, Pie } from "@ant-design/plots";

const ROW_GUTTER = 20; // Define a constant for the gutter value

function DashboardContent() {
  const chartData = [
    { type: "Trạm 1", sessions: 35 },
    { type: "Trạm 2", sessions: 45 },
    { type: "Trạm 3", sessions: 25 },
    { type: "Trạm 4", sessions: 55 },
  ];

  const pieData = [
    { type: "Hoạt động", value: 70 },
    { type: "Bảo trì", value: 20 },
    { type: "Ngừng", value: 10 },
  ];

  // Configuration for the column chart displaying session statistics per station
  const columnConfig = {
    data: chartData, // Data source for the chart
    xField: "type", // Field representing the x-axis (station names)
    yField: "sessions", // Field representing the y-axis (number of sessions)
    color: "#228B22", // Color of the columns
    columnStyle: { radius: [8, 8, 0, 0] }, // Style for rounded top corners of columns
  };

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#228B22", "#9ACD32", "#B0E0A8"],
    radius: 0.9,
    label: {
      type: "outer",
      content: (item) => `${item.type}: ${item.value}%`,
      style: { fontSize: 14, fill: "#000" },
    },
    legend: {
      position: "bottom",
      itemName: { style: { fill: "#000" } },
    },
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title" 
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#145A32",
        }}>
        ⚡ Bảng điều khiển tổng quan
      </h1>
      
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #F0F0F0",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              padding: "16px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: "#333" }} />
            </div>
            <div style={{ textAlign: "center", color: "#666", fontSize: 16, marginBottom: "10px" }}>
              Trạm sạc hoạt động
            </div>
            <div style={{ textAlign: "center", fontSize: 36, fontWeight: "bold", marginBottom: "10px" }}>
              248
            </div>
            <div style={{ textAlign: "center", color: "#4CAF50" }}>
              <ArrowUpOutlined /> +12%
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #F0F0F0",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              padding: "16px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: "#333" }} />
            </div>
            <div style={{ textAlign: "center", color: "#666", fontSize: 16, marginBottom: "10px" }}>
              Phiên sạc tháng này
            </div>
            <div style={{ textAlign: "center", fontSize: 36, fontWeight: "bold", marginBottom: "10px" }}>
              1.247
            </div>
            <div style={{ textAlign: "center", color: "#4CAF50" }}>
              <ArrowUpOutlined /> +8%
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #F0F0F0",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              padding: "16px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <GlobalOutlined style={{ fontSize: 32, color: "#333" }} />
            </div>
            <div style={{ textAlign: "center", color: "#666", fontSize: 16, marginBottom: "10px" }}>
              Người dùng active
            </div>
            <div style={{ textAlign: "center", fontSize: 36, fontWeight: "bold", marginBottom: "10px" }}>
              8.932
            </div>
            <div style={{ textAlign: "center", color: "#4CAF50" }}>
              <ArrowUpOutlined /> +15%
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #F0F0F0",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              padding: "16px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <SafetyOutlined style={{ fontSize: 32, color: "#333" }} />
            </div>
            <div style={{ textAlign: "center", color: "#666", fontSize: 16, marginBottom: "10px" }}>
              Độ tin cậy
            </div>
            <div style={{ textAlign: "center", fontSize: 36, fontWeight: "bold", marginBottom: "10px" }}>
              99.8%
            </div>
            <div style={{ textAlign: "center", color: "#4CAF50" }}>
              <ArrowUpOutlined /> +0.2%
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[24, 24]}>
        <Col span={14}>
          <Card
            title="Thống kê phiên sạc theo trạm"
            styles={{
              header: {
                color: "#145A32",
                fontWeight: "bold",
                textAlign: "center",
              }
            }}
            style={{
              borderRadius: 12,
              border: "1px solid #C8E6C9",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <Column {...columnConfig} />
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title="Tỷ lệ trạng thái trạm"
            styles={{
              header: {
                color: "#145A32",
                fontWeight: "bold",
                textAlign: "center",
              },
            }}
            style={{
              borderRadius: 12,
              border: "1px solid #C8E6C9",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardContent;
