import React from 'react';
import { Card, Row, Col, Badge, Collapse } from 'react-bootstrap';
import { formatDateTime, formatCurrency, formatDuration, getStatusBadge } from '../../utils/historyHelpers';
import HistorySessionDetail from './HistorySessionDetail';

const HistorySessionCard = ({ session, isExpanded, onToggleExpand }) => {
  return (
    <div className="session-card mb-3">
      <Card>
        {/* Card Header */}
        <div 
          onClick={onToggleExpand}
          style={{ cursor: 'pointer' }}
          className="session-card-header d-flex justify-content-between align-items-center"
        >
          <div>
            <h6 className="mb-0 fw-bold">
              {session.station_name} - {session.post_name} - 
              <Badge bg={getStatusBadge(session.status)} className="ms-2">
                {session.status}
              </Badge>
            </h6>
          </div>
          <div>
            <span className="text-muted">
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
        </div>
        
        {/* Card Body */}
        <Card.Body>
          <Row>
            <Col lg={3} md={6}>
              <div className="session-info-item">
                <div className="session-info-label">⏰ Thời gian</div>
                <div className="session-info-value">
                  <div className="fw-bold">{formatDateTime(session.start_time)}</div>
                  {session.end_time && (
                    <small className="text-muted">đến {formatDateTime(session.end_time)}</small>
                  )}
                </div>
              </div>
            </Col>
            
            <Col lg={3} md={6}>
              <div className="session-info-item">
                <div className="session-info-label">⚡ Năng lượng</div>
                <div className="session-info-value fw-bold">{session.kwh || 0} kWh</div>
              </div>
            </Col>
            
            <Col lg={3} md={6}>
              <div className="session-info-item">
                <div className="session-info-label">💰 Chi phí</div>
                <div className="session-info-value fw-bold">{formatCurrency(session.total_amount || 0)}</div>
              </div>
            </Col>
            
            <Col lg={3} md={6}>
              <div className="session-info-item">
                <div className="session-info-label">🔌 Loại cắm</div>
                <div className="session-info-value">{session.plugType || session.charging_type || 'N/A'}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
        
        {/* Expanded Detail */}
        <Collapse in={isExpanded}>
          <Card.Footer>
            <HistorySessionDetail session={session} />
          </Card.Footer>
        </Collapse>
      </Card>
    </div>
  );
};

export default HistorySessionCard;