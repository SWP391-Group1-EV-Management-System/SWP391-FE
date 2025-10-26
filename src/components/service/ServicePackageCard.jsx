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
  isDisabled = false, // ← THÊM PROP MỚI
  onSubscribe 
}) => {
  
  // default colors and icon
  const greenColor = '#0bb46b';
  const neutralColor = '#595959';
  const disabledColor = '#999';
  const icon = <PoweroffOutlined style={{ color: isDisabled ? disabledColor : greenColor }} />;
  const buttonType = 'default';

  const handleSubscribe = () => {
    if (onSubscribe && !isDisabled && !isActive) {
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
      hoverable={!isDisabled} // ← Disable hover khi disabled
      className="service-package-card"
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: isActive ? `2px solid ${greenColor}` : `2px solid #e5e7eb`,
        height: '100%',
        opacity: isDisabled ? 0.6 : 1, // ← Làm mờ khi disabled
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, opacity 0.2s ease'
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
            disabled={isActive || isDisabled} // ← Disable khi active hoặc disabled
            style={{
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '20px',
              background: isActive ? '#f0f0f0' : isDisabled ? '#e8e8e8' : greenColor,
              borderColor: isActive ? '#d9d9d9' : isDisabled ? '#d9d9d9' : greenColor,
              color: isActive || isDisabled ? '#999' : '#fff',
              boxShadow: 'none',
              width: '100%',
              margin: 0,
              cursor: isActive || isDisabled ? 'not-allowed' : 'pointer'
            }}
            className="custom-package-btn"
          >
            {isActive ? 'Đang sử dụng' : isDisabled ? 'Không khả dụng' : 'Đăng ký ngay'}
          </Button>
        </div>
      ]}
    >
      {/* Header với icon và tag */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '30px', color: isDisabled ? disabledColor : neutralColor }}>
            {icon}
          </div>
          <Title level={4} style={{ margin: 0, color: isDisabled ? disabledColor : '#000' }}>
            {packageName}
          </Title>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
            {isActive && (
              <>
                <Tag color="green" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Đang sử dụng
                </Tag>
                <Tag color="success" style={{ fontSize: 12 }}>Kích hoạt</Tag>
              </>
            )}
            {isDisabled && !isActive && (
              <Tag color="default" style={{ fontSize: '12px', fontWeight: 600 }}>
                Không khả dụng
              </Tag>
            )}
            {!isActive && !isDisabled && (
              <Tag color="default" style={{ fontSize: '12px', fontWeight: 600 }}>
                {type || 'Gói'}
              </Tag>
            )}
          </div>
        </Space>
      </div>

      {/* Mô tả */}
      <Paragraph 
        style={{ 
          textAlign: 'left',
          color: isDisabled ? disabledColor : '#333',
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
            <DollarOutlined style={{ color: isDisabled ? disabledColor : neutralColor }} />
            <Text strong style={{ color: isDisabled ? disabledColor : '#000' }}>Giá:</Text>
          </Space>
          <Text strong style={{ color: isDisabled ? disabledColor : '#000', fontSize: 16 }}>
            {formattedPrice}
          </Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CalendarOutlined style={{ color: isDisabled ? disabledColor : neutralColor }} />
            <Text strong style={{ color: isDisabled ? disabledColor : '#000' }}>Hạn dùng:</Text>
          </Space>
          <Text style={{ fontSize: '14px', fontWeight: 500, color: isDisabled ? disabledColor : '#000' }}>
            {durationText}
          </Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <PoweroffOutlined style={{ color: isDisabled ? disabledColor : neutralColor }} />
            <Text strong style={{ color: isDisabled ? disabledColor : '#000' }}>Hạn mức:</Text>
          </Space>
          <Text style={{ fontSize: '14px', fontWeight: 500, color: isDisabled ? disabledColor : '#000' }}>
            {quota ?? 'Không giới hạn'}
          </Text>
        </div>
      </Space>

      <style>{`
        .custom-package-btn {
          box-shadow: none !important;
        }
        .custom-package-btn:hover:not(:disabled), .custom-package-btn:focus:not(:disabled) {
          filter: brightness(0.94);
        }
        .service-package-card:not([style*="cursor: not-allowed"]):hover {
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