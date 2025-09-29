import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { formatCurrency, formatDuration } from '../../utils/historyHelpers';
import '../../assets/styles/history/HistorySummary.css';
const HistorySummary = ({ summary }) => {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="text-center">
          <Card.Body>
            <div className="mb-2" style={{fontSize: '2rem'}}>📅</div>
            <Card.Title as="h5">{summary.totalSessions}</Card.Title>
            <Card.Text className="text-muted">Tổng phiên sạc</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="text-center">
          <Card.Body>
            <div className="mb-2" style={{fontSize: '2rem'}}>⚡</div>
            <Card.Title as="h5">{summary.totalEnergy.toFixed(1)} kWh</Card.Title>
            <Card.Text className="text-muted">Tổng năng lượng</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="text-center">
          <Card.Body>
            <div className="mb-2" style={{fontSize: '2rem'}}>💰</div>
            <Card.Title as="h5">{formatCurrency(summary.totalCost)}</Card.Title>
            <Card.Text className="text-muted">Tổng chi phí</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="text-center">
          <Card.Body>
            <div className="mb-2" style={{fontSize: '2rem'}}>⏰</div>
            <Card.Title as="h5">{formatDuration(summary.totalTime)}</Card.Title>
            <Card.Text className="text-muted">Tổng thời gian</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HistorySummary;