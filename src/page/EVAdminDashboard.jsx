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

const activities = [
  { time: '10:30', user: 'john.doe@gmail.com', station: 'Vincom Thao Dien', action: 'Bắt đầu phiên sạc (DC-01)' },
  { time: '10:25', user: 'jane.smith@gmail.com', station: 'Gigamall Thu Duc', action: 'Thanh toán thành công (300.000đ)' },
  { time: '10:15', user: 'staff_member_1', station: 'Vincom Thao Dien', action: 'Báo cáo sự cố (AC-03)' },
  { time: '09:55', user: 'peter.jones@gmail.com', station: 'Landmark 81', action: 'Hoàn thành phiên sạc (DC-02)' }
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
              <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #d9d9d9'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <EnvironmentOutlined style={{ fontSize: 64, color: '#bfbfbf', marginBottom: 16 }} />
                  <Text type="secondary" style={{ fontSize: 20, fontWeight: 500 }}>Map Placeholder</Text>
                </div>
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

        {/* Recent Activities */}
        <Card
          title={<span style={{ fontWeight: 600 }}>Hoạt động gần đây</span>}
          style={{ borderRadius: 8, marginBottom: 24 }}
        >
          <Table
            dataSource={activities}
            pagination={false}
            rowKey={(record) => record.time + record.user} // Sửa lại, không dùng index
            columns={[
              { title: 'Thời gian', dataIndex: 'time', key: 'time', width: 120 },
              { title: 'Người dùng', dataIndex: 'user', key: 'user', width: 220 },
              { title: 'Trạm', dataIndex: 'station', key: 'station', width: 200 },
              { title: 'Hoạt động', dataIndex: 'action', key: 'action', render: (text) => <Tag color="blue">{text}</Tag> }
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

export default DashboardContent;
