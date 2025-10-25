import React from 'react';
import { Card, Button, Tag, Typography, Space, Divider } from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  PoweroffOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * Component hiển thị thông tin gói dịch vụ dưới dạng card cho Driver
 * Sử dụng Ant Design Card component
 */
const ServicePackageCard = ({ 
  packageId,
  packageName, 
  description, 
  price, 
  billingCycle, 
  unit,
  quota,
  type,
  isActive = false,
  onSubscribe 
}) => {
  
  // default colors and icon (remove per-package config)
  const greenColor = '#0bb46b';
  const neutralColor = '#595959';
  const icon = <PoweroffOutlined style={{ color: greenColor }} />;
  const buttonType = 'default';

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe({ packageId, packageName, price, billingCycle, unit, quota, type });
    }
  };

  const formattedPrice = typeof price === 'number' && !isNaN(price)
    ? price.toLocaleString('vi-VN') + ' VNĐ'
    : 'Chưa cập nhật';

  const durationText = (() => {
    if (!billingCycle) return 'Không xác định';
    return `Hiệu lực ${billingCycle} tháng`;
  })();

  return (
    <Card
      hoverable
      className="service-package-card"
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: `2px solid #e5e7eb`,
        height: '100%',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease'
      }}
      styles={{ body: { padding: '18px' } }}
      actions={[
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 8px' }}>
          <Button 
            key="subscribe"
            type={buttonType}
            size="middle"
            block
            onClick={handleSubscribe}
            disabled={!!isActive}
            style={{
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '20px',
              background: isActive ? '#f0f0f0' : greenColor,
              borderColor: isActive ? '#d9d9d9' : greenColor,
              color: isActive ? '#000' : '#fff',
              boxShadow: 'none',
              width: '100%',
              margin: 0,
            }}
            className="custom-package-btn"
          >
            {isActive ? 'Đang sử dụng' : 'Đăng ký ngay'}
          </Button>
        </div>
      ]}
    >
      {/* Header với icon và tag */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '30px', color: neutralColor }}>
            {icon}
          </div>
          <Title level={4} style={{ margin: 0, color: '#000' }}>
            {packageName}
          </Title>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
            <Tag color={isActive ? 'green' : 'default'} style={{ fontSize: '12px', fontWeight: 600 }}>
              {isActive ? 'Đang sử dụng' : (type || 'Gói')}
            </Tag>
            {isActive && (
              <Tag color="success" style={{ fontSize: 12 }}>Kích hoạt</Tag>
            )}
          </div>
        </Space>
      </div>

      {/* Mô tả */}
      <Paragraph 
        style={{ 
          textAlign: 'left',
          color: '#333',
          marginBottom: '14px',
          minHeight: '48px'
        }}
        ellipsis={{ rows: 3, tooltip: description }}
      >
        {description}
      </Paragraph>

      <Divider style={{ margin: '12px 0' }} />

      {/* Thông tin giá, thời hạn và quota */}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <DollarOutlined style={{ color: neutralColor }} />
            <Text strong>Giá:</Text>
          </Space>
          <Text strong style={{ color: '#000', fontSize: 16 }}>{formattedPrice}</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CalendarOutlined style={{ color: neutralColor }} />
            <Text strong>Hạn dùng:</Text>
          </Space>
          <Text style={{ fontSize: '14px', fontWeight: 500 }}>{durationText}</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <PoweroffOutlined style={{ color: neutralColor }} />
            <Text strong>Hạn mức sử dụng gói:</Text>
          </Space>
          <Text style={{ fontSize: '14px', fontWeight: 500 }}>{quota ?? 'Không giới hạn'}</Text>
        </div>
      </Space>

      <style>{`
        .custom-package-btn {
          box-shadow: none !important;
        }
        .custom-package-btn:hover, .custom-package-btn:focus {
          filter: brightness(0.94);
        }
        .service-package-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 30px rgba(11,135,91,0.12);
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