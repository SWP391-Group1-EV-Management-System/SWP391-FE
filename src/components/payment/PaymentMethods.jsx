import React, { useState } from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import ServicePackageSelection from './ServicePackageSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import CardSelection from './CardSelection';
import PaymentSummary from './PaymentSummary';
import '../../assets/styles/payment/PaymentMethods.css';

const PaymentMethods = ({ 
  selectedMethod, 
  selectedCard, 
  handleMethodSelect, 
  handleCardSelect, 
  handlePayClick,
  savedCards,
  sessionData,
  userId,
  // Add these props from usePayment hook
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
      selectedCard,
      selectedServicePackage,
      originalAmount: totalAmount,
      finalAmount: calculateDiscountedPrice ? calculateDiscountedPrice() : totalAmount,
      sessionData: safeSessionData
    };
    
    if (handlePayClick) {
      handlePayClick(paymentData);
    }
  };

  return (
    <div className="payment-card">
      <h2 className="card-title">Phương thức thanh toán</h2>
      
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

      {/* Card Selection - Only show for credit-card method */}
      {selectedMethod === 'credit-card' && (
        <CardSelection 
          savedCards={savedCards}
          selectedCard={selectedCard}
          handleCardSelect={handleCardSelect}
          userId={userId}
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
      <button
        className={`confirm-btn ${selectedMethod ? 'enabled' : 'disabled'}`}
        disabled={!selectedMethod}
        onClick={handlePayButtonClick}
      >
        {selectedMethod ? 
          `Thanh toán ${formatCurrency(calculateDiscountedPrice ? calculateDiscountedPrice() : totalAmount)}` : 
          'Chọn phương thức thanh toán'
        }
      </button>
    </div>
  );
};

export default PaymentMethods;