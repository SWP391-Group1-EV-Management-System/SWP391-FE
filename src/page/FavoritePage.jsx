import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Spin, 
  Alert, 
  Tag, 
  Divider,
  Empty,
  Space
} from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  StopOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ChargingPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/db.json');
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu từ db.json');
      }
      const data = await response.json();
      setPackages(data.packages);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getBillingCycleText = (cycle) => {
    return cycle === 'monthly' ? 'Tháng' : 'Năm';
  };

  const handleRegister = (packageId) => {
    alert(`Đăng ký gói ${packageId} thành công!`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <Title level={3} style={{ color: '#0B9459', margin: 0 }}>
            <ThunderboltOutlined /> Gói Dịch Vụ Trạm Sạc Xe Điện
          </Title>
          <Paragraph style={{ fontSize: '1.3rem', margin: 0 }}>
            Chọn gói dịch vụ phù hợp với nhu cầu sử dụng của bạn
          </Paragraph>
        </Space>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={`${error}. Vui lòng kiểm tra file db.json trong thư mục public/`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Empty State */}
      {packages.length === 0 && !loading && (
        <Card>
          <Empty 
            description="Không có dữ liệu gói dịch vụ. Vui lòng kiểm tra file db.json"
          />
        </Card>
      )}

      {/* Packages Grid */}
      <Row gutter={[24, 24]}>
        {packages.map((pkg) => (
          <Col key={pkg.Package_ID} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  padding: '24px', 
                  textAlign: 'center',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <Tag 
                    color={pkg.Status === 'active' ? 'success' : 'default'}
                    icon={pkg.Status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
                    style={{ marginBottom: 12 }}
                  >
                    {pkg.Status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Tag>
                  <Title level={3} style={{ color: '#0B9459', margin: 0 }}>
                    {pkg.Package_Name}
                  </Title>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Description */}
                <Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
                  {pkg.Description}
                </Paragraph>

                {/* Price Section */}
                <Card 
                  size="small" 
                  style={{ 
                    backgroundColor: '#f9f9f9', 
                    textAlign: 'center',
                    border: 'none'
                  }}
                >
                  <Title level={2} style={{ color: '#0B9459', margin: 0 }}>
                    {formatPrice(pkg.Price)} {pkg.Unit}
                  </Title>
                  <Text type="secondary">
                    /{getBillingCycleText(pkg.Billing_cycle)}
                  </Text>
                </Card>

                {/* Features */}
                <div>
                  <Row justify="space-between" style={{ padding: '8px 0' }}>
                    <Col>
                      <Text strong style={{ color: '#0B9459' }}>
                        <ThunderboltOutlined /> Quota:
                      </Text>
                    </Col>
                    <Col>
                      <Text>{pkg.Quota} kWh</Text>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />

                  <Row justify="space-between" style={{ padding: '8px 0' }}>
                    <Col>
                      <Text strong style={{ color: '#0B9459' }}>Trung bình:</Text>
                    </Col>
                    <Col>
                      <Text>{pkg.Average_Quota} kWh/ngày</Text>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />

                  <Row justify="space-between" style={{ padding: '8px 0' }}>
                    <Col>
                      <Text strong style={{ color: '#0B9459' }}>Chu kỳ thanh toán:</Text>
                    </Col>
                    <Col>
                      <Text>{getBillingCycleText(pkg.Billing_cycle)}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Register Button */}
                <Button
                  type={pkg.Status === 'active' ? 'primary' : 'default'}
                  size="large"
                  block
                  disabled={pkg.Status !== 'active'}
                  onClick={() => handleRegister(pkg.Package_ID)}
                  style={{ marginTop: 16 }}
                >
                  {pkg.Status === 'active' ? 'Đăng ký ngay' : 'Không khả dụng'}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ChargingPackages;