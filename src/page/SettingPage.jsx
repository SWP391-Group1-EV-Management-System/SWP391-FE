import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router';
import { Button, Layout, Typography, Card, Space, Modal, Input, notification } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { usePaymentData } from '../hooks/usePayment';
import { useAuth } from '../hooks/useAuth'; // Sử dụng hook useAuth

const { Content } = Layout;
const { Title, Text } = Typography;

function SettingPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy user từ useAuth hook
  const { payments, fetchUnpaidPaymentsByUserId, loading } = usePaymentData();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');

  // Fetch unpaid payments khi component mount
  useEffect(() => {
    if (user?.id) {
      console.log('🔍 SettingPage: Fetching unpaid payments for user:', user.id);
      fetchUnpaidPaymentsByUserId(user.id)
        .then(data => {
          console.log('✅ Unpaid payments fetched:', data);
        })
        .catch(err => {
          console.error('❌ Error fetching unpaid payments:', err);
          notification.error({
            message: 'Lỗi tải dữ liệu',
            description: 'Không thể tải danh sách thanh toán. Vui lòng thử lại.',
          });
        });
    } else {
      console.log('⚠️ SettingPage: No user ID available');
    }
  }, [user?.id]);

  // Hàm điều hướng đến trang thanh toán
  const handleGoToPayment = () => {
    if (payments && payments.length > 0) {
      // Nếu có payments chưa thanh toán, chọn cái đầu tiên
      const firstUnpaidPayment = payments[0];
      navigate(`/app/payment/${firstUnpaidPayment.paymentId || firstUnpaidPayment.id}`);
    } else {
      // Nếu không có, cho phép nhập paymentId thủ công
      setModalVisible(true);
    }
  };

  const handleManualPayment = () => {
    if (!selectedPaymentId.trim()) {
      notification.warning({
        message: 'Vui lòng nhập mã thanh toán',
      });
      return;
    }
    navigate(`/app/payment/${selectedPaymentId.trim()}`);
    setModalVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Space style={{ width: 360 }}>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={handleGoToPayment}
            size="large"
            block
          >
            {payments && payments.length > 0 ? 'Thanh toán ngay' : 'Nhập mã thanh toán'}
          </Button>
        </Space>
      </Content>
    </Layout>
  );
}

export default SettingPage;