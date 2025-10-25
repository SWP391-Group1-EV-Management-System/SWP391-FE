import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Row, Col, Modal, Button } from 'antd';
import PageHeader from '../components/PageHeader';
import ServicePackageCard from '../components/service/ServicePackageCard';
import usePackage from '../hooks/usePackage';

const { Content } = Layout;

const ServicePackage = () => {
  const { packages = [], fetchAll, loading } = usePackage();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activePackageId, setActivePackageId] = useState(null); // simulate user's active package
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubscribeClick = (pkg) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    setLoadingConfirm(true);
    // simulate API call
    await new Promise(res => setTimeout(res, 800));
    setActivePackageId(selectedPackage.packageId || selectedPackage.id);
    setLoadingConfirm(false);
    setModalVisible(false);
  };

  const filteredAndSorted = useMemo(() => {
    return (packages || []).slice();
  }, [packages]);

  return (
    <Layout style={{ minHeight: '100vh', background: 'White' }}>
      <Content style={{ padding: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <PageHeader title="Các gói dịch vụ sạc điện" subtitle="Chọn gói phù hợp với nhu cầu của bạn" />

          {/* search and sort controls removed as requested */}

          <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
            {filteredAndSorted.map(pkg => (
              <Col xs={24} sm={12} md={8} key={pkg.packageId || pkg.id}>
                <ServicePackageCard
                  packageId={pkg.packageId || pkg.id}
                  packageName={pkg.packageName}
                  description={pkg.description}
                  price={pkg.price}
                  billingCycle={pkg.billingCycle}
                  unit={pkg.unit}
                  quota={pkg.quota}
                  isActive={activePackageId === (pkg.packageId || pkg.id)}
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
                <p style={{ marginBottom: 6 }}><strong>Hạn mức sử dụng gói:</strong> {selectedPackage.quota ?? 'Không giới hạn'}</p>

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