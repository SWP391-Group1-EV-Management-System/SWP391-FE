import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import PaymentHeader from '../components/payment/PaymentHeader';
import BookingDetails from '../components/payment/BookingDetails';
import PaymentMethods from '../components/payment/PaymentMethods';
import ConfirmModal from '../components/payment/ConfirmModal';
import StatusPages from '../components/payment/StatusPages';
import { usePayment } from '../hooks/usePayment';
import { fetchChargingSessionForPayment } from '../services/paymentService';
import { savedCards } from '../utils/paymentUtils';
import '../assets/styles/payment/PaymentPage.css';

const PaymentPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const [reservationData, setReservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const sessionIdFromState = location.state?.sessionId;
  const finalSessionId = sessionId || sessionIdFromState || 'CS001';

  const payment = usePayment(reservationData);

  // Debug logs
  console.log('PaymentPage Debug:', {
    sessionId,
    sessionIdFromState,
    finalSessionId,
    reservationData,
    loading,
    error,
    payment
  });

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading session data for ID:', finalSessionId);
        const sessionData = await fetchChargingSessionForPayment(finalSessionId);
        console.log('Session data loaded:', sessionData);
        
        setReservationData(sessionData);
      } catch (err) {
        console.error('Error loading session data:', err);
        setError(err.message || 'Không thể tải thông tin phiên sạc');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [finalSessionId]);

  // Debug: Thêm fallback UI để test
  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="payment-container" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <PaymentHeader />
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p>Đang tải thông tin thanh toán cho phiên: {finalSessionId}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="payment-container" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <PaymentHeader />
        <div className="main-content">
          <div className="alert alert-danger text-center">
            <h5>Có lỗi xảy ra</h5>
            <p>{error}</p>
            <p><small>Session ID: {finalSessionId}</small></p>
            <button 
              className="btn btn-primary me-2"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.history.back()}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reservationData) {
    console.log('No reservationData, showing fallback');
    return (
      <div className="payment-container" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <PaymentHeader />
        <div className="main-content">
          <div className="alert alert-warning text-center">
            <h5>Đang xử lý...</h5>
            <p>Vui lòng đợi trong giây lát</p>
            <p><small>Debug: reservationData is null</small></p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Payment status check:', {
    paymentStatus: payment?.paymentStatus,
    cashPaymentPending: payment?.cashPaymentPending
  });

  // Render status pages
  if (payment?.paymentStatus === 'success') {
    console.log('Rendering success page');
    return <StatusPages.Success {...payment} reservationData={reservationData} />;
  }

  if (payment?.cashPaymentPending) {
    console.log('Rendering pending page');
    return <StatusPages.Pending {...payment} />;
  }

  if (payment?.paymentStatus === 'processing') {
    console.log('Rendering processing page');
    return <StatusPages.Processing />;
  }

  console.log('Rendering main payment page');

  // Thêm fallback nếu components không load được
  try {
    return (
      <div className="payment-container" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <PaymentHeader />

        <main className="main-content" style={{ padding: '20px' }}>
          <div className="payment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3>Booking Details</h3>
              <BookingDetails
                reservationData={reservationData}
                peakHourSurcharge={payment?.peakHourSurcharge || 0}
                calculateTotal={payment?.calculateTotal || (() => 0)}
              />
            </div>

            <div>
              <h3>Payment Methods</h3>
              <PaymentMethods
                selectedMethod={payment?.selectedMethod}
                selectedCard={payment?.selectedCard}
                handleMethodSelect={payment?.handleMethodSelect}
                handleCardSelect={payment?.handleCardSelect}
                handlePayClick={payment?.handlePayClick}
                savedCards={savedCards}
                sessionData={reservationData}
              />
            </div>
          </div>
        </main>

        {payment?.showConfirmModal && (
          <ConfirmModal
            {...payment}
            reservationData={reservationData}
            savedCards={savedCards}
            sessionData={reservationData}
          />
        )}
      </div>
    );
  } catch (renderError) {
    console.error('Render error:', renderError);
    return (
      <div className="payment-container" style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
        <h1>Payment Page</h1>
        <div className="alert alert-danger">
          <h5>Render Error</h5>
          <p>{renderError.message}</p>
          <pre>{JSON.stringify(reservationData, null, 2)}</pre>
        </div>
      </div>
    );
  }
};

export default PaymentPage;