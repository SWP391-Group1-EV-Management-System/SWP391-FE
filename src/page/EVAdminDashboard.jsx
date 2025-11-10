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
  UserOutlined,
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

// Dữ liệu bảng doanh thu theo trạm
const stationRevenueColumns = [
  {
    title: 'Trạm',
    dataIndex: 'station',
    key: 'station',
    render: (text) => <Text strong>{text}</Text>,
  },
  {
    title: 'Doanh thu',
    dataIndex: 'revenue',
    key: 'revenue',
    render: (value) => <Text>{value.toLocaleString()}đ</Text>,
    sorter: (a, b) => a.revenue - b.revenue,
  },
  {
    title: 'Lượt sạc',
    dataIndex: 'charges',
    key: 'charges',
    align: 'center',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (status) => (
      <Tag color={status === 'Hoạt động' ? 'green' : 'red'}>
        {status}
      </Tag>
    ),
  },
];

const stationRevenueData = [
  { key: '1', station: 'Trạm Quận 1', revenue: 4500000, charges: 128, status: 'Hoạt động' },
  { key: '2', station: 'Trạm Quận 3', revenue: 3800000, charges: 95, status: 'Hoạt động' },
  { key: '3', station: 'Trạm Quận 7', revenue: 5200000, charges: 142, status: 'Hoạt động' },
  { key: '4', station: 'Trạm Bình Thạnh', revenue: 2900000, charges: 78, status: 'Bảo trì' },
  { key: '5', station: 'Trạm Thủ Đức', revenue: 4100000, charges: 115, status: 'Hoạt động' },
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

        {/* Stats Grid - 4 thống kê */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>Doanh thu hôm nay</Text>
                <Title level={4} style={{ margin: 0, color: "#1890ff" }}>1.250.000đ</Title>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>Doanh thu tháng</Text>
                <Title level={4} style={{ margin: 0, color: "#52c41a" }}>35.480.000đ</Title>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>Lượt sạc</Text>
                <Title level={4} style={{ margin: 0, color: "#faad14" }}>558</Title>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>Người dùng trả phí</Text>
                <Title level={4} style={{ margin: 0, color: "#eb2f96" }}>248</Title>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Map Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title={<span style={{ fontWeight: 600 }}>Tổng quan trạm sạc</span>}
              style={{ borderRadius: 8 }}
            >
              <div style={{ height: '400px', width: '100%' }}>
                <Map />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Revenue Chart & Station Revenue Table */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ fontWeight: 600 }}>Doanh thu 7 ngày gần nhất</span>}
              style={{ borderRadius: 8 }}
            >
              <Area {...areaConfig} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ fontWeight: 600 }}>Bảng doanh thu theo trạm</span>}
              style={{ borderRadius: 8 }}
            >
              <Table
                columns={stationRevenueColumns}
                dataSource={stationRevenueData}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default DashboardContent;
