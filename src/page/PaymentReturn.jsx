import React, { useEffect, useState } from 'react';
import { Result, Button, Spin, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const PaymentReturn = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({});

  useEffect(() => {
    // Get payment result from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const resultCode = urlParams.get('resultCode');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');
    const orderInfo = urlParams.get('orderInfo');
    const message = urlParams.get('message');

    setPaymentInfo({
      orderId,
      amount,
      orderInfo,
      message
    });

    // Check if payment was successful
    if (resultCode === '0') {
      setPaymentStatus('success');
    } else {
      setPaymentStatus('failed');
    }

    setLoading(false);
  }, []);

  const handleBackToHome = () => {
    window.location.href = '/app/home';
  };

  const handleViewPackages = () => {
    window.location.href = '/app/packages';
  };

  const handleViewHistory = () => {
    window.location.href = '/app/history';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Check if this is a package payment
  const isPackagePayment = paymentInfo.orderId?.startsWith('PKG_');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f0f2f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <Card style={{ maxWidth: 600, width: '100%' }}>
        {paymentStatus === 'success' ? (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            status="success"
            title={
              isPackagePayment 
                ? "Đăng ký gói dịch vụ thành công!" 
                : "Thanh toán thành công!"
            }
            subTitle={
              <div>
                <p>Mã đơn hàng: <strong>{paymentInfo.orderId}</strong></p>
                <p>Số tiền: <strong>{parseInt(paymentInfo.amount || 0).toLocaleString('vi-VN')} VNĐ</strong></p>
                {paymentInfo.orderInfo && <p>{paymentInfo.orderInfo}</p>}
                {isPackagePayment && (
                  <p style={{ color: '#52c41a', marginTop: 12 }}>
                    Gói dịch vụ của bạn đã được kích hoạt!
                  </p>
                )}
              </div>
            }
            extra={[
              <Button type="primary" key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>,
              isPackagePayment ? (
                <Button key="packages" onClick={handleViewPackages}>
                  Xem gói dịch vụ
                </Button>
              ) : (
                <Button key="history" onClick={handleViewHistory}>
                  Lịch sử
                </Button>
              )
            ]}
          />
        ) : (
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            status="error"
            title={
              isPackagePayment 
                ? "Đăng ký gói dịch vụ thất bại" 
                : "Thanh toán thất bại"
            }
            subTitle={
              <div>
                <p>Mã đơn hàng: <strong>{paymentInfo.orderId}</strong></p>
                <p style={{ color: '#ff4d4f' }}>
                  {paymentInfo.message || 'Giao dịch không thành công. Vui lòng thử lại!'}
                </p>
              </div>
            }
            extra={[
              <Button type="primary" key="retry" onClick={handleViewPackages}>
                Thử lại
              </Button>,
              <Button key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentReturn;