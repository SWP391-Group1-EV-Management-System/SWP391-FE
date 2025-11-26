import React, { useState } from "react";
import { Card, Row, Col, Typography, Spin, Alert, Badge, Divider, Tabs } from "antd";
import {
  ThunderboltOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  WarningOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { FaChartLine } from "react-icons/fa";
import Map from "../components/map/Map";
import { useDashboard } from "../hooks/useDashboard";
import { useChargingStations } from "../hooks/useChargingStations";

const { Title, Text } = Typography;

function DashboardContent() {
  const { dashboardData, loading, error } = useDashboard();
  const { stations, loading: stationsLoading } = useChargingStations({
    autoFetch: true,
  });
  const [activeTab, setActiveTab] = useState("1");

  // Format số tiền
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading || stationsLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f0f2f5",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#f0f2f5", padding: "24px" }}
      >
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  // Tab 1: Tổng quan doanh thu
  const RevenueTab = () => (
    <div>
      {/* Row 1: 3 cards trên */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Card 1: Doanh thu hôm nay */}
        <Col xs={24} sm={12} md={8}>
          <Card
            variant="outlined"
            style={{ 
              borderRadius: 12, 
              textAlign: "center", 
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease"
            }}
            styles={{ body: { padding: "24px" } }}
            hoverable
          >
            <DollarOutlined
              style={{ color: "#1890ff", fontSize: 42, marginBottom: 16 }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#1890ff",
                marginBottom: 8,
                lineHeight: 1.2
              }}
            >
              {formatCurrency(dashboardData?.totalPriceToday || 0)}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c", fontWeight: 500 }}>
              Doanh thu hôm nay
            </Text>
          </Card>
        </Col>

        {/* Card 2: Doanh thu tháng này */}
        <Col xs={24} sm={12} md={8}>
          <Card
            variant="outlined"
            style={{ 
              borderRadius: 12, 
              textAlign: "center", 
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease"
            }}
            styles={{ body: { padding: "24px" } }}
            hoverable
          >
            <CalendarOutlined
              style={{ color: "#52c41a", fontSize: 42, marginBottom: 16 }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#52c41a",
                marginBottom: 8,
                lineHeight: 1.2
              }}
            >
              {formatCurrency(dashboardData?.totalPriceInMonth || 0)}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c", fontWeight: 500 }}>
              Doanh thu tháng này
            </Text>
          </Card>
        </Col>

        {/* Card 3: Báo cáo lỗi */}
        <Col xs={24} sm={12} md={8}>
          <Card
            variant="outlined"
            style={{ 
              borderRadius: 12, 
              textAlign: "center", 
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease"
            }}
            styles={{ body: { padding: "24px" } }}
            hoverable
          >
            <WarningOutlined
              style={{ color: "#ff4d4f", fontSize: 42, marginBottom: 16 }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#ff4d4f",
                marginBottom: 8,
                lineHeight: 1.2
              }}
            >
              {dashboardData?.totalReports || 0}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c", fontWeight: 500 }}>
              Tổng số báo cáo lỗi
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Row 2: 2 cards dưới - to hơn */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Card 4: Thanh toán bằng tiền */}
        <Col xs={24} md={12}>
          <Card
            variant="outlined"
            style={{ 
              borderRadius: 12, 
              textAlign: "center", 
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease"
            }}
            styles={{ body: { padding: "24px" } }}
            hoverable
          >
            <DollarOutlined
              style={{ color: "#722ed1", fontSize: 42, marginBottom: 16 }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#722ed1",
                marginBottom: 8,
                lineHeight: 1.2
              }}
            >
              {formatCurrency(dashboardData?.amountUserPaidByMoney || 0)}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c", fontWeight: 500 }}>
              Thanh toán bằng tiền
            </Text>
          </Card>
        </Col>

        {/* Card 5: Thanh toán bằng gói */}
        <Col xs={24} md={12}>
          <Card
            variant="outlined"
            style={{ 
              borderRadius: 12, 
              textAlign: "center", 
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease"
            }}
            styles={{ body: { padding: "24px" } }}
            hoverable
          >
            <AppstoreOutlined
              style={{ color: "#fa8c16", fontSize: 42, marginBottom: 16 }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#fa8c16",
                marginBottom: 8,
                lineHeight: 1.2
              }}
            >
              {formatCurrency(dashboardData?.amountUserPaidByPackage || 0)}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c", fontWeight: 500 }}>
              Thanh toán bằng gói
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Tab 2: Danh sách trạm và phiên sạc
  const StationsTab = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Danh sách trạm sạc */}
      <Col xs={24} lg={18}>
        <Card
          title={
            <Text style={{ fontSize: 16, fontWeight: 600 }}>
              Danh sách trạm sạc
            </Text>
          }
          variant="outlined"
          style={{ borderRadius: 8, height: "600px" }}
          styles={{
            body: {
              padding: "16px",
              height: "calc(100% - 57px)",
              overflowY: "auto",
            },
          }}
        >
          {stations.map((station) => (
            <Card
              key={station.id}
              size="small"
              variant="outlined"
              style={{ marginBottom: 12, borderRadius: 6 }}
              styles={{ body: { padding: "16px" } }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <EnvironmentOutlined
                      style={{
                        color: "#1890ff",
                        fontSize: 18,
                        marginRight: 8,
                      }}
                    />
                    <Text strong style={{ fontSize: 15 }}>
                      {station.name}
                    </Text>
                    <Badge
                      status={station.active ? "success" : "error"}
                      text={station.active ? "Hoạt động" : "Bảo trì"}
                      style={{ marginLeft: 12 }}
                    />
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 13,
                      display: "block",
                      paddingLeft: 26,
                    }}
                  >
                    {station.address}
                  </Text>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginLeft: 16,
                    minWidth: 80,
                  }}
                >
                  <ThunderboltOutlined
                    style={{
                      color: "#52c41a",
                      fontSize: 24,
                      marginBottom: 4,
                    }}
                  />
                  <Text strong style={{ fontSize: 20 }}>
                    {station.availableSlots}/{station.numberOfPosts}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Trụ sạc
                  </Text>
                </div>
              </div>
            </Card>
          ))}
          {stations.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#8c8c8c",
              }}
            >
              <EnvironmentOutlined
                style={{ fontSize: 48, marginBottom: 16 }}
              />
              <div>Chưa có trạm sạc nào</div>
            </div>
          )}
        </Card>
      </Col>

      {/* Phiên sạc */}
      <Col xs={24} lg={6}>
        <Card
          title={
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Phiên sạc</Text>
          }
          variant="outlined"
          style={{ borderRadius: 8, height: "600px" }}
          styles={{ body: { padding: "20px 16px" } }}
        >
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <FaChartLine
              style={{ color: "#eb2f96", fontSize: 32, marginBottom: 12 }}
            />
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#eb2f96",
                marginBottom: 8,
              }}
            >
              {dashboardData?.totalSessions || 0}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c" }}>
              Tổng số phiên sạc
            </Text>
          </div>
          <Divider style={{ margin: "20px 0" }} />
          <div style={{ textAlign: "center" }}>
            <FaChartLine
              style={{ color: "#fa8c16", fontSize: 32, marginBottom: 12 }}
            />
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#fa8c16",
                marginBottom: 8,
              }}
            >
              {dashboardData?.totalSessionsInMonth || 0}
            </div>
            <Text style={{ fontSize: 14, color: "#8c8c8c" }}>
              Phiên sạc trong tháng
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );

  
  // Tab 3: Thống kê hệ thống và bản đồ
  const SystemTab = () => {
    const [mapKey, setMapKey] = useState(Date.now());

    // Remount map when tab becomes active
    React.useEffect(() => {
      if (activeTab === "3") {
        setMapKey(Date.now());
      }
    }, [activeTab]);

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={6}>
          <Card
            title={
              <Text style={{ fontSize: 16, fontWeight: 600 }}>
                Thống kê hệ thống
              </Text>
            }
            variant="outlined"
            style={{ borderRadius: 8, height: "600px" }}
            styles={{ body: { padding: "20px 16px" } }}
          >
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <EnvironmentOutlined
                style={{ color: "#13c2c2", fontSize: 32, marginBottom: 12 }}
              />
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#13c2c2",
                  marginBottom: 8,
                }}
              >
                {dashboardData?.totalActiveStations || 0}
              </div>
              <Text style={{ fontSize: 14, color: "#8c8c8c" }}>
                Trạm hoạt động
              </Text>
            </div>

            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <ThunderboltOutlined
                style={{ color: "#52c41a", fontSize: 32, marginBottom: 12 }}
              />
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#52c41a",
                  marginBottom: 8,
                }}
              >
                {dashboardData?.totalActivePosts || 0}
              </div>
              <Text style={{ fontSize: 14, color: "#8c8c8c" }}>
                Trụ hoạt động
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <UserOutlined
                style={{ color: "#1890ff", fontSize: 32, marginBottom: 12 }}
              />
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#1890ff",
                  marginBottom: 8,
                }}
              >
                {dashboardData?.totalActiveUsers || 0}
              </div>
              <Text style={{ fontSize: 14, color: "#8c8c8c" }}>
                Người dùng
              </Text>
            </div>
          </Card>
        </Col>

        {/* Bản đồ */}
        <Col xs={24} lg={18}>
          <Card
            title={
              <Text style={{ fontSize: 16, fontWeight: 600 }}>
                Tổng quan trạm
              </Text>
            }
            variant="outlined"
            style={{ borderRadius: 8, height: "600px" }}
            styles={{ body: { padding: "20px" } }}
          >
            <div style={{ height: "520px", width: "100%" }}>
              {activeTab === "3" && <Map key={mapKey} />}
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <DollarOutlined /> Doanh thu
        </span>
      ),
      children: <RevenueTab />,
    },
    {
      key: "2",
      label: (
        <span>
          <EnvironmentOutlined /> Trạm sạc
        </span>
      ),
      children: <StationsTab />,
    },
    {
      key: "3",
      label: (
        <span>
          <BarChartOutlined /> Hệ thống & Bản đồ
        </span>
      ),
      children: <SystemTab />,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "white", padding: "24px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <PageHeader title="Thống kê" icon={<ThunderboltOutlined />} />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ marginTop: 16 }}
        />
      </div>
    </div>
  );
}

export default DashboardContent;