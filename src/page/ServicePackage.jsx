import React, { useState, useMemo } from 'react';
import { Layout, Row, Col, Modal, Button } from 'antd';
import PageHeader from '../components/PageHeader';
import ServicePackageCard from '../components/service/ServicePackageCard';

const { Content } = Layout;

const mockPackages = [
  {
    packageId: 'pkg_basic',
    packageName: 'Gói Tiết Kiệm',
    description: 'Phù hợp cho nhu cầu sạc cơ bản, tiết kiệm chi phí cho người dùng cá nhân.',
    price: 100000,
    billingCycle: 1,
    unit: 'MONTH',
    quota: 50,
    type: 'Prepaid'
  },
  {
    packageId: 'pkg_vip',
    packageName: 'Gói VIP',
    description: 'Ưu đãi đặc biệt, hỗ trợ 24/7, ưu tiên trạm sạc, phù hợp người dùng thường xuyên.',
    price: 299000,
    billingCycle: 3,
    unit: 'MONTH',
    quota: 300,
    type: 'VIP'
  },
  {
    packageId: 'pkg_enterprise',
    packageName: 'Gói Doanh Nghiệp',
    description: 'Dành cho doanh nghiệp, quota lớn, báo cáo chi tiết và hỗ trợ doanh nghiệp.',
    price: 1000000,
    billingCycle: 12,
    unit: 'MONTH',
    quota: 5000,
    type: 'Postpaid'
  }
];

const ServicePackage = () => {
  const [packages] = useState(mockPackages);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activePackageId, setActivePackageId] = useState(null); // simulate user's active package
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const handleSubscribeClick = (pkg) => {

    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    setLoadingConfirm(true);
    // simulate API call
    await new Promise(res => setTimeout(res, 800));
    setActivePackageId(selectedPackage.packageId);
    setLoadingConfirm(false);
    setModalVisible(false);
  };

  const filteredAndSorted = useMemo(() => {
    return packages.slice();
  }, [packages]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f6f6f6' }}>
      <Content style={{ padding: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <PageHeader title="Các gói dịch vụ sạc điện" subtitle="Chọn gói phù hợp với nhu cầu của bạn" />

          {/* search and sort controls removed as requested */}

          <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
            {filteredAndSorted.map(pkg => (
              <Col xs={24} sm={12} md={8} key={pkg.packageId}>
                <ServicePackageCard
                  packageId={pkg.packageId}
                  packageName={pkg.packageName}
                  description={pkg.description}
                  price={pkg.price}
                  billingCycle={pkg.billingCycle}
                  unit={pkg.unit}
                  quota={pkg.quota}
                  type={pkg.type}
                  isActive={activePackageId === pkg.packageId}
                  onSubscribe={handleSubscribeClick}
                />
              </Col>
            ))}
          </Row>

          <Modal title="Xác nhận đăng ký gói" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} centered>
            {selectedPackage && (
              <div>
                <p style={{ marginBottom: 6 }}><strong>{selectedPackage.packageName}</strong></p>
                <p style={{ marginBottom: 6 }}>{selectedPackage.description}</p>
                <p style={{ marginBottom: 6 }}><strong>Giá:</strong> {(selectedPackage.price || 0).toLocaleString('vi-VN')} VNĐ</p>
                <p style={{ marginBottom: 6 }}><strong>Hạn dùng:</strong> {`Hiệu lực ${selectedPackage.billingCycle} ${selectedPackage.unit === 'MONTH' ? 'tháng' : selectedPackage.unit}`}</p>
                <p style={{ marginBottom: 6 }}><strong>Số lượng:</strong> {selectedPackage.quota ?? 'Không giới hạn'}</p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                  <Button type="primary" loading={loadingConfirm} onClick={handleConfirmPayment}>Xác nhận thanh toán</Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default ServicePackage;