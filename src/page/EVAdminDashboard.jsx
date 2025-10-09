import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  ThunderboltOutlined,
  SafetyOutlined,
  GlobalOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { BarChart, PieChart } from '@mui/x-charts';
import PageHeader from "../components/PageHeader";

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

  // Cấu hình cho biểu đồ cột (BarChart) từ @mui/x-charts
  const barChartConfig = {
    xAxis: [{ scaleType: 'band', data: chartData.map(item => item.type) }],
    series: [{ data: chartData.map(item => item.sessions), color: '#228B22' }],
    height: 300,
  };

  // Cấu hình cho biểu đồ tròn (PieChart) từ @mui/x-charts
  const pieChartConfig = {
    series: [{
      data: pieData.map(item => ({ label: item.type, value: item.value })),
      innerRadius: 0,
      outerRadius: 100,
      colors: ['#228B22', '#9ACD32', '#B0E0A8'],
    }],
    height: 300,
  };

  return (
    <div className="dashboard-container">
      <PageHeader
        title="Bảng điều khiển tổng quan"
        icon={<ThunderboltOutlined />}
      />
      
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        {[
          {
            icon: <ThunderboltOutlined style={{ fontSize: 32, color: "#333" }} />,
            title: "Trạm sạc hoạt động",
            value: "248",
            change: "+12%",
            changeColor: "#4CAF50",
          },
          {
            icon: <ThunderboltOutlined style={{ fontSize: 32, color: "#333" }} />,
            title: "Phiên sạc tháng này",
            value: "1.247",
            change: "+8%",
            changeColor: "#4CAF50",
          },
          {
            icon: <GlobalOutlined style={{ fontSize: 32, color: "#333" }} />,
            title: "Người dùng active",
            value: "8.932",
            change: "+15%",
            changeColor: "#4CAF50",
          },
          {
            icon: <SafetyOutlined style={{ fontSize: 32, color: "#333" }} />,
            title: "Độ tin cậy",
            value: "99.8%",
            change: "+0.2%",
            changeColor: "#4CAF50",
          },
        ].map((card, index) => (
          <Col span={6} key={index}>
            <Card
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E0E0E0",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                padding: "12px",
                height: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflow: "hidden",
                transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out", // Hiệu ứng mượt mà hơn
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)"; // Nảy nhẹ hơn
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; // Tăng độ bóng
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"; // Trở về kích thước ban đầu
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.03)"; // Trở về độ bóng ban đầu
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ textAlign: "center", color: "#666", fontSize: 14, marginBottom: "8px" }}>
                {card.title}
              </div>
              <div style={{ textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: "8px" }}>
                {card.value}
              </div>
              <div style={{ textAlign: "center", color: card.changeColor, fontSize: 12 }}>
                <ArrowUpOutlined /> {card.change}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

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
              border: "1px solid #E0E0E0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <BarChart {...barChartConfig} />
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
              border: "1px solid #E0E0E0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <PieChart {...pieChartConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardContent;
