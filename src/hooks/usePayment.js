import { useState, useEffect } from 'react';

export const usePayment = (reservationData) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [cashPaymentPending, setCashPaymentPending] = useState(false);
  const [peakHourSurcharge, setPeakHourSurcharge] = useState(0);
  const [sendInvoiceEmail, setSendInvoiceEmail] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('customer@example.com');
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  // Calculate peak hour surcharge
  useEffect(() => {
    const currentHour = new Date().getHours();
    if ((currentHour >= 6 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20)) {
      setPeakHourSurcharge(reservationData.chargingCost * 0.15);
    } else {
      setPeakHourSurcharge(0);
    }
  }, [reservationData.chargingCost]);

  // Simulate staff confirmation for cash payment
  useEffect(() => {
    if (cashPaymentPending) {
      const timer = setTimeout(() => {
        setPaymentStatus('success');
        setCashPaymentPending(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [cashPaymentPending]);

  // Calculate total cost
  const calculateTotal = () => {
    return reservationData.chargingCost + 
           reservationData.serviceFee + 
           reservationData.tax + 
           peakHourSurcharge;
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setSelectedCard('');
    setShowAddCard(false);
  };

  const handleCardSelect = (cardId) => {
    setSelectedCard(cardId);
  };

  const handleAddCard = () => {
    setShowAddCard(true);
  };

  const handleSaveCard = () => {
    setShowAddCard(false);
    setNewCard({ cardNumber: '', expiryDate: '', cvv: '', cardHolder: '' });
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash') {
      setCashPaymentPending(true);
    } else if (paymentMethod === 'card' && selectedCard) {
      setShowConfirmModal(true);
    }
  };

  const handleCardPayment = () => {
    setShowConfirmModal(false);
    setPaymentStatus('processing');
    
    setTimeout(() => {
      setPaymentStatus('success');
      if (sendInvoiceEmail) {
        console.log(`Sending invoice to ${customerEmail}`);
      }
    }, 3000);
  };

  return {
    // States
    paymentMethod,
    selectedCard,
    showAddCard,
    showConfirmModal,
    paymentStatus,
    cashPaymentPending,
    peakHourSurcharge,
    sendInvoiceEmail,
    customerEmail,
    newCard,
    // Setters
    setSendInvoiceEmail,
    setCustomerEmail,
    setNewCard,
    setShowConfirmModal,
    // Handlers
    handlePaymentMethodSelect,
    handleCardSelect,
    handleAddCard,
    handleSaveCard,
    handleConfirmPayment,
    handleCardPayment,
    calculateTotal
  };
};