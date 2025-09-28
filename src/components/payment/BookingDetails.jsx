import React from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/BookingDetails.css';

const BookingDetails = ({ reservationData, peakHourSurcharge, calculateTotal }) => {
  return (
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
  );
};

export default BookingDetails;