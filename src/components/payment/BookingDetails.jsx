import React from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/BookingDetails.css';

const BookingDetails = ({ 
  reservationData, 
  peakHourSurcharge = 0, 
  calculateTotal 
}) => {
  // Debug log
  console.log('BookingDetails received data:', reservationData);

  // Safe access to reservation data
  const safeData = {
    station: reservationData?.station || 'Đang tải...',
    district: reservationData?.district || 'Đang tải...',
    address: reservationData?.address || 'Đang tải...',
    chargingType: reservationData?.chargingType || 'Đang tải...',
    date: reservationData?.date || 'Đang tải...',
    time: reservationData?.time || 'Đang tải...',
    vehicle: reservationData?.vehicle || 'Đang tải...',
    kwh: reservationData?.kwh || 0,
    chargingCost: reservationData?.chargingCost || 0,
    serviceFee: reservationData?.serviceFee || 0,
    tax: reservationData?.tax || 0,
    totalAmount: reservationData?.totalAmount || 0,
    chargingFeePerKwh: reservationData?.chargingFeePerKwh || 0
  };

  return (
    <div className="booking-card">
      <h2 className="card-title">Chi tiết đặt chỗ</h2>
      
      {/* Station Information */}
      <div className="booking-section">
        <h3 className="section-title">🏢 Thông tin trạm sạc</h3>
        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">Trạm sạc:</span>
            <span className="detail-value">{safeData.station}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Khu vực:</span>
            <span className="detail-value">{safeData.district}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Địa chỉ:</span>
            <span className="detail-value">{safeData.address}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Loại sạc:</span>
            <span className="detail-value">{safeData.chargingType}</span>
          </div>
        </div>
      </div>

      {/* Charging Session Details */}
      <div className="booking-section">
        <h3 className="section-title">⚡ Thông tin phiên sạc</h3>
        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">Ngày sạc:</span>
            <span className="detail-value">{safeData.date}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Thời gian:</span>
            <span className="detail-value">{safeData.time}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Xe điện:</span>
            <span className="detail-value">{safeData.vehicle}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Năng lượng:</span>
            <span className="detail-value energy">{safeData.kwh} kWh</span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="booking-section cost-section">
        <h3 className="section-title">💰 Chi phí</h3>
        <div className="cost-details">
          <div className="cost-row">
            <span className="cost-label">CHI PHÍ SẠC ({safeData.kwh} KWH)</span>
            <span className="cost-value">{formatCurrency(safeData.chargingCost)}</span>
          </div>
          
          <div className="cost-row">
            <span className="cost-label">PHÍ DỊCH VỤ</span>
            <span className="cost-value">{formatCurrency(safeData.serviceFee)}</span>
          </div>
          
          <div className="cost-row">
            <span className="cost-label">THUẾ</span>
            <span className="cost-value">{formatCurrency(safeData.tax)}</span>
          </div>

          {peakHourSurcharge > 0 && (
            <div className="cost-row surcharge">
              <span className="cost-label">PHÍ GIỜ CAO ĐIỂM</span>
              <span className="cost-value">{formatCurrency(peakHourSurcharge)}</span>
            </div>
          )}
          
          <div className="cost-divider"></div>
          
          <div className="cost-row total">
            <span className="cost-label">TỔNG CỘNG</span>
            <span className="cost-value total-amount">
              {formatCurrency(calculateTotal ? calculateTotal() : safeData.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="booking-note">
        <p className="note-text">
          💡 Thông tin này được tự động tính toán dựa trên phiên sạc đã hoàn thành
        </p>
      </div>
    </div>
  );
};

export default BookingDetails;