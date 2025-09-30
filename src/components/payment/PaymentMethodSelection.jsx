import React from 'react';
import '../../assets/styles/payment/PaymentMethodSelection.css';

const PaymentMethodSelection = ({ selectedMethod, handleMethodSelect }) => {
  return (
    <div className="payment-methods">
      <h3 className="payment-methods-title">Chọn phương thức thanh toán</h3>
      
      <button
        className={`payment-method-btn ${selectedMethod === 'credit-card' ? 'selected' : ''}`}
        onClick={() => handleMethodSelect('credit-card')}
      >
        <div className="payment-method-icon">💳</div>
        <div className="payment-method-info">
          <h4>Thanh toán ngân hàng</h4>
        </div>
      </button>

      <button
        className={`payment-method-btn ${selectedMethod === 'cash' ? 'selected' : ''}`}
        onClick={() => handleMethodSelect('cash')}
      >
        <div className="payment-method-icon">💵</div>
        <div className="payment-method-info">
          <h4>Thanh toán tiền mặt</h4>
          <p>Thanh toán trực tiếp tại trạm sạc</p>
        </div>
      </button>
    </div>
  );
};

export default PaymentMethodSelection;