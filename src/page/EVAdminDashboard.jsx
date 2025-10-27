import React from "react";
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space } from "antd";
import {
  ThunderboltOutlined,
  SafetyOutlined,
  GlobalOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  AlertOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { Area } from '@ant-design/plots';
import Map from '../components/map/Map';


const { Title, Text } = Typography;

const revenueData = [
  { day: 'Thứ 2', revenue: 580 },
  { day: 'Thứ 3', revenue: 720 },
  { day: 'Thứ 4', revenue: 650 },
  { day: 'Thứ 5', revenue: 890 },
  { day: 'Thứ 6', revenue: 920 },
  { day: 'Thứ 7', revenue: 780 },
  { day: 'CN', revenue: 1050 }
];



function DashboardContent() {
  // Cấu hình cho biểu đồ AreaChart của Ant Design Plots
  const areaConfig = {
    data: revenueData,
    xField: 'day',
    yField: 'revenue',
    height: 280,
    smooth: true,
    areaStyle: { fill: 'l(90) 0:#1890ff 1:#e6f7ff' },
    color: '#1890ff',
    xAxis: { label: { style: { fill: '#8c8c8c', fontSize: 12 } } },
    yAxis: { label: { style: { fill: '#8c8c8c', fontSize: 12 } } },
    tooltip: { formatter: (datum) => ({ name: 'Doanh thu', value: `${datum.revenue}đ` }) }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <PageHeader
          title="Bảng điều khiển tổng quan"
          icon={<ThunderboltOutlined />}
        />

        {/* Stats Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Space>
                <DollarOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                <div>
                  <Text type="secondary">Doanh thu hôm nay</Text>
                  <Title level={3} style={{ margin: 0, color: "#262626" }}>1.250.000đ</Title>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Space>
                <ThunderboltOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <div>
                  <Text type="secondary">Trụ đang hoạt động</Text>
                  <Title level={3} style={{ margin: 0, color: "#262626" }}>32</Title>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Space>
                <EnvironmentOutlined style={{ fontSize: 32, color: "#faad14" }} />
                <div>
                  <Text type="secondary">Số trạm</Text>
                  <Title level={3} style={{ margin: 0, color: "#262626" }}>3</Title>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Space>
                <AlertOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
                <div>
                  <Text type="secondary">Sự cố mới</Text>
                  <Title level={3} style={{ margin: 0, color: "#262626" }}>5</Title>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Main Content Grid */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={14}>
            <Card
              title={<span style={{ fontWeight: 600 }}>Tổng quan trạm</span>}
              style={{ borderRadius: 8, minHeight: 320 }}
            >
              <div style={{ height: '300px', width: '100%' }}>  {/* Thêm wrapper với height cố định để bản đồ render đúng */}
                <Map />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={10}>
            <Card
              title={<span style={{ fontWeight: 600 }}>Doanh thu (7 ngày gần nhất)</span>}
              style={{ borderRadius: 8 }}
            >
              <Area {...areaConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default DashboardContent;
