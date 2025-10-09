import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { Row, Col, message } from 'antd';
import PageHeader from '../components/PageHeader';
import BookingDetails from '../components/payment/BookingDetails';
import PaymentMethods from '../components/payment/PaymentMethods';
import StatusPages from '../components/payment/StatusPages';
import { usePayment } from '../hooks/usePayment';
import { fetchChargingSessionForPayment } from '../services/paymentService';
import { getUserBankCards } from '../utils/paymentUtils';
import { DollarOutlined } from '@ant-design/icons';
import '../assets/styles/payment/PaymentPage.css';

const PaymentPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const [reservationData, setReservationData] = useState(null);
  const [userBankCards, setUserBankCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedServicePackage, setSelectedServicePackage] = useState(null); // ✅ Đổi từ 'basic' thành null
  const [sessionData, setSessionData] = useState(null);

  const sessionIdFromState = location.state?.sessionId;
  const finalSessionId = sessionId || sessionIdFromState || 'CS001';
  const userId = 'USR0001';
  const payment = usePayment(reservationData);

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading payment data...');
        
        const [sessionData, bankCards] = await Promise.all([
          fetchChargingSessionForPayment(finalSessionId),
          getUserBankCards(userId)
        ]);
        
        console.log('Payment data loaded:', { sessionData, bankCards });
        
        setReservationData(sessionData);
        setUserBankCards(bankCards);
      } catch (err) {
        console.error('Error loading payment data:', err);
        setError(err.message || 'Không thể tải thông tin thanh toán');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [finalSessionId, userId]);

  // Mock data - thay thế bằng API call thực tế
  useEffect(() => {
    // Simulate API call
    const mockSessionData = {
      station: 'Trạm sạc EVN HCMC',
      district: 'Quận 1',
      address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      chargingType: 'AC Type 2',
      date: '15/03/2024',
      time: '14:30 - 16:00',
      vehicle: 'VinFast VF8',
      kwh: 25.5,
      chargingCost: 200000,
      serviceFee: 20000,
      tax: 22000,
      totalAmount: 242000
    };
    setSessionData(mockSessionData);
  }, []);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handlePayClick = (paymentData) => {
    console.log('Payment data:', paymentData);
    
    if (paymentData.selectedMethod === 'cash') {
      message.success({
        content: '✅ Đã xác nhận thanh toán tiền mặt. Vui lòng đến trạm sạc để hoàn tất giao dịch.',
        duration: 5,
        style: { fontSize: '1rem' }
      });
    } else if (paymentData.selectedMethod === 'e-wallet') {
      message.loading({
        content: '🔄 Đang tạo mã QR thanh toán...',
        duration: 2,
        style: { fontSize: '1rem' }
      });
      
      setTimeout(() => {
        message.success({
          content: '📱 Mã QR đã được tạo. Vui lòng quét mã để hoàn tất thanh toán.',
          duration: 5,
          style: { fontSize: '1rem' }
        });
      }, 2000);
    }
  };

  // ✅ Sửa logic discount calculations
  const calculateFreeKwhDiscount = () => {
    console.log('calculateFreeKwhDiscount - selectedServicePackage:', selectedServicePackage);
    
    // ✅ Kiểm tra object thay vì string
    if (selectedServicePackage?.discountPercent && sessionData) {
      const freeKwh = Math.min(5, sessionData.kwh);
      const pricePerKwh = sessionData.chargingCost / sessionData.kwh;
      const discount = freeKwh * pricePerKwh;
      
      console.log('Free kWh discount calculated:', {
        freeKwh,
        pricePerKwh,
        discount,
        selectedServicePackage
      });
      
      return discount;
    }
    return 0;
  };

  const calculatePercentDiscount = () => {
    console.log('calculatePercentDiscount - selectedServicePackage:', selectedServicePackage);
    
    // ✅ Kiểm tra object và discountPercent
    if (selectedServicePackage?.discountPercent && sessionData) {
      const discount = sessionData.totalAmount * (selectedServicePackage.discountPercent / 100);
      
      console.log('Percent discount calculated:', {
        totalAmount: sessionData.totalAmount,
        discountPercent: selectedServicePackage.discountPercent,
        discount,
        selectedServicePackage
      });
      
      return discount;
    }
    return 0;
  };

  const calculateDiscountedPrice = () => {
    if (!sessionData) return 0;
    
    const freeKwhDiscount = calculateFreeKwhDiscount();
    const percentDiscount = calculatePercentDiscount();
    const finalPrice = sessionData.totalAmount - freeKwhDiscount - percentDiscount;
    
    console.log('Final price calculated:', {
      originalTotal: sessionData.totalAmount,
      freeKwhDiscount,
      percentDiscount,
      finalPrice,
      selectedServicePackage
    });
    
    return finalPrice;
  };

  // Loading state
  if (loading) {
    return (
      <div className="payment-container">
        <PageHeader
          title="EcoCharge Payment"
          icon={<DollarOutlined />}
          customStyle={{
            marginTop: '6rem',
            level: 1,
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="payment-container">
        <PageHeader
          title="EcoCharge Payment"
          icon={<DollarOutlined />}
          customStyle={{
            marginTop: '6rem',
            level: 1,
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        />
        <div className="error-container">
          <div className="error-card">
            <h2 className="error-title">Có lỗi xảy ra</h2>
            <p className="error-message">{error}</p>
            <small className="error-detail">Session ID: {finalSessionId}</small>
            <div className="error-actions">
              <button className="btn-primary" onClick={() => window.location.reload()}>
                Thử lại
              </button>
              <button className="btn-secondary" onClick={() => window.history.back()}>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!reservationData) {
    return (
      <div className="payment-container">
        <PageHeader
          title="EcoCharge Payment"
          icon={<DollarOutlined />}
          customStyle={{
            marginTop: '6rem',
            level: 1,
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  // Render status pages
  if (payment?.paymentStatus === 'success') {
    return <StatusPages.Success {...payment} reservationData={reservationData} />;
  }

  if (payment?.cashPaymentPending) {
    return <StatusPages.Pending {...payment} />;
  }

  if (payment?.paymentStatus === 'processing') {
    return <StatusPages.Processing />;
  }

  // Main payment page
  return (
    <div className="payment-container">
      <PageHeader
        title="EcoCharge Payment"
        icon={<DollarOutlined />}
        customStyle={{
          marginTop: '6rem',
          level: 1,
          fontSize: '2.5rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      />
      
      <div className="main-content">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={12}>
            <BookingDetails 
              reservationData={sessionData}
              calculateTotal={calculateDiscountedPrice}
            />
          </Col>
          
          <Col xs={24} lg={12}>
            <PaymentMethods
              selectedMethod={selectedMethod}
              handleMethodSelect={handleMethodSelect}
              handlePayClick={handlePayClick}
              sessionData={sessionData}
              selectedServicePackage={selectedServicePackage}
              setSelectedServicePackage={setSelectedServicePackage}
              calculateFreeKwhDiscount={calculateFreeKwhDiscount}
              calculatePercentDiscount={calculatePercentDiscount}
              calculateDiscountedPrice={calculateDiscountedPrice}
              userId={userId} // ✅ Thêm userId prop
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PaymentPage;