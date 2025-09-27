import React, { useState, useEffect } from 'react';
import '../assets/styles/PaymentPage.css';

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success
  const [cashPaymentPending, setCashPaymentPending] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  const reservationData = {
    station: 'EcoCharge Station #42',
    district: 'District 1',
    address: '123 Green Street, Ho Chi Minh City',
    chargingType: 'Fast Charging (50kW DC)',
    date: 'May 15, 2023',
    time: '10:00 AM - 11:30 AM (1.5 hours)',
    vehicle: 'Tesla Model 3 (ABC-1234)',
    chargingCost: 180000,
    serviceFee: 25000,
    tax: 20500,
    total: 225500
  };

  const savedCards = [
    { id: 1, number: '**** **** **** 1234', type: 'Vietcombank', expiry: '12/25' },
    { id: 2, number: '**** **** **** 5678', type: 'Techcombank', expiry: '03/26' },
  ];

  // Simulate staff confirmation for cash payment
  useEffect(() => {
    if (cashPaymentPending) {
      const timer = setTimeout(() => {
        setPaymentStatus('success');
        setCashPaymentPending(false);
      }, 5000); // 5 seconds simulation
      return () => clearTimeout(timer);
    }
  }, [cashPaymentPending]);

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
    // Here you would typically save the card to backend
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
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon success">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="status-title">Thanh toán thành công!</h2>
          <p className="status-description">Giao dịch của bạn đã được xử lý thành công</p>
          
          <div className="status-details success">
            <div className="status-detail-row">
              <span className="status-detail-label">Trạm sạc:</span>
              <span className="status-detail-value">{reservationData.station}</span>
            </div>
            <div className="status-detail-row">
              <span className="status-detail-label">Tổng tiền:</span>
              <span className="status-detail-value success">{formatCurrency(reservationData.total)}</span>
            </div>
            <div className="status-detail-row">
              <span className="status-detail-label">Phương thức:</span>
              <span className="status-detail-value">{paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ ngân hàng'}</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="status-btn"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  if (cashPaymentPending) {
    return (
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon pending">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="status-title">Đang chờ xác nhận thanh toán</h2>
          <p className="status-description">Vui lòng liên hệ nhân viên để xác nhận thanh toán tiền mặt</p>
          
          <div className="status-details pending">
            <p className="status-detail-label" style={{textAlign: 'center', marginBottom: '0.5rem'}}>Số tiền cần thanh toán:</p>
            <p className="status-amount">{formatCurrency(reservationData.total)}</p>
          </div>

          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Đang chờ xác nhận...</span>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon processing">
            <div className="processing-spinner"></div>
          </div>
          <h2 className="status-title">Đang xử lý thanh toán</h2>
          <p className="status-description">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* Header */}
      <header className="payment-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <span>E</span>
            </div>
            <h1 className="logo-text">EcoCharge Payment</h1>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="payment-grid">
          {/* Left - Reservation Details */}
          <div>
            <div className="payment-card">
              <h2 className="card-title">Chi tiết đặt chỗ</h2>
              
              {/* Station Info */}
              <div className="station-info">
                <h3 className="station-name">{reservationData.station}</h3>
                <p className="station-address">{reservationData.district} • {reservationData.address}</p>
              </div>

              {/* Charging Details */}
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-header">
                    <span className="detail-icon" style={{color: '#10b981'}}>⚡</span>
                    <span className="detail-label">Loại sạc</span>
                  </div>
                  <p className="detail-value">{reservationData.chargingType}</p>
                </div>
                
                <div className="detail-item">
                  <div className="detail-header">
                    <span className="detail-icon" style={{color: '#3b82f6'}}>📅</span>
                    <span className="detail-label">Ngày</span>
                  </div>
                  <p className="detail-value">{reservationData.date}</p>
                </div>
                
                <div className="detail-item">
                  <div className="detail-header">
                    <span className="detail-icon" style={{color: '#8b5cf6'}}>⏰</span>
                    <span className="detail-label">Thời gian</span>
                  </div>
                  <p className="detail-value">{reservationData.time}</p>
                </div>
                
                <div className="detail-item">
                  <div className="detail-header">
                    <span className="detail-icon" style={{color: '#f97316'}}>🚗</span>
                    <span className="detail-label">Xe</span>
                  </div>
                  <p className="detail-value">{reservationData.vehicle}</p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="cost-section">
                <h3 className="cost-title">Chi phí</h3>
                <div className="cost-list">
                  <div className="cost-item">
                    <span className="cost-label">Chi phí sạc</span>
                    <span className="cost-value">{formatCurrency(reservationData.chargingCost)}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Phí dịch vụ</span>
                    <span className="cost-value">{formatCurrency(reservationData.serviceFee)}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Thuế</span>
                    <span className="cost-value">{formatCurrency(reservationData.tax)}</span>
                  </div>
                  <div className="cost-total">
                    <div className="cost-item">
                      <span className="cost-label">Tổng cộng</span>
                      <span className="cost-value">{formatCurrency(reservationData.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Payment Method */}
          <div>
            <div className="payment-card">
              <h3 className="card-title">Chọn phương thức thanh toán</h3>
              
              {/* Payment Methods */}
              <div className="payment-methods">
                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  className={`payment-method-btn ${paymentMethod === 'cash' ? 'selected' : ''}`}
                >
                  <span className="payment-method-icon">💵</span>
                  <div className="payment-method-info">
                    <h4>Tiền mặt</h4>
                    <p>Thanh toán qua nhân viên</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('card')}
                  className={`payment-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
                >
                  <span className="payment-method-icon">💳</span>
                  <div className="payment-method-info">
                    <h4>Thẻ ngân hàng</h4>
                    <p>Visa, Mastercard</p>
                  </div>
                </button>
              </div>

              {/* Card Selection */}
              {paymentMethod === 'card' && (
                <div className="card-selection">
                  <h4 className="card-selection-title">Chọn thẻ</h4>
                  <div className="card-list">
                    {savedCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleCardSelect(card.id)}
                        className={`card-item ${selectedCard === card.id ? 'selected' : ''}`}
                      >
                        <div className="card-info">
                          <h5>{card.number}</h5>
                          <p>{card.type} • Hết hạn {card.expiry}</p>
                        </div>
                        <span className="card-icon">💳</span>
                      </button>
                    ))}
                    
                    <button onClick={handleAddCard} className="add-card-btn">
                      <span style={{fontSize: '1.25rem', marginRight: '0.5rem'}}>+</span>
                      Thêm thẻ mới
                    </button>
                  </div>
                </div>
              )}

              {/* Add Card Form */}
              {showAddCard && (
                <div className="add-card-form">
                  <h4 className="add-card-title">Thêm thẻ mới</h4>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Số thẻ"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                      className="form-input"
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={newCard.expiryDate}
                        onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                        className="form-input"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Tên chủ thẻ"
                      value={newCard.cardHolder}
                      onChange={(e) => setNewCard({...newCard, cardHolder: e.target.value})}
                      className="form-input"
                    />
                    <button onClick={handleSaveCard} className="save-card-btn">
                      Lưu thẻ
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Payment Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={!paymentMethod || (paymentMethod === 'card' && !selectedCard)}
                className={`confirm-btn ${
                  !paymentMethod || (paymentMethod === 'card' && !selectedCard)
                    ? 'disabled'
                    : 'enabled'
                }`}
              >
                Xác nhận thanh toán {formatCurrency(reservationData.total)}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">
                <span>💳</span>
              </div>
              <h3 className="modal-title">Xác nhận thanh toán</h3>
              <p className="modal-description">Bạn có chắc chắn muốn thanh toán?</p>
            </div>

            <div className="modal-details">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Số tiền:</span>
                <span className="modal-detail-value">{formatCurrency(reservationData.total)}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Thẻ:</span>
                <span className="modal-detail-value">
                  {savedCards.find(card => card.id === selectedCard)?.number}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="modal-btn cancel"
              >
                Hủy
              </button>
              <button
                onClick={handleCardPayment}
                className="modal-btn confirm"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;