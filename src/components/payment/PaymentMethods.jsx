import React from 'react';
import CardSelection from './CardSelection';
import AddCardForm from './AddCardForm';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/PaymentMethods.css';

const PaymentMethods = ({
  paymentMethod,
  handlePaymentMethodSelect,
  savedCards,
  selectedCard,
  handleCardSelect,
  showAddCard,
  handleAddCard,
  newCard,
  setNewCard,
  handleSaveCard,
  handleConfirmPayment,
  calculateTotal,
  userServicePackage // Thêm prop gói dịch vụ
}) => {
  return (
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

      {/* Thay thế phần email bằng gói dịch vụ */}
      <div className="service-package-section">
        <h4 className="service-package-title">Gói dịch vụ hiện tại</h4>
        <div className="service-package-info">
          {userServicePackage ? (
            <>
              <div className="package-detail">
                <span className="package-label">Tên gói:</span>
                <span className="package-value">{userServicePackage.name}</span>
              </div>
              <div className="package-detail">
                <span className="package-label">ID gói:</span>
                <span className="package-value">#{userServicePackage.id}</span>
              </div>
              <div className="package-detail">
                <span className="package-label">Giảm giá:</span>
                <span className="package-value discount">{userServicePackage.discount}%</span>
              </div>
              <div className="package-detail">
                <span className="package-label">Lượt sử dụng còn lại:</span>
                <span className="package-value">{userServicePackage.remainingUsage}/{userServicePackage.totalUsage}</span>
              </div>
            </>
          ) : (
            <div className="no-package-info">
              <span className="no-package-text">📦 Chưa đăng ký gói dịch vụ</span>
              <p className="no-package-note">Bạn có thể thanh toán theo giá lẻ</p>
            </div>
          )}
        </div>
      </div>

      {paymentMethod === 'card' && (
        <CardSelection
          savedCards={savedCards}
          selectedCard={selectedCard}
          handleCardSelect={handleCardSelect}
          handleAddCard={handleAddCard}
        />
      )}

      {showAddCard && (
        <AddCardForm
          newCard={newCard}
          setNewCard={setNewCard}
          handleSaveCard={handleSaveCard}
        />
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
  );
};

export default PaymentMethods;