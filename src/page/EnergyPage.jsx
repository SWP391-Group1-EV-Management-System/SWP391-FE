import React from "react";
import { Row, Col, Space } from "antd";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import { useEnergySession } from "../hooks/useEnergySession";
import { ThunderboltOutlined } from '@ant-design/icons';

const EnergyPage = () => {
  const { sessionData, currentTime, statusConfig } = useEnergySession();

  return (
    <div style={{ 
      padding: '20px',
      background: 'white',
      minHeight: '100vh'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header Section - Full Width */}
          <PageHeader
            title={sessionData.stationName}
            icon={<ThunderboltOutlined />}
            subtitle={sessionData.address}
            statusTag={{
              color: statusConfig.color,
              icon: statusConfig.icon,
              text: statusConfig.text
            }}
          />

          {/* Row 1: 2 Columns Equal Size */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <BatteryProgress
                batteryLevel={sessionData.batteryLevel}
                isCharging={statusConfig.isCharging}
                isCompleted={statusConfig.isCompleted}
              />
            </Col>
            <Col xs={24} lg={12}>
              <CurrentTime currentTime={currentTime} />
            </Col>
          </Row>

          {/* Row 2: 3 Columns Equal Size */}
          <EnergyStats sessionData={sessionData} />

          {/* Row 3: 2 Columns Equal Size */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>
            <Col xs={24} lg={12}>
              <PricingInfo sessionData={sessionData} />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;
