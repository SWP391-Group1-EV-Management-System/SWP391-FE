import React from 'react';
import { Card, Typography, Space, Button, Alert } from 'antd';
import { CreditCardOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/paymentUtils';
import ServicePackageSelection from './ServicePackageSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import PaymentSummary from './PaymentSummary';

const { Title } = Typography;

const PaymentMethods = ({ 
  selectedMethod, 
  handleMethodSelect, 
  handlePayClick,
  sessionData,
  userId,
  selectedServicePackage,
  setSelectedServicePackage,
  calculateFreeKwhDiscount,
  calculatePercentDiscount,
  calculateDiscountedPrice
}) => {
  // Safe data access
  const safeSessionData = sessionData || {};
  const chargingCost = safeSessionData.chargingCost || 0;
  const serviceFee = safeSessionData.serviceFee || 0;
  const tax = safeSessionData.tax || 0;
  const totalAmount = safeSessionData.totalAmount || (chargingCost + serviceFee + tax);
  const kwh = safeSessionData.kwh || 0;

  // Handle pay button click
  const handlePayButtonClick = () => {
    if (!selectedMethod) return;
    
    const paymentData = {
      selectedMethod,
      selectedServicePackage,
      originalAmount: totalAmount,
      finalAmount: calculateDiscountedPrice ? calculateDiscountedPrice() : totalAmount,
      sessionData: safeSessionData
    };
    
    if (handlePayClick) {
      handlePayClick(paymentData);
    }
  };

  // Get button text based on selected method
  const getButtonText = () => {
    if (!selectedMethod) {
      return 'Chọn phương thức thanh toán';
    }

    const finalAmount = calculateDiscountedPrice ? calculateDiscountedPrice() : totalAmount;
    
    if (selectedMethod === 'cash') {
      return `Xác nhận thanh toán tiền mặt ${formatCurrency(finalAmount)}`;
    } else if (selectedMethod === 'e-wallet') {
      return `Tạo mã QR thanh toán ${formatCurrency(finalAmount)}`;
    }
    
    return `Thanh toán ${formatCurrency(finalAmount)}`;
  };

  return (
    <Card
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
      styles={{
        body: { padding: '1.5rem' }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Card Title */}
        <Title 
          level={4} 
          style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CreditCardOutlined />
          Phương thức thanh toán
        </Title>
        
        {/* Service Package Selection */}
        <ServicePackageSelection 
          selectedServicePackage={selectedServicePackage}
          setSelectedServicePackage={setSelectedServicePackage}
          userId={userId}
        />

        {/* Payment Methods */}
        <PaymentMethodSelection 
          selectedMethod={selectedMethod}
          handleMethodSelect={handleMethodSelect}
        />

        {/* Payment Method Info */}
        {selectedMethod && (
          <Alert
            message={
              selectedMethod === 'cash' 
                ? "💰 Thanh toán tiền mặt tại trạm sạc"
                : "📱 Quét mã QR để thanh toán qua ví điện tử"
            }
            description={
              selectedMethod === 'cash' 
                ? "Vui lòng chuẩn bị đủ tiền mặt và thanh toán trực tiếp tại trạm sạc"
                : "Sau khi xác nhận, bạn sẽ được chuyển đến trang quét mã QR để hoàn tất thanh toán"
            }
            type="info"
            showIcon={false}
            style={{
              background: selectedMethod === 'cash' ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${selectedMethod === 'cash' ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: '8px'
            }}
            icon={<InfoCircleOutlined style={{ 
              color: selectedMethod === 'cash' ? '#10b981' : '#3b82f6' 
            }} />}
          />
        )}

        {/* Payment Summary */}
        {totalAmount > 0 && (
          <PaymentSummary 
            chargingCost={chargingCost}
            serviceFee={serviceFee}
            tax={tax}
            kwh={kwh}
            totalAmount={totalAmount}
            selectedServicePackage={selectedServicePackage}
            calculateFreeKwhDiscount={calculateFreeKwhDiscount}
            calculatePercentDiscount={calculatePercentDiscount}
            calculateDiscountedPrice={calculateDiscountedPrice}
          />
        )}

        {/* Confirm Button */}
        <Button
          type="primary"
          size="large"
          disabled={!selectedMethod}
          onClick={handlePayButtonClick}
          style={{
            width: '100%',
            height: 'auto',
            padding: '0.75rem 1.5rem',
            fontSize: '2rem',
            fontWeight: 600,
            borderRadius: '8px',
            background: selectedMethod ? '#10b981' : '#d1d5db',
            borderColor: selectedMethod ? '#10b981' : '#d1d5db',
            color: selectedMethod ? '#ffffff' : '#9ca3af',
            cursor: selectedMethod ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            if (selectedMethod) {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.borderColor = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMethod) {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.borderColor = '#10b981';
            }
          }}
        >
          {getButtonText()}
        </Button>
      </Space>
    </Card>
  );
};

export default PaymentMethods;