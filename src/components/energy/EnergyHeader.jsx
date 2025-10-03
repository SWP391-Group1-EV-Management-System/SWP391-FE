import React from "react";
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Row, 
  Col
} from "antd";
import { 
  ThunderboltOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const EnergyHeader = ({ sessionData, statusConfig }) => {
  return (
    <Card
      style={{
        borderRadius: '16px',
        border: '1px solid #e8f4fd',
        boxShadow: '0 4px 16px rgba(24, 144, 255, 0.08)',
        marginBottom: '24px'
      }}
      styles={{
        body: { padding: '24px' }
      }}
    >
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        {/* Logo và Station Info */}
        <Col xs={24} md={16}>
          <Space size="large" align="start">
            {/* Charging Station Icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '32px',
              flexShrink: 0
            }}>
              <ThunderboltOutlined />
            </div>
            
            {/* Station Details */}
            <div>
              <Title 
                level={2} 
                style={{ 
                  margin: 0, 
                  marginBottom: '8px',
                  color: '#1a1a1a',
                  fontSize: '28px',
                  fontWeight: 700
                }}
              >
                {sessionData.stationName}
              </Title>
              <Space size="small" style={{ color: '#6b7280' }}>
                <EnvironmentOutlined style={{ fontSize: '16px' }} />
                <Text style={{ 
                  color: '#6b7280',
                  fontSize: '16px',
                  fontWeight: 500
                }}>
                  {sessionData.address}
                </Text>
              </Space>
            </div>
          </Space>
        </Col>
        
        {/* Status Badge */}
        <Col xs={24} md={8} style={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Tag 
            color={statusConfig.color}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>{statusConfig.icon}</span>
            {statusConfig.text}
          </Tag>
        </Col>
      </Row>
    </Card>
  );
};

export default EnergyHeader;