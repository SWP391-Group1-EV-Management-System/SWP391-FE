import React from "react";
import { Card } from "react-bootstrap";
import "../../assets/styles/energy/PricingInfo.css";

const PricingInfo = ({ sessionData }) => {
  return (
    <Card className="pricing-info-card">
      <Card.Header>
        <h5>
          <i className="fas fa-dollar-sign me-2"></i>
          Thông tin giá cả
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="pricing-grid">
          <div className="pricing-item">
            <span className="pricing-label">Giá theo kWh</span>
            <span className="pricing-value">{sessionData.pricePerKwh}đ</span>
          </div>
          <div className="pricing-item">
            <span className="pricing-label">Giá theo phút</span>
            <span className="pricing-value">{sessionData.pricePerMin}đ</span>
          </div>
          <div className="pricing-item">
            <span className="pricing-label">Tổng thời gian</span>
            <span className="pricing-value">{sessionData.timeElapsed}</span>
          </div>
          <div className="pricing-item">
            <span className="pricing-label">Tổng năng lượng</span>
            <span className="pricing-value">{sessionData.energyCharged} kWh</span>
          </div>
        </div>
        
        <div className="cost-summary">
          <div className="cost-label">Tổng chi phí dự kiến</div>
          <div className="cost-amount">{sessionData.estimatedCost}đ</div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PricingInfo;