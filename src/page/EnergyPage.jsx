import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import EnergyHeader from "../components/energy/EnergyHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import { useEnergySession } from "../hooks/useEnergySession";
import "../assets/styles/energy/EnergyPage.css";

const EnergyPage = () => {
  const { sessionData, currentTime, statusConfig } = useEnergySession();

  return (
    <div className="charging-session-container">
      <Container fluid className="px-4">
        {/* Header Section */}
        <EnergyHeader sessionData={sessionData} statusConfig={statusConfig} />

        {/* Main Content */}
        <Row className="g-4 mb-4">
          <Col lg={6}>
            <BatteryProgress
              batteryLevel={sessionData.batteryLevel}
              statusConfig={statusConfig}
            />
          </Col>

          <Col lg={6}>
            <CurrentTime currentTime={currentTime} />
          </Col>
        </Row>

        {/* Stats Cards */}
        <EnergyStats sessionData={sessionData} />

        {/* Technical Details */}
        <Row className="g-4">
          <Col lg={6}>
            <TechnicalDetails sessionData={sessionData} />
          </Col>

          <Col lg={6}>
            <PricingInfo sessionData={sessionData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EnergyPage;
