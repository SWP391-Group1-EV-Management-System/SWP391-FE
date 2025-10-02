import React, { useState, useEffect } from 'react';
import { Radio, Typography, Space, Card, Tag, Alert, Spin, Progress } from 'antd';
import { GiftOutlined, CrownOutlined, ClockCircleOutlined, PercentageOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ServicePackageSelection = ({ 
  selectedServicePackage, 
  setSelectedServicePackage,
  userId 
}) => {
  const [userServicePackage, setUserServicePackage] = useState(null);
  const [loadingPackage, setLoadingPackage] = useState(true);

  useEffect(() => {
    const fetchUserServicePackage = async () => {
      try {
        setLoadingPackage(true);
        
        // Mock data - khách hàng chỉ có 1 gói đã đăng ký
        const mockPackage = {
          id: 'PKG001',
          name: 'Gói Premium',
          description: 'Giảm 15% tổng hóa đơn + 50kWh miễn phí',
          freeKwh: 50,
          remainingKwh: 35,
          discountPercent: 15,
          isActive: true,
          expiryDate: '2024-12-31'
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserServicePackage(mockPackage);
      } catch (error) {
        console.error('Error fetching service package:', error);
        setUserServicePackage(null);
      } finally {
        setLoadingPackage(false);
      }
    };

    fetchUserServicePackage();
  }, [userId]);

  if (loadingPackage) {
    return (
      <div>
        <Title 
          level={5} 
          style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <GiftOutlined style={{ color: '#10b981' }} />
          Gói dịch vụ
        </Title>
        
        <Card
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            textAlign: 'center'
          }}
          styles={{
            body: { padding: '2rem' }
          }}
        >
          <Spin size="large" />
          <Text style={{ 
            display: 'block', 
            marginTop: '1rem', 
            color: '#6b7280',
            fontSize: '2rem'
          }}>
            Đang tải gói dịch vụ...
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title 
        level={5} 
        style={{
          fontSize: '2rem',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <GiftOutlined style={{ color: '#10b981' }} />
        Gói dịch vụ
      </Title>
      
      <Radio.Group 
        value={selectedServicePackage?.id || 'no-package'} 
        onChange={(e) => {
          if (e.target.value === 'no-package') {
            setSelectedServicePackage(null);
          } else {
            setSelectedServicePackage(userServicePackage);
          }
        }}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* No Package Option */}
          <Radio 
            value="no-package"
            style={{
              width: '100%',
              margin: 0,
              padding: '1rem',
              border: `1px solid ${!selectedServicePackage ? '#10b981' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: !selectedServicePackage ? '#f0fdf4' : '#ffffff',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (selectedServicePackage) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedServicePackage) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%'
            }}>
              <div style={{
                fontSize: '2rem',
                color: !selectedServicePackage ? '#10b981' : '#6b7280'
              }}>
                💰
              </div>
              <div>
                <Text strong style={{ fontSize: '1.9rem', color: '#111827' }}>
                  Không sử dụng gói
                </Text>
                <br />
                <Text style={{ fontSize: '1.4rem', color: '#6b7280' }}>
                  Thanh toán theo giá gốc
                </Text>
              </div>
            </div>
          </Radio>

          {/* User's Package Option */}
          {userServicePackage ? (
            <Radio 
              value={userServicePackage.id}
              style={{
                width: '100%',
                margin: 0,
                padding: '1.25rem',
                border: `1px solid ${selectedServicePackage?.id === userServicePackage.id ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: selectedServicePackage?.id === userServicePackage.id ? '#f0fdf4' : '#ffffff',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                if (selectedServicePackage?.id !== userServicePackage.id) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedServicePackage?.id !== userServicePackage.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              <div style={{ width: '100%' }}>
                {/* Package Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CrownOutlined style={{ 
                      fontSize: '2rem', 
                      color: selectedServicePackage?.id === userServicePackage.id ? '#10b981' : '#f59e0b' 
                    }} />
                    <div>
                      <Text strong style={{ fontSize: '1.8rem', color: '#111827' }}>
                        {userServicePackage.name}
                      </Text>
                      <br />
                      <Text style={{ fontSize: '1.4rem', color: '#6b7280' }}>
                        {userServicePackage.description}
                      </Text>
                    </div>
                  </div>
                  
                  <Tag 
                    color="gold" 
                    style={{ 
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    PREMIUM
                  </Tag>
                </div>

                {/* Package Details */}
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {/* Free kWh Progress */}
                  <Card
                    size="small"
                    style={{
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px'
                    }}
                    styles={{
                      body: { padding: '0.75rem' }
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <Text style={{ 
                        color: '#92400e', 
                        fontWeight: 600, 
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <ThunderboltOutlined /> kWh miễn phí
                      </Text>
                      <Text style={{ color: '#92400e', fontWeight: 600, fontSize: '1.5rem' }}>
                        {userServicePackage.remainingKwh}/{userServicePackage.freeKwh} kWh
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((userServicePackage.remainingKwh / userServicePackage.freeKwh) * 100)}
                      strokeColor="#f59e0b"
                      trailColor="#fef3c7"
                      size="small"
                      showInfo={false}
                    />
                  </Card>

                  {/* Package Benefits */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <Text style={{ 
                      color: '#6b7280', 
                      fontSize: '1.5rem', 
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <PercentageOutlined /> Giảm giá
                    </Text>
                    <Tag color="green" style={{ fontWeight: 600 }}>
                      {userServicePackage.discountPercent}%
                    </Tag>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0'
                  }}>
                    <Text style={{ 
                      color: '#6b7280', 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <ClockCircleOutlined /> Hết hạn
                    </Text>
                    <Text style={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>
                      {userServicePackage.expiryDate}
                    </Text>
                  </div>
                </Space>
              </div>
            </Radio>
          ) : (
            <Alert
              message="Chưa có gói dịch vụ"
              description="Bạn chưa đăng ký gói dịch vụ nào. Liên hệ để đăng ký gói dịch vụ ưu đãi."
              type="info"
              showIcon
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px'
              }}
              action={
                <Text style={{ color: '#3b82f6', fontWeight: 500, cursor: 'pointer' }}>
                  Tìm hiểu thêm
                </Text>
              }
            />
          )}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default ServicePackageSelection;