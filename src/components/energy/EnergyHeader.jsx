import React from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { PiChargingStationBold } from "react-icons/pi";
import "../../assets/styles/energy/EnergyHeader.css";

const EnergyHeader = ({ sessionData, statusConfig }) => {
  return (
    <div className="charging-session-header">
      <div className="header-row">
        {/* Logo */}
        <div className="header-icon">
          <PiChargingStationBold />
        </div>
        
        {/* Station Info */}
        <div className="header-info">
          <h1 className="header-title">{sessionData.stationName}</h1>
          <p className="header-address">
            <i className="fas fa-map-marker-alt me-2"></i>
            {sessionData.address}
          </p>
        </div>
        
        {/* Status Badge */}
        <div className="header-status">
          <Badge 
            className="status-badge" 
            style={{ backgroundColor: statusConfig.color, border: 'none' }}
          >
            {statusConfig.icon} {statusConfig.text}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default EnergyHeader;