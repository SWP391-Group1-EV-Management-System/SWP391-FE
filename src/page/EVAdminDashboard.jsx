import React from "react";
import { Card, Row, Col, Typography, Spin, Alert, Badge, Divider } from "antd";
import {
  ThunderboltOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import Map from '../components/map/Map';
import { useDashboard } from "../hooks/useDashboard";
import { useChargingStations } from "../hooks/useChargingStations";

const { Title, Text } = Typography;

function DashboardContent() {
  const { dashboardData, loading, error } = useDashboard();
  const { stations, loading: stationsLoading } = useChargingStations({ autoFetch: true });

  // Format số tiền
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading || stationsLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <PageHeader
          title="Thống kê"
          icon={<ThunderboltOutlined />}
        />

        {/* Hàng 1: 4 thẻ chính - Doanh thu và Thanh toán */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="outlined" style={{ borderRadius: 8, padding: '8px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <DollarOutlined style={{ color: "#1890ff", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#1890ff", marginBottom: 8 }}>
                  {formatCurrency(dashboardData?.totalPriceToday || 0)}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Doanh thu hôm nay</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="outlined" style={{ borderRadius: 8, padding: '8px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <DollarOutlined style={{ color: "#52c41a", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#52c41a", marginBottom: 8 }}>
                  {formatCurrency(dashboardData?.totalPriceInMonth || 0)}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Doanh thu tháng này</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="outlined" style={{ borderRadius: 8, padding: '8px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <DollarOutlined style={{ color: "#faad14", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#faad14", marginBottom: 8 }}>
                  {formatCurrency(dashboardData?.amountUserPaidByMoney || 0)}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Số lượng thanh toán Momo</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="outlined" style={{ borderRadius: 8, padding: '8px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <DollarOutlined style={{ color: "#722ed1", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#722ed1", marginBottom: 8 }}>
                  {formatCurrency(dashboardData?.amountUserPaidByPackage || 0)}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Số lượng thanh toán bằng gói</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Hàng 2: Danh sách trạm và Thống kê hệ thống */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* Danh sách trạm sạc */}
          <Col xs={24} lg={18}>
            <Card 
              title={<Text style={{ fontSize: 16, fontWeight: 600 }}>Danh sách trạm sạc</Text>}
              variant="outlined"
              style={{ borderRadius: 8, height: '100%' }}
              styles={{ body: { padding: '16px', maxHeight: '440px', overflowY: 'auto' } }}
            >
              {stations.map((station) => (
                <Card 
                  key={station.id}
                  size="small"
                  variant="outlined"
                  style={{ marginBottom: 12, borderRadius: 6 }}
                  styles={{ body: { padding: '16px' } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Phần thông tin trạm */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 18, marginRight: 8 }} />
                        <Text strong style={{ fontSize: 15 }}>{station.name}</Text>
                        <Badge 
                          status={station.active ? "success" : "error"} 
                          text={station.active ? "Hoạt động" : "Bảo trì"}
                          style={{ marginLeft: 12 }}
                        />
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', paddingLeft: 26 }}>
                        {station.address}
                      </Text>
                    </div>

                    {/* Phần số trụ sạc */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16, minWidth: 80 }}>
                      <ThunderboltOutlined style={{ color: '#52c41a', fontSize: 24, marginBottom: 4 }} />
                      <Text strong style={{ fontSize: 20 }}>{station.availableSlots}/{station.numberOfPosts}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>Trụ sạc</Text>
                    </div>
                  </div>
                </Card>
              ))}
              {stations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                  <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>Chưa có trạm sạc nào</div>
                </div>
              )}
            </Card>
          </Col>

          {/* Thống kê hệ thống */}
          <Col xs={24} lg={6}>
            <Card 
              title={<Text style={{ fontSize: 16, fontWeight: 600 }}>Thống kê hệ thống</Text>}
              variant="outlined"
              style={{ borderRadius: 8, height: '100%' }}
              styles={{ body: { padding: '20px 16px' } }}
            >
              <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <EnvironmentOutlined style={{ color: "#13c2c2", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#13c2c2", marginBottom: 8 }}>
                  {dashboardData?.totalActiveStations || 0}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Trạm hoạt động</Text>
              </div>

              <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <ThunderboltOutlined style={{ color: "#52c41a", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#52c41a", marginBottom: 8 }}>
                  {dashboardData?.totalActivePosts || 0}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Trụ hoạt động</Text>
              </div>

              <div style={{ textAlign: 'center' }}>
                <UserOutlined style={{ color: "#1890ff", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#1890ff", marginBottom: 8 }}>
                  {dashboardData?.totalActiveUsers || 0}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Người dùng</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Hàng 3: Phiên sạc và Bản đồ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* Phiên sạc */}
          <Col xs={24} lg={6}>
            <Card 
              title={<Text style={{ fontSize: 16, fontWeight: 600 }}>Phiên sạc</Text>}
              variant="outlined"
              style={{ borderRadius: 8, height: '100%' }}
              styles={{ body: { padding: '20px 16px' } }}
            >
              <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <AppstoreOutlined style={{ color: "#eb2f96", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#eb2f96", marginBottom: 8 }}>
                  {dashboardData?.totalSessions || 0}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Tổng số phiên sạc</Text>
              </div>
              <Divider style={{ margin: '20px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <CalendarOutlined style={{ color: "#fa8c16", fontSize: 32, marginBottom: 12 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: "#fa8c16", marginBottom: 8 }}>
                  {dashboardData?.totalSessionsInMonth || 0}
                </div>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>Phiên sạc trong tháng</Text>
              </div>
            </Card>
          </Col>

          {/* Bản đồ */}
          <Col xs={24} lg={18}>
            <Card
              title={<Text style={{ fontSize: 16, fontWeight: 600 }}>Tổng quan trạm</Text>}
              variant="outlined"
              style={{ borderRadius: 8 }}
              styles={{ body: { padding: '16px' } }}
            >
              <div style={{ height: '440px', width: '100%' }}>
                <Map />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default DashboardContent;