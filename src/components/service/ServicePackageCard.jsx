import React from 'react';
import { Card, Button, Tag, Typography, Space, Divider } from 'antd';
import { 
  CrownOutlined, 
  ThunderboltOutlined, 
  SafetyOutlined,
  CalendarOutlined,
  DollarOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * Component hiển thị thông tin gói dịch vụ dưới dạng card cho Driver
 * Sử dụng Ant Design Card component
 */
const ServicePackageCard = ({ 
  id,
  name, 
  description, 
  price, 
  duration, 
  type,
  onSubscribe 
}) => {
  
  /**
   * Xử lý icon và màu sắc theo loại gói
   */
  const getPackageConfig = (packageType) => {
    switch (packageType) {
      case 'VIP':
        return {
          icon: <CrownOutlined />,
          color: '#faad14',
          tagColor: 'gold',
          buttonType: 'primary',
          gradient: 'linear-gradient(135deg, #fff7e6, #fff1b8)'
        };
      case 'Prepaid':
        return {
          icon: <ThunderboltOutlined />,
          color: '#1890ff',
          tagColor: 'blue',
          buttonType: 'primary',
          gradient: 'linear-gradient(135deg, #e6f7ff, #bae7ff)'
        };
      case 'Postpaid':
        return {
          icon: <SafetyOutlined />,
          color: '#52c41a',
          tagColor: 'green',
          buttonType: 'primary',
          gradient: 'linear-gradient(135deg, #f6ffed, #d9f7be)'
        };
      default:
        return {
          icon: <SafetyOutlined />,
          color: '#8c8c8c',
          tagColor: 'default',
          buttonType: 'default',
          gradient: 'linear-gradient(135deg, #fafafa, #f0f0f0)'
        };
    }
  };

  const config = getPackageConfig(type);

  /**
   * Xử lý sự kiện đăng ký gói
   */
  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe({ id, name, price, type });
    }
  };

  return (
    <Card
      hoverable
      style={{
        background: config.gradient,
        borderRadius: '12px',
        border: `2px solid ${config.color}`,
        height: '100%'
      }}
      styles={{
        body: { padding: '24px' } // Fixed: Changed from bodyStyle
      }}
      actions={[
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 16px' }}>
          <Button 
            key="subscribe"
            type="primary"
            size="large"
            block
            onClick={handleSubscribe}
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '24px',
              background: config.color,
              borderColor: config.color,
              color: '#fff',
              boxShadow: `0 2px 8px ${config.color}33`,
              width: '100%',
              margin: 0,
            }}
            className="custom-package-btn"
          >
            Đăng ký ngay
          </Button>
        </div>
      ]}
    >
      {/* Header với icon và tag */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '32px', color: config.color }}>
            {config.icon}
          </div>
          <Title level={3} style={{ margin: 0, color: '#262626' }}>
            {name}
          </Title>
          <Tag color={config.tagColor} style={{ fontSize: '12px', fontWeight: 600 }}>
            {type}
          </Tag>
        </Space>
      </div>

      {/* Mô tả */}
      <Paragraph 
        style={{ 
          textAlign: 'center',
          color: '#595959',
          marginBottom: '20px',
          minHeight: '48px'
        }}
        ellipsis={{ rows: 2, tooltip: description }}
      >
        {description}
      </Paragraph>

      <Divider style={{ margin: '16px 0' }} />

      {/* Thông tin giá và thời hạn */}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <DollarOutlined style={{ color: config.color }} />
            <Text strong>Giá:</Text>
          </Space>
          <Title level={4} style={{ margin: 0, color: config.color }}>
            {typeof price === 'number' && !isNaN(price)
              ? price.toLocaleString('vi-VN') + ' VNĐ'
              : 'Chưa cập nhật'}
          </Title>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CalendarOutlined style={{ color: config.color }} />
            <Text strong>Thời hạn:</Text>
          </Space>
          <Text style={{ fontSize: '16px', fontWeight: 500 }}>
            {duration}
          </Text>
        </div>
      </Space>
      <style>{`
        .custom-package-btn {
          background: ${config.color} !important;
          border-color: ${config.color} !important;
          color: #fff !important;
        }
        .custom-package-btn:hover, .custom-package-btn:focus {
          filter: brightness(0.92);
        }
        .ant-card-actions {
          background: transparent !important;
          border-top: none !important;
        }
      `}</style>
    </Card>
  );
};

export default ServicePackageCard;