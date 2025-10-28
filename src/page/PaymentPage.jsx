import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Layout, notification, Spin } from 'antd';
import PaymentCard from '../components/payment/PaymentCard';
import ConfirmPaymentModal from '../components/payment/ConfirmPaymentModal';
import { usePaymentData, usePayment } from '../hooks/usePayment';

const { Content } = Layout;

function PaymentPage() {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  
  // Hooks
  const { fetchPaymentById, loading: fetchLoading } = usePaymentData();
  const { createMomoPayment, processPayment, loading: actionLoading } = usePayment();

  // States
  const [paymentVisible, setPaymentVisible] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Fetch payment data khi component mount
  useEffect(() => {
    if (!paymentId) return;
    fetchPaymentById(paymentId)
      .then((data) => {
        const mappedSessionData = {
          stationName: data.chargingStationName || 'Trạm sạc',
          sessionId: data.sessionId || 'N/A',
          duration: 'N/A',
          energyConsumed: data.kwh || 0,
          basePrice: data.price || 0,
          paymentId: data.paymentId || paymentId,
        };
        setSessionData(mappedSessionData);
      })
      .catch((err) => {
        notification.error({
          message: 'Lỗi tải dữ liệu',
          description: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
        });
        setTimeout(() => navigate('/app/energy'), 2000);
      });
  }, [paymentId, fetchPaymentById, navigate]);

  // Xử lý xác nhận từ PaymentCard
  const handlePaymentConfirm = (data) => {
    setPaymentData(data);
    setPaymentVisible(false);
    setConfirmVisible(true);
  };

  // Xử lý xác nhận thanh toán
  const handleConfirmPayment = async () => {
    setConfirmVisible(false);
    try {
      if (paymentData?.paymentMethod === 'momo') await handleMomoPayment();
      else if (paymentData?.paymentMethod === 'package') await handlePackagePayment();
    } catch (err) {
      notification.error({
        message: 'Lỗi thanh toán',
        description: err.response?.data?.message || err.message || 'Không thể xử lý thanh toán.',
      });
      setPaymentVisible(true);
    }
  };

  // Xử lý thanh toán MoMo
  const handleMomoPayment = async () => {
    const orderId = `${paymentId}`;
    const amount = paymentData.totalAmount;
    const orderInfo = `Thanh toán phiên sạc - ${sessionData?.sessionId || paymentId}`;
    const momoResponse = await createMomoPayment(orderId, amount, orderInfo);
    if (momoResponse?.payUrl) {
      notification.success({ message: 'Đang chuyển đến MoMo...', duration: 2 });
      localStorage.setItem(
        'pendingPayment',
        JSON.stringify({ paymentId: orderId, amount, sessionId: sessionData?.sessionId, timestamp: Date.now() })
      );
      setTimeout(() => (window.location.href = momoResponse.payUrl), 800);
    } else {
      throw new Error('Không nhận được URL thanh toán từ MoMo');
    }
  };

  // Xử lý thanh toán bằng gói dịch vụ
  const handlePackagePayment = async () => {
    const paymentMethodId = 'PMT_PACKAGE';
    const response = await processPayment(paymentId, paymentMethodId);
    if (response === false) {
      notification.warning({ message: 'Gói dịch vụ không đủ', duration: 5 });
      setPaymentVisible(true);
    } else {
      notification.success({ message: 'Thanh toán bằng gói thành công', duration: 2 });
      setTimeout(() => navigate('/app/energy'), 1000);
    }
  };

  // Xử lý đóng PaymentCard
  const handleClosePaymentCard = () => {
    setPaymentVisible(false);
    navigate('/app/energy');
  };

  // Loading state
  if (fetchLoading || !sessionData) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Đang tải thông tin thanh toán..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <PaymentCard
          visible={paymentVisible}
          onClose={handleClosePaymentCard}
          sessionData={sessionData}
          onConfirm={handlePaymentConfirm}
        />
        
        <ConfirmPaymentModal
          visible={confirmVisible}
          onConfirm={handleConfirmPayment}
          onCancel={() => {
            setConfirmVisible(false);
            setPaymentVisible(true);
          }}
          totalAmount={paymentData ? paymentData.totalAmount : 0}
          paymentData={paymentData}
          loading={actionLoading}
        />
      </Content>
    </Layout>
  );
}

export default PaymentPage;