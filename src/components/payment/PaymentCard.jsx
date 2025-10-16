import React, { useState } from 'react';
import { Modal, Card, Descriptions, Typography, Divider, Space, Radio, Checkbox, Select, Button, message } from 'antd';

const { Text, Title } = Typography;

const PaymentCard = ({
  visible,
  onClose,
  sessionData,
  onConfirm,
  onCashConfirm // Thêm callback xác nhận tiền mặt từ nhân viên
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [usePackage, setUsePackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [waitingStaff, setWaitingStaff] = useState(false);

  // Giảm giá gói tĩnh - khi tích hợp API, fetch từ API bằng useEffect
  const packageDiscounts = {
    basic: { name: 'Gói cơ bản (Basic)', discount: 0 },
    member: { name: 'Gói thành viên (Member)', discount: 0.05 },
    business: { name: 'Gói doanh nghiệp (Business)', discount: 0.10 }
  };

  const calculateTotal = () => {
    let total = sessionData.basePrice;
    if (usePackage && selectedPackage) {
      const discount = packageDiscounts[selectedPackage].discount;
      total = total * (1 - discount);
    }
    return total;
  };

  // Xử lý xác nhận thanh toán
  const handleConfirm = () => {
    const paymentData = {
      paymentMethod,
      usePackage,
      selectedPackage,
      packageInfo: selectedPackage ? packageDiscounts[selectedPackage] : null,
      totalAmount: calculateTotal()
    };
    if (paymentMethod === 'cash') {
      setWaitingStaff(true); // Chỉ hiện modal chờ nhân viên khi chọn tiền mặt
      if (onCashConfirm) onCashConfirm(paymentData);
      return;
    }
    if (paymentMethod === 'momo') {
      // Chỉ gọi xác nhận, KHÔNG hiện modal chờ nhân viên
      onConfirm(paymentData);
    }
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        centered
      >
        <Card title="💳 Thanh toán phiên sạc" variant="borderless">
          <Descriptions column={1} size="small" style={{ marginBottom: '24px' }}>
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

          <Divider />

          {/* Lựa chọn phương thức thanh toán */}
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>Chọn phương thức thanh toán</Title>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="cash">💵 Tiền mặt</Radio>
                  <Radio value="momo">🟣 Momo</Radio>
                </Space>
              </Radio.Group>

              {/* Đã bỏ phần chuyển khoản ngân hàng */}
              {/* Nếu cần tích hợp lại, thêm Radio value="transfer" và component QR tại đây */}

              {paymentMethod === 'momo' && (
                <div style={{ marginTop: '16px', textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  {/* TODO: Gắn component của Momo tại đây */}
                  {/* Chỗ này sẽ được thay bằng component Momo khi tích hợp */}
                  <Text style={{ display: 'block', marginTop: '12px', color: '#a020f0' }}>
                    Tích hợp Momo tại đây
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
              >
                Sử dụng gói dịch vụ
              </Checkbox>

              {usePackage && (
                <Select
                  placeholder="Chọn gói dịch vụ"
                  style={{ width: '100%', marginTop: '12px' }}
                  value={selectedPackage}
                  onChange={setSelectedPackage}
                >
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
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleConfirm}>
              Xác nhận thanh toán
            </Button>
          </Space>
        </Card>
      </Modal>
      {/* Modal chờ nhân viên xác nhận thanh toán tiền mặt */}
      <Modal
        open={waitingStaff}
        footer={null}
        centered
        onCancel={() => setWaitingStaff(false)}
      >
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <Title level={4}>Đang chờ nhân viên xác nhận thanh toán...</Title>
          <Text>Vui lòng thanh toán trực tiếp cho nhân viên trạm. Sau khi nhân viên xác nhận, biên lai sẽ được hiển thị.</Text>
          <div style={{ marginTop: '24px' }}>
            <Button type="primary" onClick={() => setWaitingStaff(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentCard;
