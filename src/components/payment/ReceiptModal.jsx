import React from 'react'; // React để tạo component
import { Modal, Card, Descriptions, Typography, Space, Button } from 'antd'; // Các component Ant Design cho UI
import { CheckCircleOutlined } from '@ant-design/icons'; // Icon cho chỉ báo thành công

const { Text } = Typography;

const ReceiptModal = ({ 
  visible, 
  onClose, 
  receiptData 
}) => {
  // Không sử dụng hooks - component không trạng thái hiển thị dữ liệu biên lai qua props
  // Lý do: Biên lai chỉ đọc, dữ liệu được truyền từ cha sau thanh toán
  // Đề xuất: Không cần trích xuất hooks vì chỉ hiển thị
  // Thay đổi API: prop receiptData nên được điền từ phản hồi API sau thanh toán, đảm bảo tất cả trường được ánh xạ chính xác

  if (!receiptData) return null; // Trả về sớm nếu không có dữ liệu để tránh lỗi

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}> {/* Nút đóng trong footer */}
          Đóng
        </Button>
      ]}
      width={600}
      centered
    > {/* Modal từ Antd cho hiển thị biên lai */}
      <Card 
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} /> {/* Icon thành công */}
            <span>🧾 Biên lai thanh toán</span>
          </Space>
        }
        variant="borderless"
      > {/* Card cho nội dung biên lai có cấu trúc */}
        <Descriptions column={1} bordered size="small"> {/* Descriptions cho cặp key-value chi tiết */}
          <Descriptions.Item label="Mã biên lai">{receiptData.receiptId}</Descriptions.Item>
          <Descriptions.Item label="Tên trạm">{receiptData.stationName}</Descriptions.Item>
          <Descriptions.Item label="Mã phiên sạc">{receiptData.sessionId}</Descriptions.Item>
          <Descriptions.Item label="Thời gian sạc">{receiptData.duration}</Descriptions.Item>
          <Descriptions.Item label="Số điện tiêu thụ">{receiptData.energyConsumed} kWh</Descriptions.Item>
          <Descriptions.Item label="Gói dịch vụ">{receiptData.packageName}</Descriptions.Item>
          {receiptData.discount > 0 && (
            <Descriptions.Item label="Giảm giá">{receiptData.discount}%</Descriptions.Item>
          )}
          <Descriptions.Item label="Tổng tiền">
            <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
              {receiptData.totalAmount.toLocaleString('vi-VN')} VNĐ
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">{receiptData.paymentMethod}</Descriptions.Item>
          <Descriptions.Item label="Ngày giờ thanh toán">{receiptData.paymentDate}</Descriptions.Item>
        </Descriptions>
        
        <div style={{ marginTop: '24px', textAlign: 'center', padding: '16px', backgroundColor: '#f6ffed', borderRadius: '8px' }}>
          <Text type="success" strong>Cảm ơn bạn đã sử dụng dịch vụ!</Text> {/* Thông điệp cảm ơn */}
        </div>
      </Card>
    </Modal>
  );
};

export default ReceiptModal;
