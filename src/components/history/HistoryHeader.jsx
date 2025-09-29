import React from 'react';
import { Row, Col } from 'react-bootstrap';
import '../../assets/styles/history/HistoryHeader.css';

const HistoryHeader = () => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center page-header">
          <h2 className="mb-0">
            <span className="me-2">⚡</span>
            Lịch sử sạc xe điện
          </h2>
        </div>
      </Col>
    </Row>
  );
};

export default HistoryHeader;