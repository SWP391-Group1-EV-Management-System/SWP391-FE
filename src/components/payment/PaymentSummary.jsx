import React from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/PaymentSummary.css';

const PaymentSummary = ({ 
  chargingCost,
  serviceFee,
  tax,
  kwh,
  totalAmount,
  selectedServicePackage,
  calculateFreeKwhDiscount,
  calculatePercentDiscount,
  calculateDiscountedPrice
}) => {
  return (
    <div className="payment-summary">
      <h3 className="summary-title">Chi tiết thanh toán</h3>
      <div className="summary-content">
        <div className="summary-item">
          <span>Phí sạc ({kwh} kWh):</span>
          <span>{formatCurrency(chargingCost)}</span>
        </div>

        <div className="summary-item">
          <span>Phí dịch vụ (5%):</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>

        <div className="summary-item">
          <span>Thuế VAT (10%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        {/* Service Package Discounts */}
        {selectedServicePackage && (
          <div className="summary-discount">
            <div className="discount-title">
              🎁 Áp dụng: {selectedServicePackage.name}
            </div>
            
            {calculateFreeKwhDiscount() > 0 && (
              <div className="summary-item discount">
                <span>- Miễn phí kWh:</span>
                <span>-{formatCurrency(calculateFreeKwhDiscount())}</span>
              </div>
            )}
            
            {calculatePercentDiscount() > 0 && (
              <div className="summary-item discount">
                <span>- Giảm giá {selectedServicePackage.discountPercent}%:</span>
                <span>-{formatCurrency(calculatePercentDiscount())}</span>
              </div>
            )}
          </div>
        )}

        {/* Total */}
        <div className="summary-total">
          <div className="summary-item total">
            <span>Tổng thanh toán:</span>
            <span className={selectedServicePackage ? 'discounted' : ''}>
              {formatCurrency(calculateDiscountedPrice())}
              {selectedServicePackage && (
                <span className="original-price">
                  {formatCurrency(totalAmount)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;