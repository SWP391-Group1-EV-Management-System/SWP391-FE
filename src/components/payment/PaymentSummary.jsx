import React from 'react';
import { Card, Typography, Space, Divider, Tag, Alert } from 'antd';
import { DollarOutlined, GiftOutlined, PercentageOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/paymentUtils';

const { Title, Text } = Typography;

const PaymentSummary = ({ 
  chargingCost,
  serviceFee,
  tax,
  kwh,
  totalAmount,
  selectedServicePackage,
  calculateFreeKwhDiscount,
  calculatePercentDiscount,
  calculateDiscountedPrice
}) => {
  // ✅ Debug logging
  console.log('PaymentSummary received:', {
    selectedServicePackage,
    chargingCost,
    serviceFee,
    tax,
    totalAmount,
    kwh
  });

  const freeKwhDiscount = calculateFreeKwhDiscount ? calculateFreeKwhDiscount() : 0;
  const percentDiscount = calculatePercentDiscount ? calculatePercentDiscount() : 0;
  const finalPrice = calculateDiscountedPrice ? calculateDiscountedPrice() : totalAmount;
  const hasDiscount = freeKwhDiscount > 0 || percentDiscount > 0;

  // ✅ Debug logging cho discounts
  console.log('PaymentSummary discounts:', {
    freeKwhDiscount,
    percentDiscount,
    finalPrice,
    hasDiscount,
    selectedServicePackage
  });

  return (
    <Card
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        marginTop: '1rem'
      }}
      styles={{
        body: { padding: '1.5rem' }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Title 
          level={5} 
          style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: '#374151',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <DollarOutlined style={{ color: '#10b981' }} />
          Chi tiết thanh toán
        </Title>

        {/* Cost Items */}
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Charging Cost */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <Text style={{ 
              color: '#6b7280', 
              fontSize: '1.6rem', 
              fontWeight: 500 
            }}>
              Phí sạc ({kwh} kWh)
            </Text>
            <Text style={{ 
              color: '#111827', 
              fontWeight: 600, 
              fontSize: '1.7rem' 
            }}>
              {formatCurrency(chargingCost)}
            </Text>
          </div>

          {/* Service Fee */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <Text style={{ 
              color: '#6b7280', 
              fontSize: '1.6rem', 
              fontWeight: 500 
            }}>
              Phí dịch vụ (5%)
            </Text>
            <Text style={{ 
              color: '#111827', 
              fontWeight: 600, 
              fontSize: '1.7rem' 
            }}>
              {formatCurrency(serviceFee)}
            </Text>
          </div>

          {/* Tax */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: hasDiscount ? '1px solid #f3f4f6' : 'none'
          }}>
            <Text style={{ 
              color: '#6b7280', 
              fontSize: '1.6rem', 
              fontWeight: 500 
            }}>
              Thuế VAT (10%)
            </Text>
            <Text style={{ 
              color: '#111827', 
              fontWeight: 600, 
              fontSize: '1.7rem' 
            }}>
              {formatCurrency(tax)}
            </Text>
          </div>

          {/* Service Package Discounts */}
          {hasDiscount && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '0.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <GiftOutlined style={{ color: '#10b981', fontSize: '2rem' }} />
                <Text style={{ 
                  color: '#059669', 
                  fontWeight: 600, 
                  fontSize: '1.6rem' 
                }}>
                  Ưu đãi được áp dụng
                </Text>
                <Tag 
                  color="green" 
                  style={{ 
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {selectedServicePackage?.name || 'Premium'}
                </Tag>
              </div>

              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* Free kWh Discount */}
                {freeKwhDiscount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0'
                  }}>
                    <Text style={{ 
                      color: '#059669', 
                      fontSize: '1.4rem', 
                      fontWeight: 500 
                    }}>
                      ⚡ Miễn phí 5 kWh đầu tiên
                    </Text>
                    <Text style={{ 
                      color: '#059669', 
                      fontWeight: 600, 
                      fontSize: '1.4rem' 
                    }}>
                      -{formatCurrency(freeKwhDiscount)}
                    </Text>
                  </div>
                )}

                {/* Percent Discount */}
                {percentDiscount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0'
                  }}>
                    <Text style={{ 
                      color: '#059669', 
                      fontSize: '1.4rem', 
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <PercentageOutlined /> Giảm giá {selectedServicePackage?.discountPercent || 15}%
                    </Text>
                    <Text style={{ 
                      color: '#059669', 
                      fontWeight: 600, 
                      fontSize: '1.4rem' 
                    }}>
                      -{formatCurrency(percentDiscount)}
                    </Text>
                  </div>
                )}
              </Space>
            </div>
          )}

          {/* Divider */}
          <Divider style={{ 
            margin: '0.5rem 0', 
            borderColor: '#10b981', 
            borderWidth: '2px' 
          }} />

          {/* Total - ✅ Chỉ hiển thị giá cuối */}
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={{ 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '2rem' 
            }}>
              TỔNG THANH TOÁN
            </Text>
            {/* ✅ Chỉ hiển thị giá cuối, không hiển thị giá gốc */}
            <Text style={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1.8rem'
            }}>
              {formatCurrency(finalPrice)}
            </Text>
          </div>

          {/* Savings Alert - ✅ Chỉ hiển thị khi có discount */}
          {hasDiscount && (
            <Text 
                  delete 
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 500
              }}
            />
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default PaymentSummary;