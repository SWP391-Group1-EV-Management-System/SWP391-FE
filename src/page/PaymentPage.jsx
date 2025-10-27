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
  const { payment, fetchPaymentById, loading: fetchLoading } = usePaymentData();
  const { createMomoPayment, loading: actionLoading } = usePayment();

  // States
  const [paymentVisible, setPaymentVisible] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Fetch payment data khi component mount
  useEffect(() => {
    if (paymentId) {
      console.log('🔍 PaymentPage: Fetching payment data for ID:', paymentId);
      fetchPaymentById(paymentId)
        .then(data => {
          console.log('✅ Payment data fetched:', data);
          
          // Map data từ API sang format sessionData
          const mappedSessionData = {
            stationName: data.chargingStationName || 'Trạm sạc',
            sessionId: data.sessionId || 'N/A',
            duration: 'N/A', // API không trả về startTime/endTime
            energyConsumed: data.kwh || 0,
            basePrice: data.price || 0,
            paymentId: data.paymentId
          };
          
          setSessionData(mappedSessionData);
        })
        .catch(err => {
          console.error('❌ Error fetching payment:', err);
          notification.error({
            message: 'Lỗi tải dữ liệu',
            description: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
          });
          // Quay về trang setting nếu lỗi
          setTimeout(() => navigate('/app/setting'), 2000);
        });
    }
  }, [paymentId, fetchPaymentById, navigate]);

  // Xử lý xác nhận từ PaymentCard
  const handlePaymentConfirm = (data) => {
    console.log('💳 Payment data from PaymentCard:', data);
    
    // Kiểm tra phương thức thanh toán
    if (data.paymentMethod === 'momo') {
      setPaymentData(data);
      setPaymentVisible(false);
      setConfirmVisible(true);
    } else if (data.paymentMethod === 'package') {
      // TODO: Xử lý thanh toán bằng gói dịch vụ sau
      notification.info({
        message: 'Thanh toán bằng gói dịch vụ',
        description: 'Tính năng này đang được phát triển.',
      });
    }
  };

  // Xử lý xác nhận thanh toán MoMo
  const handleConfirmPayment = async () => {
    setConfirmVisible(false);

    try {
      // QUAN TRỌNG: Thứ tự tham số phải giống ServicePackage
      // createMomoPayment(orderId, amount, orderInfo)
      
      const orderId = `${paymentId}`;
      const amount = paymentData.totalAmount; // PHẢI LÀ SỐ, không phải string
      const orderInfo = `Thanh toán phiên sạc - ${sessionData?.sessionId || paymentId}`;

      console.log('📤 Creating MoMo payment with data:', {
        orderId,
        amount,
        orderInfo
      });

      // Gọi API với đúng thứ tự tham số: orderId, amount, orderInfo
      const momoResponse = await createMomoPayment(orderId, amount, orderInfo);
      
      console.log('✅ MoMo payment response:', momoResponse);

      // Kiểm tra response - chỉ cần có payUrl là OK
      if (momoResponse && momoResponse.payUrl) {
        notification.success({
          message: 'Tạo thanh toán MoMo thành công',
          description: 'Đang chuyển đến trang thanh toán MoMo...',
          duration: 2,
        });

        // Lưu pending payment (optional - để xử lý callback)
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: orderId,
          amount: amount,
          sessionId: sessionData?.sessionId,
          timestamp: Date.now()
        }));

        // Redirect đến MoMo payment URL sau 1 giây
        setTimeout(() => {
          console.log('🔗 Redirecting to MoMo payUrl:', momoResponse.payUrl);
          window.location.href = momoResponse.payUrl;
        }, 1000);
      } else {
        // Có lỗi từ MoMo hoặc không có payUrl
        console.error('❌ Invalid MoMo response:', momoResponse);
        throw new Error(momoResponse?.message || 'Không nhận được URL thanh toán từ MoMo');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      notification.error({
        message: 'Lỗi thanh toán',
        description: error.response?.data?.message || error.message || 'Không thể xử lý thanh toán. Vui lòng thử lại.',
      });
      // Show payment card lại
      setPaymentVisible(true);
    }
  };

  // Xử lý đóng PaymentCard
  const handleClosePaymentCard = () => {
    setPaymentVisible(false);
    navigate('/app/setting');
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