import React from "react";
import { Card, Row, Col, Typography, Space, Tag, Divider, Alert } from "antd";
import {
  HomeOutlined,
  ThunderboltOutlined,
  CalculatorOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../utils/paymentUtils";

const { Title, Text } = Typography;

const BookingDetails = ({
  reservationData,
  peakHourSurcharge = 0,
  calculateTotal,
}) => {
  // Debug log
  console.log("BookingDetails received data:", reservationData);

  // Safe access to reservation data
  const safeData = {
    station: reservationData?.station || "Đang tải...",
    district: reservationData?.district || "Đang tải...",
    address: reservationData?.address || "Đang tải...",
    chargingType: reservationData?.chargingType || "Đang tải...",
    date: reservationData?.date || "Đang tải...",
    time: reservationData?.time || "Đang tải...",
    vehicle: reservationData?.vehicle || "Đang tải...",
    kwh: reservationData?.kwh || 0,
    chargingCost: reservationData?.chargingCost || 0,
    serviceFee: reservationData?.serviceFee || 0,
    tax: reservationData?.tax || 0,
    totalAmount: reservationData?.totalAmount || 0,
    chargingFeePerKwh: reservationData?.chargingFeePerKwh || 0,
  };

  const detailItemStyle = {
    padding: "1.25rem",
    background: "#f8fafc",
    borderRadius: "0.75rem",
    border: "1px solid #e2e8f0",
    borderLeft: "4px solid #10b981",
    transition: "all 0.2s ease",
  };

  return (
    <Card
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem",
      }}
      styles={{
        body: { padding: "1.5rem" },
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Card Title */}
        <Title
          level={4}
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CalculatorOutlined />
          Chi tiết đặt chỗ
        </Title>

        {/* Station Information */}
        <div>
          <Title
            level={5}
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <HomeOutlined style={{ color: "#10b981" }} />
            Thông tin trạm sạc
          </Title>

          {/* Station Info Card */}
          <Card
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.75rem",
              marginBottom: "1.5rem",
            }}
            styles={{
              body: { padding: "1.5rem" },
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title
                level={5}
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 600,
                  color: "#059669",
                  margin: 0,
                }}
              >
                {safeData.station}
              </Title>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <Text style={{ color: "#6b7280", fontSize: "1.45rem" }}>
                  <EnvironmentOutlined /> {safeData.address}
                </Text>
                <Tag
                  color="green"
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.025em",
                  }}
                >
                  {safeData.district}
                </Tag>
              </div>
            </Space>
          </Card>

          {/* Details Grid */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div
                style={detailItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.7rem",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#ffffff",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      color: "#10b981",
                    }}
                  >
                    <ThunderboltOutlined />
                  </div>
                  <Text
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Loại sạc
                  </Text>
                </div>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    wordBreak: "break-word",
                  }}
                >
                  {safeData.chargingType}
                </Text>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div
                style={detailItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.6rem",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#ffffff",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      color: "#10b981",
                    }}
                  >
                    <CalendarOutlined />
                  </div>
                  <Text
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Ngày sạc
                  </Text>
                </div>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    wordBreak: "break-word",
                  }}
                >
                  {safeData.date}
                </Text>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div
                style={detailItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#ffffff",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      color: "#10b981",
                    }}
                  >
                    <ClockCircleOutlined />
                  </div>
                  <Text
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Thời gian
                  </Text>
                </div>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    wordBreak: "break-word",
                  }}
                >
                  {safeData.time}
                </Text>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div
                style={detailItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#ffffff",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      color: "#10b981",
                    }}
                  >
                    <CarOutlined />
                  </div>
                  <Text
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Xe điện
                  </Text>
                </div>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    wordBreak: "break-word",
                  }}
                >
                  {safeData.vehicle}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Charging Session Details */}
        <div>
          <Title
            level={5}
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ThunderboltOutlined style={{ color: "#10b981" }} />
            Thông tin phiên sạc
          </Title>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              background: "#f0fdf4",
              borderRadius: "0.75rem",
              border: "1px solid #bbf7d0",
            }}
          >
            <Text style={{ color: "#6b7280", fontSize: "1.6rem" }}>
              Năng lượng:
            </Text>
            <Text
              style={{
                color: "#10b981",
                fontWeight: 700,
                fontSize: "1.7rem",
              }}
            >
              {safeData.kwh} kWh
            </Text>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div>
          <Title
            level={5}
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <DollarOutlined style={{ color: "#10b981" }} />
            Chi phí
          </Title>

          <Card
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
            }}
            styles={{
              body: { padding: "1.5rem" },
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* Cost Items */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #e5e7eb",
                  transition: "all 0.2s ease",
                }}
              >
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "1.6rem",
                    fontWeight: 500,
                  }}
                >
                  Chi phí sạc ({safeData.kwh} kWh)
                </Text>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.7rem",
                  }}
                >
                  {formatCurrency(safeData.chargingCost)}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #e5e7eb",
                  transition: "all 0.2s ease",
                }}
              >
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "1.6rem",
                    fontWeight: 500,
                  }}
                >
                  Phí dịch vụ
                </Text>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.7rem",
                  }}
                >
                  {formatCurrency(safeData.serviceFee)}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #e5e7eb",
                  transition: "all 0.2s ease",
                }}
              >
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "1.6rem",
                    fontWeight: 500,
                  }}
                >
                  Thuế
                </Text>
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "1.7rem",
                  }}
                >
                  {formatCurrency(safeData.tax)}
                </Text>
              </div>

              {peakHourSurcharge > 0 && (
                <div
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #f59e0b",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    margin: "0.5rem 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#92400e",
                      fontWeight: 600,
                      fontSize: "1.6rem",
                    }}
                  >
                    ⚡ Phí giờ cao điểm
                  </Text>
                  <Text
                    style={{
                      color: "#92400e",
                      fontWeight: 600,
                      fontSize: "1.7rem",
                    }}
                  >
                    {formatCurrency(peakHourSurcharge)}
                  </Text>
                </div>
              )}

              <Divider
                style={{
                  margin: "0.5rem 0",
                  borderColor: "#10b981",
                  borderWidth: "2px",
                }}
              />

              {/* Total */}
              <div
                style={{
                  background: "#10b981",
                  color: "white",
                  padding: "1rem",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: 600, fontSize: "1.rem" }}
                >
                  TỔNG CỘNG
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "2rem",
                  }}
                >
                  {formatCurrency(
                    calculateTotal ? calculateTotal() : safeData.totalAmount
                  )}
                </Text>
              </div>
            </Space>
          </Card>
        </div>
      </Space>
    </Card>
  );
};

export default BookingDetails;
