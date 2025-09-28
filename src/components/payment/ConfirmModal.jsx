import React from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/ConfirmModal.css';

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  handleCardPayment,
  reservationData,
  savedCards,
  selectedCard,
  calculateTotal,
  sendInvoiceEmail,
  customerEmail
}) => {
  if (!showConfirmModal) return null;

  return (
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
                <span className="modal-detail-label">Gửi hóa đơn đến:</span>
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
  );
};

export default ConfirmModal;