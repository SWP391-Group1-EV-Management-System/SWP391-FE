import React from 'react';
import { CiDollar } from "react-icons/ci";
import '../../assets/styles/payment/PaymentHeader.css';

const PaymentHeader = () => {
  return (
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
  );
};

export default PaymentHeader;