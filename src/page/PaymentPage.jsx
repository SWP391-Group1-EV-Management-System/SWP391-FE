import React from 'react';
import PaymentHeader from '../components/payment/PaymentHeader';
import BookingDetails from '../components/payment/BookingDetails';
import PaymentMethods from '../components/payment/PaymentMethods';
import ConfirmModal from '../components/payment/ConfirmModal';
import StatusPages from '../components/payment/StatusPages';
import { usePayment } from '../hooks/usePayment';
import { savedCards, reservationData } from '../utils/paymentUtils';
import '../assets/styles/payment/PaymentPage.css';

const PaymentPage = () => {
  const payment = usePayment(reservationData);

  // Render status pages
  if (payment.paymentStatus === 'success') {
    return <StatusPages.Success {...payment} reservationData={reservationData} />;
  }

  if (payment.cashPaymentPending) {
    return <StatusPages.Pending {...payment} />;
  }

  if (payment.paymentStatus === 'processing') {
    return <StatusPages.Processing />;
  }

  return (
    <div className="payment-container">
      <PaymentHeader />

      <main className="main-content">
        <div className="payment-grid">
          <div>
            <BookingDetails
              reservationData={reservationData}
              peakHourSurcharge={payment.peakHourSurcharge}
              calculateTotal={payment.calculateTotal}
            />
          </div>

          <div>
            <PaymentMethods
              {...payment}
              savedCards={savedCards}
            />
          </div>
        </div>
      </main>

      {payment.showConfirmModal && (
        <ConfirmModal
          {...payment}
          reservationData={reservationData}
          savedCards={savedCards}
        />
      )}
    </div>
  );
};

export default PaymentPage;