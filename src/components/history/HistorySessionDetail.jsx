import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { formatDateTime, formatCurrency } from '../../utils/historyHelpers';
import '../../assets/styles/history/HistoryDetail.css';

const HistorySessionDetail = ({ session }) => {
  return (
    <div className="expanded-detail">
      <Row>
        <Col lg={6}>
          <div className="detail-section">
            <h6 className="section-title">
              <span>📊</span> Thông tin chi tiết
            </h6>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Mã phiên sạc:</span>
                <span className="detail-value">{session.charging_session_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mã thanh toán:</span>
                <span className="detail-value">{session.payment_id || 'Chưa có'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Công suất tối đa:</span>
                <span className="detail-value">{session.max_power || session.maxPower || 'N/A'} kW</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Công suất trung bình:</span>
                <span className="detail-value">{session.avgPower || 'N/A'} kW</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pin đầu:</span>
                <span className="detail-value">{session.batteryStart || 'N/A'}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pin cuối:</span>
                <span className="detail-value">{session.batteryEnd || 'N/A'}%</span>
              </div>
            </div>
          </div>
        </Col>
        
        <Col lg={6}>
          <div className="detail-section">
            <h6 className="section-title">
              <span>💳</span> Thông tin thanh toán
            </h6>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Phương thức:</span>
                <span className="detail-value">{session.payment_method || 'Chưa thanh toán'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Giá / kWh:</span>
                <span className="detail-value">{formatCurrency(session.pricePerKwh || session.charging_fee || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thuế:</span>
                <span className="detail-value">{formatCurrency(session.tax || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Giảm giá:</span>
                <span className="detail-value">{formatCurrency(session.discount || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">
                  {session.is_paid ? '✅ Đã thanh toán' : '❌ Chưa thanh toán'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thời gian thanh toán:</span>
                <span className="detail-value">
                  {session.paid_at ? formatDateTime(session.paid_at) : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HistorySessionDetail;