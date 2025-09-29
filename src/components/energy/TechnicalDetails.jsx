import React from "react";
import { Card } from "react-bootstrap";
import "../../assets/styles/energy/TechnicalDetails.css";

const TechnicalDetails = ({ sessionData }) => {
  return (
    <Card className="tech-info-card">
      <Card.Header>
        <h5>
          <i className="fas fa-cog me-2"></i>
          Thông số kỹ thuật
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="tech-grid">
          <div className="tech-item">
            <span className="tech-label">Loại cổng sạc</span>
            <span className="tech-value">{sessionData.socketType}</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Công suất tối đa</span>
            <span className="tech-value">{sessionData.power}</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Công suất hiện tại</span>
            <span className="tech-value highlight">{sessionData.chargingPower} kW</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Điện áp</span>
            <span className="tech-value">{sessionData.voltage}</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Dòng điện</span>
            <span className="tech-value">{sessionData.current}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TechnicalDetails;