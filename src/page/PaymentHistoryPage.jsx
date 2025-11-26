// Trang lịch sử thanh toán - hiển thị danh sách thanh toán đã hoàn thành và chưa thanh toán
import React, { useEffect } from 'react';
import { Typography, Space, Spin, notification } from 'antd';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { usePaymentData } from '../hooks/usePayment';
import PaymentHistorySummary from '../components/history/PaymentHistorySummary';
import PaymentHistoryList from '../components/history/PaymentHistoryList';
import PaymentHistoryNoData from '../components/history/NoDataMessage';
import { ThunderboltOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
const { Title, Text } = Typography;

const PaymentHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { payments, loading, error, fetchPaymentsByUserId, fetchUnpaidPaymentsByUserId } = usePaymentData();

  // Tải danh sách thanh toán khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user?.id) {
      fetchPaymentsByUserId(user.id);
    }
  }, [user?.id, fetchPaymentsByUserId]);

  // Xử lý thanh toán - Lấy payment chưa thanh toán và chuyển đến trang thanh toán
  const handlePayment = async (payment) => {
    if (!user?.id) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Không tìm thấy thông tin người dùng.',
      });
      return;
    }

    try {
      // Gọi API lấy danh sách payment chưa thanh toán
      const unpaidPayments = await fetchUnpaidPaymentsByUserId(user.id);

      if (unpaidPayments && unpaidPayments.length > 0) {
        // Tìm payment tương ứng với session được chọn
        let targetPayment = unpaidPayments.find(
          p => p.sessionId === payment.sessionId || 
               p.chargingSessionId === payment.sessionId ||
               p.session?.chargingSessionId === payment.sessionId
        );

        // Nếu không tìm thấy theo sessionId, thử tìm theo paymentId
        if (!targetPayment && payment.paymentId) {
          targetPayment = unpaidPayments.find(
            p => (p.paymentId || p.id) === payment.paymentId
          );
        }

        // Nếu vẫn không tìm thấy, lấy payment đầu tiên
        if (!targetPayment) {
          targetPayment = unpaidPayments[0];
        }

        // Lấy paymentId và chuyển đến trang thanh toán
        const paymentId = targetPayment.paymentId || targetPayment.id;
        navigate(`/app/payment/${paymentId}`);
      } else {
        notification.info({
          message: 'Không có thanh toán',
          description: 'Bạn không có thanh toán nào cần hoàn thành.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
      });
    }
  };

  // Xử lý làm mới danh sách thanh toán
  const handleRefresh = () => {
    if (user?.id) {
      fetchPaymentsByUserId(user.id);
    }
  };

  // Render: Trạng thái đang tải
  if (loading) {
    return (
      <div style={{ 
        padding: '4rem', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'white'
      }}>
        <Space direction="vertical" size="large" align="center" style={{ marginTop: '1rem' }}>
          <Spin size="large" />
          <Text style={{ fontSize: '1.4rem', color: '#666' }}>
            Đang tải lịch sử thanh toán...
          </Text>
        </Space>
      </div>
    );
  }

  // Render: Trạng thái lỗi
  if (error) {
    return (
      <div style={{ 
        padding: '4rem', 
        background: 'white',
        minHeight: '60vh'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,77,79,0.2)',
          textAlign: 'center'
        }}>
          <Text style={{ fontSize: '1.4rem', color: '#ff4d4f', display: 'block', marginBottom: '1rem' }}>
            Không thể tải lịch sử thanh toán
          </Text>
          <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block', marginBottom: '2rem' }}>
            {error.message || 'Đã xảy ra lỗi'}
          </Text>
          <button
            onClick={handleRefresh}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.4rem',
              backgroundColor: '#2d8f2d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Render: Danh sách lịch sử thanh toán
  return (
    <div style={{ 
      padding: '2rem', 
      background: 'white', 
      minHeight: '100vh' 
    }}>
      {/* Header trang */}
      <PageHeader
        title="Lịch sử thanh toán"
        icon={<ThunderboltOutlined style={{ fontSize: 24 }} />}
      />

      {/* Tổng quan thống kê thanh toán */}
      {payments && payments.length > 0 && (
        <PaymentHistorySummary payments={payments} />
      )}
      
      {/* Danh sách thanh toán hoặc thông báo không có dữ liệu */}
      {payments && payments.length > 0 ? (
        <PaymentHistoryList 
          payments={payments}
          onPayment={handlePayment}
        />
      ) : (
        <PaymentHistoryNoData onRefresh={handleRefresh} />
      )}
    </div>
  );
};

export default PaymentHistoryPage;