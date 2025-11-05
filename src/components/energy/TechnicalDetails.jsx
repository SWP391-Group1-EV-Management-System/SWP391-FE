import React from "react";
import { Card, Typography, Space, Row, Col, Divider } from "antd";
import { SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const TechnicalDetails = React.memo(({ sessionData, chargingPostData }) => {
  // ✅ Bỏ console.log để tránh spam, chỉ log khi cần debug
  // console.log("🔍 [TechnicalDetails] sessionData:", sessionData);
  // console.log("🔍 [TechnicalDetails] chargingPostData:", chargingPostData);

  // ✅ Ưu tiên dữ liệu từ chargingPostData, fallback về sessionData
  // Lưu ý: BE trả về chargingType hoặc supportedTypes (sau khi map)
  const typeChargingRaw =
    chargingPostData?.supportedTypes ||
    chargingPostData?.chargingTypes ||
    chargingPostData?.typeCharging ||
    sessionData?.typeCharging ||
    sessionData?.supportedTypes ||
    [];

  // ✅ Loại bỏ duplicate values
  const typeCharging = Array.isArray(typeChargingRaw)
    ? [...new Set(typeChargingRaw)] // Remove duplicates using Set
    : typeChargingRaw;

  // ✅ Bỏ console.log spam
  // console.log("🔍 [TechnicalDetails] typeChargingRaw:", typeChargingRaw);
  // console.log("🔍 [TechnicalDetails] typeCharging (unique):", typeCharging);

  const maxPower = chargingPostData?.maxPower || sessionData?.maxPower || 0;
  const status = chargingPostData?.status || sessionData?.postStatus || "-";
  const chargingPostId =
    chargingPostData?.id ||
    chargingPostData?.idChargingPost ||
    sessionData?.chargingPostId ||
    "-";

  const techSpecs = [
    {
      label: "Mã trụ sạc",
      value: chargingPostId,
    },
    {
      label: "Loại cổng sạc",
      value:
        typeCharging && typeCharging.length
          ? Array.isArray(typeCharging)
            ? typeCharging.join(", ")
            : typeCharging
          : "-",
    },
    {
      label: "Công suất tối đa",
      value: maxPower ? `${maxPower} kW` : "-",
    },
  ];

  return (
    <Card
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 16px rgba(5, 119, 70, 0.08)",
      }}
      styles={{
        body: { padding: "24px" },
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Space>
          <SettingOutlined style={{ fontSize: "24px", color: "#10b981" }} />
          <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
            Thông số kỹ thuật
          </Title>
        </Space>
      </div>

      {/* Technical Details - Each Row */}
      <Space direction="vertical" size="medium" style={{ width: "100%" }}>
        {techSpecs.map((spec, index) => (
          <div key={index}>
            <Row
              justify="space-between"
              align="middle"
              style={{
                padding: "16px 20px",
                backgroundColor: spec.highlight ? "#d1fae5" : "#f8fafc",
                borderRadius: "12px",
                border: spec.highlight
                  ? "2px solid #10b981"
                  : "1px solid #e2e8f0",
                transition: "all 0.3s ease",
              }}
            >
              <Col>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  {spec.label}
                </Text>
              </Col>
              <Col>
                <Text
                  style={{
                    color: spec.highlight ? "#10b981" : "#1f2937",
                    fontSize: "16px",
                    fontWeight: spec.highlight ? 700 : 600,
                    fontFamily: "monospace",
                  }}
                >
                  {spec.value}
                </Text>
              </Col>
            </Row>

            {/* Add divider between items except last one */}
            {index < techSpecs.length - 1 && (
              <Divider style={{ margin: "8px 0", borderColor: "#e2e8f0" }} />
            )}
          </div>
        ))}
      </Space>
    </Card>
  );
});

TechnicalDetails.displayName = "TechnicalDetails";

export default TechnicalDetails;
