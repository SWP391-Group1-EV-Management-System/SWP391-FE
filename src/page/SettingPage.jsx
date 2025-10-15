import React, { useState } from "react"; // React hooks để quản lý trạng thái
import { Button, Layout, Typography, notification } from 'antd'; // Các component Ant Design và notification cho phản hồi UI
import PaymentCard from '../components/payment/PaymentCard';
import ConfirmPaymentModal from '../components/payment/ConfirmPaymentModal';
import ReceiptModal from '../components/payment/ReceiptModal';

const { Content } = Layout;
const { Title } = Typography;

function SettingPage() {
  // useState hooks để quản lý khả năng hiển thị modal và luồng dữ liệu thanh toán
  // Lý do: Để kiểm soát trình tự các modal và truyền dữ liệu giữa chúng
  // Đề xuất: Trích xuất thành custom hook như usePaymentFlow để quản lý trạng thái wizard thanh toán
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Dữ liệu phiên mock - khi tích hợp API, fetch từ API dựa trên session ID
  // Thay đổi API: Thay thế bằng gọi API, ví dụ: useEffect để fetch sessionData khi mount hoặc khi sessionId thay đổi
  const mockSessionData = {
    stationName: 'Trạm sạc ABC',
    sessionId: 'SES123456',
    duration: '2 giờ 30 phút',
    energyConsumed: 15.5,
    basePrice: 150000
  };

  // handlePaymentConfirm - được gọi khi người dùng xác nhận trong PaymentCard
  // Lý do: Để chuyển sang modal xác nhận và lưu trữ dữ liệu thanh toán
  // Thay đổi API: Không cần thay đổi, vì dữ liệu cục bộ
  const handlePaymentConfirm = (data) => {
    setPaymentData(data);
    setPaymentVisible(false);
    setConfirmVisible(true);
  };

  // handleConfirmPayment - được gọi khi người dùng xác nhận trong ConfirmPaymentModal
  // Lý do: Để xử lý thanh toán, hiển thị thông báo, và hiển thị biên lai
  // Thay đổi API: Thay thế console.log và mock biên lai bằng gọi API thực để xử lý thanh toán và lấy dữ liệu biên lai
  const handleConfirmPayment = () => {
    // Xử lý thanh toán ở đây
    console.log('Payment processed:', paymentData);
    notification.success({ message: 'Thanh toán thành công' });
    setConfirmVisible(false);
    // Dữ liệu biên lai mock - khi API, lấy từ phản hồi thanh toán
    // Thay đổi API: Fetch receiptData từ phản hồi API thay vì mock
    const receiptData = {
      receiptId: 'REC' + Date.now(),
      stationName: mockSessionData.stationName,
      sessionId: mockSessionData.sessionId,
      duration: mockSessionData.duration,
      energyConsumed: mockSessionData.energyConsumed,
      packageName: paymentData.packageInfo ? paymentData.packageInfo.name : 'Không có',
      discount: paymentData.packageInfo ? paymentData.packageInfo.discount * 100 : 0,
      totalAmount: paymentData.totalAmount,
      paymentMethod: paymentData.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
      paymentDate: new Date().toLocaleString('vi-VN')
    };
    setPaymentData({ ...paymentData, receiptData });
    setReceiptVisible(true);
  };

  // handleCloseReceipt - được gọi khi đóng modal biên lai
  // Lý do: Để reset trạng thái sau khi biên lai được đóng
  // Thay đổi API: Không cần thay đổi
  const handleCloseReceipt = () => {
    setReceiptVisible(false);
    setPaymentData(null);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}> {/* Layout từ Antd cho cấu trúc trang */}
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Settings Page</Title>
        <Button type="primary" onClick={() => setPaymentVisible(true)}> {/* Nút kích hoạt luồng thanh toán */}
          Thanh toán
        </Button>
        <PaymentCard
          visible={paymentVisible}
          onClose={() => setPaymentVisible(false)}
          sessionData={mockSessionData}
          onConfirm={handlePaymentConfirm}
        />
        <ConfirmPaymentModal
          visible={confirmVisible}
          onConfirm={handleConfirmPayment}
          onCancel={() => setConfirmVisible(false)}
          totalAmount={paymentData ? paymentData.totalAmount : 0}
        />
        <ReceiptModal
          visible={receiptVisible}
          onClose={handleCloseReceipt}
          receiptData={paymentData ? paymentData.receiptData : null}
        />
      </Content>
    </Layout>
  );
}

export default SettingPage;
