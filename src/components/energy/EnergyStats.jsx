import React from "react";
import "../../assets/styles/energy/EnergyStats.css";

const EnergyStats = ({ sessionData }) => {
  return (
    <div className="info-card-container">
      <div className="info-card">
        <div className="card-icon">⚡</div>
        <h4 className="card-title">Năng lượng đã sạc</h4>
        <div className="card-value">{sessionData.energyCharged}</div>
        <div className="card-sub">kWh</div>
      </div>

      <div className="info-card">
        <div className="card-icon">⏱️</div>
        <h4 className="card-title">Thời gian đã sạc</h4>
        <div className="card-value">{sessionData.timeElapsed}</div>
        <div className="card-sub">Thời gian còn lại: {sessionData.estimatedTimeLeft}</div>
      </div>

      <div className="info-card">
        <div className="card-icon">💰</div>
        <h4 className="card-title">Chi phí ước tính</h4>
        <div className="card-value">{sessionData.estimatedCost}</div>
        <div className="card-sub">VNĐ</div>
      </div>
    </div>
  );
};

export default EnergyStats;