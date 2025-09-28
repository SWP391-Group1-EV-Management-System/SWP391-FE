import React from 'react';
import CardSelection from './CardSelection';
import AddCardForm from './AddCardForm';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/PaymentMethods.css';

const PaymentMethods = ({
  paymentMethod,
  handlePaymentMethodSelect,
  sendInvoiceEmail,
  setSendInvoiceEmail,
  customerEmail,
  setCustomerEmail,
  savedCards,
  selectedCard,
  handleCardSelect,
  showAddCard,
  handleAddCard,
  newCard,
  setNewCard,
  handleSaveCard,
  handleConfirmPayment,
  calculateTotal
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