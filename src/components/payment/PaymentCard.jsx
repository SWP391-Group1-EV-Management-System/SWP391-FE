import React, { useState } from "react";
import {
  Modal,
  Card,
  Descriptions,
  Typography,
  Divider,
  Space,
  Button,
} from "antd";
import { useAuth } from "../../hooks/useAuth";

const { Text, Title } = Typography;

const formatCurrency = (amount) => {
  // chấp nhận 0, loại bỏ giá trị null/undefined/NaN
  if (amount == null || isNaN(Number(amount))) return '0 VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'code',
    maximumFractionDigits: 0
  }).format(Number(amount));
};

const PaymentCard = ({ visible, onClose, sessionData, onConfirm }) => {
  const { user } = useAuth(); // Lấy user để biết gói đã đăng ký
  // Chọn 1 trong 2 phương thức: 'momo' hoặc 'package'
  const [paymentMethod, setPaymentMethod] = useState("momo");

  // Lấy gói đăng ký của user (fallback 'basic' nếu không có)
  const registeredPackage =
    user?.servicePackage || user?.package || user?.registeredPackage || "basic";

  // Tính tổng tiền (luôn bằng giá gốc, không giảm)
  const calculateTotal = () => {
    return Math.round(sessionData.basePrice);
  };

  // Xử lý xác nhận thanh toán
  const handleConfirm = () => {
    const usePackage = paymentMethod === "package";
    const paymentData = {
      paymentMethod,
      usePackage,
      selectedPackage: usePackage ? registeredPackage : null,
      totalAmount: calculateTotal(),
    };
    onConfirm(paymentData);
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={600} centered>
      <Card title="💳 Thanh toán phiên sạc" style={{ border: "none" }}>
        {/* Thông tin phiên sạc */}
        <Descriptions column={1} size="small" style={{ marginBottom: "24px" }}>
          <Descriptions.Item label="Tên trạm sạc">
            {sessionData.stationName}
          </Descriptions.Item>
          <Descriptions.Item label="Mã phiên sạc">
            {sessionData.sessionId}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian sạc">
            {sessionData.duration}
          </Descriptions.Item>
          <Descriptions.Item label="Điện năng tiêu thụ">
            {sessionData.energyConsumed} kWh
          </Descriptions.Item>
          {/* Không hiển thị chi tiết giảm giá */}
          <Descriptions.Item label="Tổng tiền thanh toán">
            <Text strong style={{ fontSize: "18px", color: "#ff4d4f" }}>
              {formatCurrency(calculateTotal())}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {/* Phương thức thanh toán - CHỌN 1 TRONG 2 (bỏ nút tròn) */}
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Button
            type={paymentMethod === "momo" ? "primary" : "default"}
            block
            onClick={() => setPaymentMethod("momo")}
            aria-pressed={paymentMethod === "momo"}
          >
            Thanh toán với MoMo
          </Button>

          <Button
            type={paymentMethod === "package" ? "primary" : "default"}
            block
            onClick={() => setPaymentMethod("package")}
            aria-pressed={paymentMethod === "package"}
          >
            Gói dịch vụ
          </Button>
        </Space>

        <Divider />

        {/* Nút hành động */}
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onClose} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            size="large"
            style={{ backgroundColor: "#0b9459", color: "#fff" }}
          >
            Thanh toán
          </Button>
        </Space>
      </Card>
    </Modal>
  );
};

export default PaymentCard;