import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/paymentUtils';

export const usePayment = (reservationData) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedServicePackage, setSelectedServicePackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [cashPaymentPending, setCashPaymentPending] = useState(false);

  // Calculate functions
  const calculateFreeKwhDiscount = () => {
    if (!selectedServicePackage || !reservationData?.kwh) return 0;
    const freeKwh = Math.min(selectedServicePackage.remainingKwh, reservationData.kwh);
    return freeKwh * (reservationData.chargingFeePerKwh || 0);
  };

  const calculatePercentDiscount = () => {
    if (!selectedServicePackage || !reservationData?.totalAmount) return 0;
    const baseAmount = reservationData.totalAmount - calculateFreeKwhDiscount();
    return Math.round(baseAmount * selectedServicePackage.discountPercent / 100);
  };

  const calculateDiscountedPrice = () => {
    if (!reservationData?.totalAmount) return 0;
    if (!selectedServicePackage) return reservationData.totalAmount;
    return reservationData.totalAmount - calculateFreeKwhDiscount() - calculatePercentDiscount();
  };

  const calculateFinalAmount = () => {
    return calculateDiscountedPrice();
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (method === 'cash') {
      setSelectedCard(null); // Clear card selection for cash
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    if (!selectedMethod) {
      setSelectedMethod('credit-card'); // Auto select credit card method
    }
  };

  const handlePayClick = (paymentData) => {
    console.log('Payment data:', paymentData);
    
    // Update selected service package if passed
    if (paymentData?.selectedServicePackage) {
      setSelectedServicePackage(paymentData.selectedServicePackage);
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setPaymentStatus('processing');
      setShowConfirmModal(false);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedMethod === 'cash') {
        setCashPaymentPending(true);
        setPaymentStatus('pending');
      } else {
        setPaymentStatus('success');
      }
    } catch (error) {
      setPaymentStatus('error');
      console.error('Payment error:', error);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  return {
    selectedMethod,
    selectedCard,
    selectedServicePackage,
    setSelectedServicePackage, // Export này để PaymentMethods có thể update
    showConfirmModal,
    paymentStatus,
    cashPaymentPending,
    handleMethodSelect,
    handleCardSelect,
    handlePayClick,
    handleConfirmPayment,
    handleCloseModal,
    calculateFinalAmount,
    calculateFreeKwhDiscount,
    calculatePercentDiscount,
    calculateDiscountedPrice
  };
};