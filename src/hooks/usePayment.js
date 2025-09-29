import { useState, useEffect } from 'react';

export const usePayment = (reservationData) => {
  console.log('usePayment called with:', reservationData);
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [cashPaymentPending, setCashPaymentPending] = useState(false);
  const [selectedServicePackage, setSelectedServicePackage] = useState(null);

  // Reset states when reservationData changes
  useEffect(() => {
    if (reservationData) {
      console.log('usePayment: reservationData loaded, resetting states');
      setSelectedMethod('');
      setSelectedCard(null);
      setShowConfirmModal(false);
      setPaymentStatus('');
      setCashPaymentPending(false);
      setSelectedServicePackage(null);
    }
  }, [reservationData]);

  // Safe calculation functions
  const calculateTotal = () => {
    if (!reservationData) {
      console.log('calculateTotal: no reservationData');
      return 0;
    }
    
    const chargingCost = reservationData.chargingCost || 0;
    const serviceFee = reservationData.serviceFee || 0;
    const tax = reservationData.tax || 0;
    const peakHourSurcharge = calculatePeakHourSurcharge();
    
    const total = chargingCost + serviceFee + tax + peakHourSurcharge;
    console.log('calculateTotal:', { chargingCost, serviceFee, tax, peakHourSurcharge, total });
    
    return total;
  };

  const calculatePeakHourSurcharge = () => {
    if (!reservationData?.startTime) {
      console.log('calculatePeakHourSurcharge: no startTime');
      return 0;
    }
    
    const startHour = new Date(reservationData.startTime).getHours();
    const isPeakHour = (startHour >= 7 && startHour <= 9) || (startHour >= 17 && startHour <= 19);
    
    console.log('calculatePeakHourSurcharge:', { startHour, isPeakHour });
    
    if (isPeakHour && reservationData.chargingCost) {
      const surcharge = Math.round(reservationData.chargingCost * 0.15);
      console.log('Peak hour surcharge:', surcharge);
      return surcharge;
    }
    
    return 0;
  };

  // Event handlers
  const handleMethodSelect = (method) => {
    console.log('handleMethodSelect called with:', method);
    setSelectedMethod(method);
  };

  const handleCardSelect = (card) => {
    console.log('handleCardSelect called with:', card);
    setSelectedCard(card);
  };

  const handlePayClick = (servicePackage = null) => {
    console.log('handlePayClick called', { 
      selectedMethod, 
      servicePackage 
    });
    
    if (!selectedMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    // Store service package for later use
    if (servicePackage) {
      setSelectedServicePackage(servicePackage);
    }

    if (selectedMethod === 'cash') {
      console.log('Setting cash payment pending');
      setCashPaymentPending(true);
    } else {
      console.log('Showing confirm modal');
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    console.log('handleConfirmPayment called');
    setShowConfirmModal(false);
    setPaymentStatus('processing');
    
    try {
      // TODO: Integrate with actual payment service
      // const paymentResult = await createPayment(
      //   reservationData.session_id,
      //   selectedMethod,
      //   calculateFinalAmount(),
      //   selectedServicePackage
      // );
      
      // Simulate payment processing
      setTimeout(() => {
        console.log('Payment processing completed');
        setPaymentStatus('success');
        
        // TODO: Update service package usage if applied
        if (selectedServicePackage) {
          console.log('Updating service package usage:', selectedServicePackage);
          // updateServicePackageUsage(selectedServicePackage, reservationData.kwh);
        }
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
    }
  };

  const handleCloseModal = () => {
    console.log('handleCloseModal called');
    setShowConfirmModal(false);
  };

  const calculateFinalAmount = () => {
    let amount = calculateTotal();
    
    if (selectedServicePackage && reservationData) {
      // Apply free kWh
      if (selectedServicePackage.remainingKwh > 0) {
        const freeKwh = Math.min(selectedServicePackage.remainingKwh, reservationData.kwh);
        const freeAmount = freeKwh * reservationData.chargingFeePerKwh;
        amount = Math.max(0, amount - freeAmount);
      }
      
      // Apply percentage discount
      if (selectedServicePackage.discountPercent > 0) {
        amount = amount * (100 - selectedServicePackage.discountPercent) / 100;
      }
    }
    
    return Math.round(amount);
  };

  const result = {
    selectedMethod,
    selectedCard,
    showConfirmModal,
    paymentStatus,
    cashPaymentPending,
    selectedServicePackage,
    calculateTotal,
    calculateFinalAmount,
    peakHourSurcharge: calculatePeakHourSurcharge(),
    handleMethodSelect,
    handleCardSelect,
    handlePayClick,
    handleConfirmPayment,
    handleCloseModal,
    // Additional states for debugging
    isReady: !!reservationData
  };

  console.log('usePayment returning:', result);
  return result;
};