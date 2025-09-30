import React from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import PaymentSummary from './PaymentSummary'; // Sử dụng component có sẵn
import '../../assets/styles/payment/ConfirmModal.css';

const ConfirmModal = ({
  selectedMethod,
  selectedCard,
  selectedServicePackage,
  calculateFinalAmount,
  handleConfirmPayment,
  handleCloseModal,
  reservationData,
  savedCards,
  sessionData,
  // Add these props for PaymentSummary
  calculateFreeKwhDiscount,
  calculatePercentDiscount,
  calculateDiscountedPrice
}) => {
  // Validate required functions
  if (!handleConfirmPayment || !handleCloseModal) {
    console.error('Missing required functions in ConfirmModal');
    return null;
  }

  const data = sessionData || reservationData;
  const finalAmount = calculateFinalAmount ? calculateFinalAmount() : data?.totalAmount || 0;

  // Safe data access
  const safeData = {
    station: data?.station || 'Không xác định',
    address: data?.address || 'Không xác định', 
    time: data?.time || 'Không xác định',
    kwh: data?.kwh || 0,
    chargingCost: data?.chargingCost || 0,
    serviceFee: data?.serviceFee || 0,
    tax: data?.tax || 0,
    totalAmount: data?.totalAmount || 0,
    chargingFeePerKwh: data?.chargingFeePerKwh || 0
  };

  // Get payment method display name
  const getPaymentMethodDisplay = () => {
    switch (selectedMethod) {
      case 'credit-card':
        if (selectedCard) {
          const cardIcon = selectedCard.type === 'Visa' ? '💳' : '🏧';
          return (
            <div className="payment-method-card">
              <span className="payment-icon">{cardIcon}</span>
              <div className="payment-info">
                <div className="payment-type">Thẻ ngân hàng</div>
                <div className="payment-detail">{selectedCard.number} • {selectedCard.bank}</div>
              </div>
            </div>
          );
        }
        return `💳 Thẻ ngân hàng (Chưa chọn thẻ)`;
      case 'cash':
        return `💵 Thanh toán tiền mặt`;
      default:
        return 'Chưa chọn phương thức';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content enhanced-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">🔒</div>
          <h2 className="modal-title">Xác nhận thanh toán</h2>
          <p className="modal-description">
            Vui lòng kiểm tra kỹ thông tin trước khi thanh toán
          </p>
          <button className="modal-close" onClick={handleCloseModal}>✕</button>
        </div>

        <div className="modal-details-enhanced">
          {/* Session Info */}
          <div className="modal-section">
            <h4>⚡ Thông tin phiên sạc</h4>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Trạm:</span>
              <span className="modal-detail-value">{safeData.station}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Địa chỉ:</span>
              <span className="modal-detail-value">{safeData.address}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Thời gian:</span>
              <span className="modal-detail-value">{safeData.time}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Năng lượng:</span>
              <span className="modal-detail-value">{safeData.kwh} kWh</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="modal-section">
            <h4>💳 Phương thức thanh toán</h4>
            <div className="payment-method-display">
              {getPaymentMethodDisplay()}
            </div>
          </div>

          {/* Service Package Info */}
          {selectedServicePackage && (
            <div className="modal-section">
              <h4>🎁 Gói dịch vụ áp dụng</h4>
              <div className="package-info">
                <div className="package-name-modal">{selectedServicePackage.name}</div>
                <div className="package-description-modal">{selectedServicePackage.description}</div>
                <div className="package-benefits">
                  {selectedServicePackage.remainingKwh > 0 && (
                    <div className="benefit-item">
                      ✓ Sử dụng {Math.min(selectedServicePackage.remainingKwh, safeData.kwh)} kWh miễn phí
                    </div>
                  )}
                  {selectedServicePackage.discountPercent > 0 && (
                    <div className="benefit-item">
                      ✓ Giảm {selectedServicePackage.discountPercent}% tổng hóa đơn
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SỬ DỤNG PaymentSummary COMPONENT CÓ SẴN */}
          <div className="modal-section summary-section">
            <h4>💰 Chi tiết thanh toán</h4>
            <PaymentSummary
              chargingCost={safeData.chargingCost}
              serviceFee={safeData.serviceFee}
              tax={safeData.tax}
              kwh={safeData.kwh}
              totalAmount={safeData.totalAmount}
              selectedServicePackage={selectedServicePackage}
              calculateFreeKwhDiscount={calculateFreeKwhDiscount}
              calculatePercentDiscount={calculatePercentDiscount}
              calculateDiscountedPrice={calculateDiscountedPrice}
            />
            
            {/* Chỉ thêm savings highlight riêng cho modal */}
            {selectedServicePackage && calculateDiscountedPrice && calculateDiscountedPrice() < safeData.totalAmount && (
              <div className="savings-highlight">
                <span className="savings-icon">🎉</span>
                <span className="savings-text">
                  Bạn tiết kiệm được {formatCurrency(safeData.totalAmount - calculateDiscountedPrice())}!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={handleCloseModal}>
            Hủy
          </button>
          <button 
            className="modal-btn confirm" 
            onClick={handleConfirmPayment}
            disabled={!selectedMethod}
          >
            Xác nhận thanh toán {formatCurrency(finalAmount)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;