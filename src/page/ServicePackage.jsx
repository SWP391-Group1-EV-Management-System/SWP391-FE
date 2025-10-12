import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col } from 'antd';
import PageHeader from '../components/PageHeader';
import ServicePackageCard from '../components/service/ServicePackageCard';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const mockPackages = [
  {
    id: 1,
    name: "Gói Tiết Kiệm",
    description: "Phù hợp cho nhu cầu sạc cơ bản, giá rẻ, thời hạn 30 ngày.",
    price: 100000,
    duration: "30 ngày",
    type: "Prepaid"
  },
  {
    id: 2,
    name: "Gói VIP",
    description: "Ưu đãi đặc biệt, hỗ trợ 24/7, thời hạn 90 ngày.",
    price: 300000,
    duration: "90 ngày",
    type: "VIP"
  },
  {
    id: 3,
    name: "Gói Doanh Nghiệp",
    description: "Dành cho doanh nghiệp, quota lớn, thời hạn 1 năm.",
    price: 1000000,
    duration: "365 ngày",
    type: "Postpaid"
  }
];

const ServicePackage = () => {
  // Chỉ hiển thị danh sách các gói dịch vụ cho user/driver
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <PageHeader
            title="Các gói dịch vụ sạc điện"
            subtitle="Chọn gói phù hợp với nhu cầu sử dụng của bạn"
          />
          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            {mockPackages.map(pkg => (
              <Col xs={24} sm={12} md={8} key={pkg.id}>
                <ServicePackageCard {...pkg} />
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default ServicePackage;