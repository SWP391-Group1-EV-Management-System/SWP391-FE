import React, { useState } from 'react';
import { Row, Col, Card, DatePicker, Select, Button, Table, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

// Sample data
const revenueData = [
  { date: '2025-01', revenue: 2000000 },
  { date: '2025-02', revenue: 2500000 },
  { date: '2025-03', revenue: 1800000 },
  { date: '2025-04', revenue: 3200000 },
  { date: '2025-05', revenue: 2700000 },
];
const sessionsData = [
  { station: 'Trạm 1', sessions: 40 },
  { station: 'Trạm 2', sessions: 55 },
  { station: 'Trạm 3', sessions: 32 },
  { station: 'Trạm 4', sessions: 48 },
];
const paymentData = [
  { method: 'VNPay', percent: 45 },
  { method: 'Momo', percent: 35 },
  { method: 'Tiền mặt', percent: 20 },
];
const tableData = [
  {
    key: '1',
    station: 'Trạm 1',
    sessions: 40,
    kwh: 1200,
    revenue: 2000000,
  },
  {
    key: '2',
    station: 'Trạm 2',
    sessions: 55,
    kwh: 1800,
    revenue: 2500000,
  },
  {
    key: '3',
    station: 'Trạm 3',
    sessions: 32,
    kwh: 900,
    revenue: 1800000,
  },
  {
    key: '4',
    station: 'Trạm 4',
    sessions: 48,
    kwh: 1500,
    revenue: 2700000,
  },
];

const stationOptions = [
  { label: 'Trạm 1', value: 'Trạm 1' },
  { label: 'Trạm 2', value: 'Trạm 2' },
  { label: 'Trạm 3', value: 'Trạm 3' },
  { label: 'Trạm 4', value: 'Trạm 4' },
];
const chargingTypeOptions = [
  { label: 'AC', value: 'AC' },
  { label: 'DC', value: 'DC' },
];

const tableColumns = [
  {
    title: 'Tên trạm',
    dataIndex: 'station',
    key: 'station',
    align: 'center',
  },
  {
    title: 'Tổng phiên sạc',
    dataIndex: 'sessions',
    key: 'sessions',
    align: 'center',
  },
  {
    title: 'Tổng kWh',
    dataIndex: 'kwh',
    key: 'kwh',
    align: 'center',
  },
  {
    title: 'Doanh thu (VNĐ)',
    dataIndex: 'revenue',
    key: 'revenue',
    align: 'center',
    render: (val) => val.toLocaleString(),
  },
];

const cardStyle = {
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(27,94,32,0.08)',
  border: '1px solid #1b5e20',
};
const cardTitleStyle = {
  color: '#1b5e20',
  fontWeight: 'bold',
  borderBottom: '2px solid #1b5e20',
  paddingBottom: 4,
};

function ReportSection() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [station, setStation] = useState();
  const [chargingType, setChargingType] = useState();
  const [tablePage, setTablePage] = useState(1);

  // Chart configs
  const lineConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    height: 250,
    smooth: true,
    color: '#1b5e20',
    point: { size: 4, shape: 'circle', style: { fill: '#1b5e20' } },
    label: { style: { fill: '#222', fontWeight: 500 } },
    xAxis: { label: { style: { fill: '#222' } } },
    yAxis: { label: { style: { fill: '#222' } } },
    tooltip: { showMarkers: true },
  };
  const barConfig = {
    data: sessionsData,
    xField: 'station',
    yField: 'sessions',
    height: 250,
    color: '#1b5e20',
    barStyle: { cursor: 'pointer' },
    interactions: [{ type: 'active-region' }],
    tooltip: { showMarkers: true },
  };
  const pieConfig = {
    data: paymentData,
    angleField: 'percent',
    colorField: 'method',
    height: 250,
    radius: 0.9,
    color: ['#1b5e20', '#43a047', '#c8e6c9'],
    label: {
      type: 'inner',
      content: '{name}: {percentage}%',
      style: { fill: '#222', fontWeight: 500 },
    },
    legend: { position: 'bottom' },
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* Filters Row */}
      <Card style={{ ...cardStyle, marginBottom: 24 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle" wrap>
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Từ ngày"
              value={dateRange[0]}
              onChange={val => setDateRange([val, dateRange[1]])}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Đến ngày"
              value={dateRange[1]}
              onChange={val => setDateRange([dateRange[0], val])}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạm sạc"
              options={stationOptions}
              value={station}
              onChange={setStation}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Loại sạc"
              options={chargingTypeOptions}
              value={chargingType}
              onChange={setChargingType}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={1} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" style={{ background: '#1b5e20', borderColor: '#1b5e20' }}>
              Lọc dữ liệu
            </Button>
          </Col>
          <Col xs={12} sm={6} md={1} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button icon={<DownloadOutlined />} style={{ color: '#1b5e20', borderColor: '#1b5e20' }}>
              Xuất báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} wrap>
        <Col xs={24} md={12}>
          <Card style={cardStyle} styles={{ body: { padding: 16 } }}>
            <Title level={5} style={cardTitleStyle}>Doanh thu theo thời gian</Title>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={cardStyle} styles={{ body: { padding: 16 } }}>
            <Title level={5} style={cardTitleStyle}>Số phiên sạc theo trạm</Title>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
              <Bar {...barConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Insights Row */}
      <Row gutter={[16, 16]} wrap>
        <Col xs={24} md={10}>
          <Card style={cardStyle} styles={{ body: { padding: 16 } }}>
            <Title level={5} style={cardTitleStyle}>Tỷ lệ phương thức thanh toán</Title>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
              <Pie
                data={paymentData}
                angleField="percent"
                colorField="method"
                height={250}
                radius={0.9}
                color={["#1b5e20", "#43a047", "#c8e6c9"]}
                legend={{ position: "bottom" }}
                tooltip={{ showMarkers: true }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card style={cardStyle} styles={{ body: { padding: 16 } }}>
            <Title level={5} style={cardTitleStyle}>Doanh thu theo trạm</Title>
            <Table
              columns={tableColumns}
              dataSource={tableData}
              pagination={{ pageSize: 2, current: tablePage, onChange: setTablePage, size: 'small' }}
              bordered
              size="middle"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ReportSection;
