import React from 'react'; // React để tạo component
import { Modal, Typography } from 'antd'; // Modal từ Ant Design cho popup, Typography cho component Text

const { Text } = Typography;

const ConfirmPaymentModal = ({ 
  visible, 
  onConfirm, 
  onCancel, 
  totalAmount 
}) => {
  // Không sử dụng hooks - component không trạng thái dựa trên props
  // Lý do: Dialog xác nhận đơn giản, trạng thái được quản lý bởi component cha
  // Đề xuất: Không cần trích xuất hooks vì tối giản
  // Thay đổi API: prop onConfirm nên được cập nhật trong cha để gọi API thanh toán thay vì logic mock

  return (
    <Modal
      title="Xác nhận thanh toán"
      open={visible}
      onOk={onConfirm} // onOk gọi prop onConfirm - khi API, nên kích hoạt gọi API thanh toán trong cha
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Hủy"
    > {/* Modal từ Antd cho dialog xác nhận */}
      <p>Bạn có chắc chắn muốn xác nhận thanh toán cho phiên sạc này không?</p>
      <Text strong>Tổng tiền: {totalAmount.toLocaleString('vi-VN')} VNĐ</Text> {/* Hiển thị totalAmount từ prop - đảm bảo prop được truyền chính xác từ cha, có thể fetch từ API */}
    </Modal>
  );
};

export default ConfirmPaymentModal;
