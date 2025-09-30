import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import PaymentHeader from '../components/payment/PaymentHeader';
import BookingDetails from '../components/payment/BookingDetails';
import PaymentMethods from '../components/payment/PaymentMethods';
import ConfirmModal from '../components/payment/ConfirmModal';
import StatusPages from '../components/payment/StatusPages';
import { usePayment } from '../hooks/usePayment';
import { fetchChargingSessionForPayment } from '../services/paymentService';
import { getUserBankCards } from '../utils/paymentUtils';
import '../assets/styles/payment/PaymentPage.css';

const PaymentPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const [reservationData, setReservationData] = useState(null);
  const [userBankCards, setUserBankCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Loading state
  if (loading) {
    return (
      <div className="payment-container">
        <PaymentHeader />
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
        <PaymentHeader />
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
        <PaymentHeader />
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
      <PaymentHeader />
      
      <div className="main-content">
        <div className="payment-grid">
          <div className="grid-item">
            <BookingDetails
              reservationData={reservationData}
              peakHourSurcharge={payment?.peakHourSurcharge || 0}
              calculateTotal={payment?.calculateTotal || (() => 0)}
            />
          </div>
          
          <div className="grid-item">
            <PaymentMethods
              selectedMethod={payment?.selectedMethod}
              selectedCard={payment?.selectedCard}
              handleMethodSelect={payment?.handleMethodSelect}
              handleCardSelect={payment?.handleCardSelect}
              handlePayClick={payment?.handlePayClick}
              savedCards={userBankCards}
              sessionData={reservationData}
              userId={userId}
              // Add these props for synchronization
              selectedServicePackage={payment?.selectedServicePackage}
              setSelectedServicePackage={payment?.setSelectedServicePackage}
              calculateFreeKwhDiscount={payment?.calculateFreeKwhDiscount}
              calculatePercentDiscount={payment?.calculatePercentDiscount}
              calculateDiscountedPrice={payment?.calculateDiscountedPrice}
            />
          </div>
        </div>
      </div>

      {payment?.showConfirmModal && (
        <ConfirmModal
          selectedMethod={payment.selectedMethod}
          selectedCard={payment.selectedCard}
          selectedServicePackage={payment.selectedServicePackage}
          calculateFinalAmount={payment.calculateFinalAmount}
          handleConfirmPayment={payment.handleConfirmPayment}
          handleCloseModal={payment.handleCloseModal}
          reservationData={reservationData}
          savedCards={userBankCards}
          sessionData={reservationData}
          // Add calculate functions for PaymentSummary
          calculateFreeKwhDiscount={payment.calculateFreeKwhDiscount}
          calculatePercentDiscount={payment.calculatePercentDiscount}
          calculateDiscountedPrice={payment.calculateDiscountedPrice}
        />
      )}
    </div>
  );
};

export default PaymentPage;