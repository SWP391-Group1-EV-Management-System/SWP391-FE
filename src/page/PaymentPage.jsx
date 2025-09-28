import React, { useState, useEffect } from 'react';
import { CiDollar } from "react-icons/ci";
import './../assets/styles/PaymentPage.css';

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success
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
    tax: 20500
  };

  const savedCards = [
    { id: 1, number: '**** **** **** 1234', type: 'Vietcombank', expiry: '12/25' },
    { id: 2, number: '**** **** **** 5678', type: 'Techcombank', expiry: '03/26' },
  ];

  // Calculate peak hour surcharge (6-9 AM and 5-8 PM)
  useEffect(() => {
    const currentHour = new Date().getHours();
    if ((currentHour >= 6 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20)) {
      setPeakHourSurcharge(reservationData.chargingCost * 0.15); // 15% surcharge
    } else {
      setPeakHourSurcharge(0);
    }
  }, []);

  // Calculate total cost
  const calculateTotal = () => {
    return reservationData.chargingCost + 
           reservationData.serviceFee + 
           reservationData.tax + 
           peakHourSurcharge;
  };

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
      // Simulate sending invoice email
      if (sendInvoiceEmail) {
        console.log(`Sending invoice to ${customerEmail}`);
      }
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
        <div className="status-card success-page">
          <div className="status-icon success">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="status-title">Thanh toán thành công!</h2>
          <p className="status-description">Cảm ơn bạn đã sử dụng dịch vụ EcoCharge</p>
          
          <div className="success-details">
            <div className="success-section">
              <h4>Thông tin giao dịch</h4>
              <div className="status-detail-row">
                <span className="status-detail-label">Mã giao dịch:</span>
                <span className="status-detail-value">#EC{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="status-detail-row">
                <span className="status-detail-label">Trạm sạc:</span>
                <span className="status-detail-value">{reservationData.station}</span>
              </div>
              <div className="status-detail-row">
                <span className="status-detail-label">Thời gian:</span>
                <span className="status-detail-value">{new Date().toLocaleString('vi-VN')}</span>
              </div>
              <div className="status-detail-row">
                <span className="status-detail-label">Phương thức:</span>
                <span className="status-detail-value">{paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ ngân hàng'}</span>
              </div>
            </div>

            <div className="success-section total-section">
              <div className="status-detail-row total-row">
                <span className="status-detail-label">Tổng thanh toán:</span>
                <span className="status-detail-value total-amount">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {sendInvoiceEmail && (
            <div className="email-notification">
              <div className="email-icon">📧</div>
              <p>Hóa đơn điện tử đã được gửi đến: <strong>{customerEmail}</strong></p>
            </div>
          )}

          <div className="success-actions">
            <button className="status-btn secondary">
              Tải hóa đơn PDF
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="status-btn primary"
            >
              Hoàn tất
            </button>
          </div>
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
            <p className="status-amount">{formatCurrency(calculateTotal())}</p>
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
          <p className="status-description">Đang kết nối với ngân hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <header className="payment-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
            <CiDollar />
            </div>
            <h1 className="logo-text">EcoCharge Payment</h1>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="payment-grid">
          <div>
            <div className="payment-card">
              <h2 className="card-title">Chi tiết đặt chỗ</h2>
              
              <div className="station-info">
                <h3 className="station-name">{reservationData.station}</h3>
                <p className="station-address">{reservationData.district} • {reservationData.address}</p>
              </div>

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
                  
                  {peakHourSurcharge > 0 && (
                    <div className="cost-item surcharge">
                      <span className="cost-label">Phí phụ thu (Giờ cao điểm)</span>
                      <span className="cost-value">{formatCurrency(peakHourSurcharge)}</span>
                    </div>
                  )}

                  <div className="cost-total">
                    <div className="cost-item">
                      <span className="cost-label">Tổng cộng</span>
                      <span className="cost-value">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="payment-card">
              <h3 className="card-title">Chọn phương thức thanh toán</h3>
              
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

              <div className="email-invoice-section">
                <label className="email-invoice-label">
                  <input
                    type="checkbox"
                    checked={sendInvoiceEmail}
                    onChange={(e) => setSendInvoiceEmail(e.target.checked)}
                  />
                  <span>Gửi hóa đơn qua email</span>
                </label>
                {sendInvoiceEmail && (
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="email-input"
                  />
                )}
              </div>

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

              <button
                onClick={handleConfirmPayment}
                disabled={!paymentMethod || (paymentMethod === 'card' && !selectedCard)}
                className={`confirm-btn ${
                  !paymentMethod || (paymentMethod === 'card' && !selectedCard)
                    ? 'disabled'
                    : 'enabled'
                }`}
              >
                Xác nhận thanh toán {formatCurrency(calculateTotal())}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content enhanced-modal">
            <div className="modal-header">
              <div className="modal-icon">
                <span>💳</span>
              </div>
              <h3 className="modal-title">Xác nhận thanh toán</h3>
              <p className="modal-description">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
            </div>

            <div className="modal-details-enhanced">
              <div className="modal-section">
                <h4>Thông tin thanh toán</h4>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Trạm sạc:</span>
                  <span className="modal-detail-value">{reservationData.station}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Thẻ:</span>
                  <span className="modal-detail-value">
                    {savedCards.find(card => card.id === selectedCard)?.number}
                  </span>
                </div>
              </div>

              <div className="modal-section total-section">
                <div className="modal-detail-row total-row">
                  <span className="modal-detail-label">Tổng thanh toán:</span>
                  <span className="modal-detail-value total-amount">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {sendInvoiceEmail && (
                <div className="modal-section email-section">
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Gửi hóa đơn đen:</span>
                    <span className="modal-detail-value">{customerEmail}</span>
                  </div>
                </div>
              )}
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
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;