import React, { useState } from 'react'; // React hooks để quản lý trạng thái
import { Modal, Card, Descriptions, Typography, Divider, Space, Radio, Checkbox, Select, Button } from 'antd'; // Các component Ant Design cho UI
// import QRCode from 'qrcode.react'; // Đã comment vì thư viện QRCode chưa được cài đặt, thay thế bằng QR code thực khi có

const { Text, Title } = Typography;

const PaymentCard = ({ 
  visible, 
  onClose, 
  sessionData, 
  onConfirm 
}) => {
  // useState hooks để quản lý lựa chọn của người dùng: phương thức thanh toán, sử dụng gói, và gói đã chọn
  // Lý do: Trạng thái cục bộ để xử lý đầu vào form mà không ảnh hưởng đến component cha
  // Đề xuất: Trích xuất thành custom hook như usePaymentFormState để tái sử dụng
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [usePackage, setUsePackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Giảm giá gói tĩnh - khi tích hợp API, fetch từ API bằng useEffect
  // Thay đổi API: Thay thế bằng trạng thái fetch từ API, ví dụ: const [packageDiscounts, setPackageDiscounts] = useState([]);
  const packageDiscounts = {
    basic: { name: 'Gói cơ bản (Basic)', discount: 0 },
    member: { name: 'Gói thành viên (Member)', discount: 0.05 },
    business: { name: 'Gói doanh nghiệp (Business)', discount: 0.10 }
  };

  // Hàm calculateTotal - hàm thuần túy để tính tổng dựa trên lựa chọn
  // Lý do: Giữ logic tính toán riêng biệt và có thể test được
  // Không cần thay đổi cho API, vì sử dụng dữ liệu cục bộ
  const calculateTotal = () => {
    let total = sessionData.basePrice;
    if (usePackage && selectedPackage) {
      const discount = packageDiscounts[selectedPackage].discount;
      total = total * (1 - discount);
    }
    return total;
  };

  // handleConfirm - chuẩn bị dữ liệu thanh toán và gọi onConfirm prop
  // Lý do: Để đóng gói logic chuẩn bị dữ liệu
  // Thay đổi API: Nếu cần validation, thêm gọi API ở đây trước khi gọi onConfirm
  const handleConfirm = () => {
    const paymentData = {
      paymentMethod,
      usePackage,
      selectedPackage,
      packageInfo: selectedPackage ? packageDiscounts[selectedPackage] : null,
      totalAmount: calculateTotal()
    };
    onConfirm(paymentData);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    > {/* Modal từ Antd cho popup UI, centered để UX tốt hơn */}
      <Card title="💳 Thanh toán phiên sạc" variant="borderless"> {/* Card cho nội dung có cấu trúc, variant="borderless" để bỏ viền */}
        <Descriptions column={1} size="small" style={{ marginBottom: '24px' }}> {/* Descriptions để hiển thị key-value của dữ liệu phiên */}
          <Descriptions.Item label="Tên trạm sạc">{sessionData.stationName}</Descriptions.Item>
          <Descriptions.Item label="Mã phiên sạc">{sessionData.sessionId}</Descriptions.Item>
          <Descriptions.Item label="Thời gian sạc">{sessionData.duration}</Descriptions.Item>
          <Descriptions.Item label="Điện năng tiêu thụ">{sessionData.energyConsumed} kWh</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền tạm tính">
            <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
              {calculateTotal().toLocaleString('vi-VN')} VNĐ
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider /> {/* Divider để phân tách phần */}

        {/* Lựa chọn phương thức thanh toán */}
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>Chọn phương thức thanh toán</Title>
            <Radio.Group 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%' }}
            > {/* Radio.Group cho lựa chọn đơn phương thức thanh toán */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="cash">💵 Tiền mặt</Radio>
                <Radio value="transfer">💳 Chuyển khoản</Radio>
              </Space>
            </Radio.Group>

            {paymentMethod === 'transfer' && (
              <div style={{ marginTop: '16px', textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                {/* Placeholder cho QR code - khi API, tạo QR dựa trên dữ liệu thanh toán */}
                <div style={{ width: '180px', height: '180px', backgroundColor: '#ddd', display: 'inline-block', lineHeight: '180px' }}>
                  QR Code Placeholder
                </div>
                <Text style={{ display: 'block', marginTop: '12px' }}>
                  Quét mã QR để thanh toán
                </Text>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                <Text>ℹ️ Vui lòng thanh toán trực tiếp cho nhân viên trạm.</Text>
              </div>
            )}
          </div>

          {/* Lựa chọn gói */}
          <div>
            <Checkbox 
              checked={usePackage} 
              onChange={(e) => {
                setUsePackage(e.target.checked);
                if (!e.target.checked) setSelectedPackage(null);
              }}
            > {/* Checkbox cho sử dụng gói tùy chọn */}
              Sử dụng gói dịch vụ
            </Checkbox>

            {usePackage && (
              <Select
                placeholder="Chọn gói dịch vụ"
                style={{ width: '100%', marginTop: '12px' }}
                value={selectedPackage}
                onChange={setSelectedPackage}
              > {/* Select cho lựa chọn gói */}
                <Select.Option value="basic">Gói cơ bản (Basic)</Select.Option>
                <Select.Option value="member">Gói thành viên (Member) – giảm 5%</Select.Option>
                <Select.Option value="business">Gói doanh nghiệp (Business) – giảm 10%</Select.Option>
              </Select>
            )}
          </div>
        </Space>

        <Divider />

        {/* Nút hành động */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}> {/* Nút hủy */}
            Hủy
          </Button>
          <Button type="primary" onClick={handleConfirm}> {/* Nút chính xác nhận */}
            Xác nhận thanh toán
          </Button>
        </Space>
      </Card>
    </Modal>
  );
};

export default PaymentCard;
