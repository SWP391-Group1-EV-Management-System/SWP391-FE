import React from "react";
import "../../assets/styles/energy/BatteryProgress.css";

const BatteryProgress = ({ batteryLevel, statusConfig }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (batteryLevel / 100) * circumference;

  return (
    <div className="progress-container">
      <h3 className="progress-title">Trạng thái pin</h3>
      <div className="progress-circle-container">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 200 200" 
          className="progress-circle-svg"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={statusConfig.color}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="progress-circle"
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="progress-text">
          <div className="battery-percentage">{batteryLevel}%</div>
          <div className="battery-label">Mức pin hiện tại</div>
        </div>
      </div>
    </div>
  );
};

export default BatteryProgress;