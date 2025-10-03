import React from "react";
import { 
  Card, 
  Row, 
  Col,
  Statistic,
  Space
} from "antd";
import { 
  ThunderboltOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from "@ant-design/icons";

const EnergyStats = ({ sessionData }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Năng lượng đã sạc - 1/3 width */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #e8f4fd',
            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.08)',
            textAlign: 'center',
            height: '100%'
          }}
          styles={{
            body: { padding: '24px' }
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <ThunderboltOutlined 
              style={{ 
                fontSize: '32px', 
                color: '#1890ff',
                marginBottom: '8px'
              }} 
            />
            <Statistic
              title="Năng lượng đã sạc"
              value={sessionData.energyCharged}
              suffix="kWh"
              valueStyle={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a1a1a'
              }}
            />
          </Space>
        </Card>
      </Col>

      {/* Thời gian đã sạc - 1/3 width */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #e8f4fd',
            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.08)',
            textAlign: 'center',
            height: '100%'
          }}
          styles={{
            body: { padding: '24px' }
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <ClockCircleOutlined 
              style={{ 
                fontSize: '32px', 
                color: '#1890ff',
                marginBottom: '8px'
              }} 
            />
            <Statistic
              title="Thời gian đã sạc"
              value={sessionData.timeElapsed}
              valueStyle={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a1a1a'
              }}
            />
          </Space>
        </Card>
      </Col>

      {/* Chi phí ước tính - 1/3 width */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #e8f4fd',
            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.08)',
            textAlign: 'center',
            height: '100%'
          }}
          styles={{
            body: { padding: '24px' }
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <DollarOutlined 
              style={{ 
                fontSize: '32px', 
                color: '#1890ff',
                marginBottom: '8px'
              }} 
            />
            <Statistic
              title="Chi phí ước tính"
              value={sessionData.estimatedCost}
              suffix="VNĐ"
              valueStyle={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a1a1a'
              }}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default EnergyStats;