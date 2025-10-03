import React from "react";
import { 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col,
  Divider
} from "antd";
import { 
  SettingOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TechnicalDetails = ({ sessionData }) => {
  const techSpecs = [
    {
      label: "Loại cổng sạc",
      value: sessionData.socketType
    },
    {
      label: "Công suất tối đa", 
      value: sessionData.power
    },
    {
      label: "Công suất hiện tại",
      value: `${sessionData.chargingPower} kW`,
      highlight: true
    },
    {
      label: "Điện áp",
      value: sessionData.voltage
    },
    {
      label: "Dòng điện",
      value: sessionData.current
    }
  ];

  return (
    <Card
      style={{
        borderRadius: '16px',
        border: '1px solid #e8f4fd',
        boxShadow: '0 4px 16px rgba(24, 144, 255, 0.08)'
      }}
      styles={{
        body: { padding: '24px' }
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <SettingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
            Thông số kỹ thuật
          </Title>
        </Space>
      </div>

      {/* Technical Details - Each Row */}
      <Space direction="vertical" size="medium" style={{ width: '100%' }}>
        {techSpecs.map((spec, index) => (
          <div key={index}>
            <Row 
              justify="space-between" 
              align="middle" 
              style={{
                padding: '16px 20px',
                backgroundColor: spec.highlight ? '#e6f7ff' : '#f8fafc',
                borderRadius: '12px',
                border: spec.highlight ? '2px solid #91d5ff' : '1px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}
            >
              <Col>
                <Text style={{ 
                  color: '#6b7280',
                  fontSize: '16px',
                  fontWeight: 500
                }}>
                  {spec.label}
                </Text>
              </Col>
              <Col>
                <Text style={{ 
                  color: spec.highlight ? '#1890ff' : '#1f2937',
                  fontSize: '16px',
                  fontWeight: spec.highlight ? 700 : 600,
                  fontFamily: 'monospace'
                }}>
                  {spec.value}
                </Text>
              </Col>
            </Row>
            
            {/* Add divider between items except last one */}
            {index < techSpecs.length - 1 && (
              <Divider style={{ margin: '8px 0', borderColor: '#e2e8f0' }} />
            )}
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default TechnicalDetails;