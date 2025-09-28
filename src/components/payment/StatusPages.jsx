import React from 'react';
import { formatCurrency } from '../../utils/paymentUtils';
import '../../assets/styles/payment/StatusPages.css';

// Success Page
const SuccessPage = ({ 
  reservationData, 
  paymentMethod, 
  sendInvoiceEmail, 
  customerEmail, 
  calculateTotal 
}) => {
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
};

// Pending Page (Cash Payment)
const PendingPage = ({ calculateTotal }) => {
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
};

// Processing Page (Card Payment)
const ProcessingPage = () => {
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
};

// Export as object with named components
const StatusPages = {
  Success: SuccessPage,
  Pending: PendingPage,
  Processing: ProcessingPage
};

export default StatusPages;