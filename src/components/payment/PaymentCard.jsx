import React, { useState } from "react";
import { Modal, Card, Descriptions, Typography, Divider, Space, Button } from "antd";
import { useAuth } from "../../hooks/useAuth";

const { Text, Title } = Typography;

// Thông tin các gói dịch vụ
const packageInfo = {
  basic: {
    name: "Gói cơ bản",
  },
  standard: {
    name: "Gói tiêu chuẩn",
  },
  premium: {
    name: "Gói cao cấp",
  },
  vip: {
    name: "Gói VIP",
  },
};

const PaymentCard = ({ visible, onClose, sessionData, onConfirm }) => {
  const { user } = useAuth();
  // Phương thức thanh toán: momo, package, hoặc cash
  const [paymentMethod, setPaymentMethod] = useState("momo");

  // Lấy gói dịch vụ đã đăng ký của user
  const registeredPackage = user?.servicePackage || user?.package || user?.registeredPackage || "basic";

  // Tính tổng tiền thanh toán
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
      packageInfo: usePackage ? packageInfo[registeredPackage] : null,
      totalAmount: calculateTotal(),
    };
    onConfirm(paymentData);
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={600} centered>
      <Card title="💳 Thanh toán phiên sạc" style={{ border: "none" }}>
        {/* Thông tin phiên sạc */}
        <Descriptions column={1} size="small" style={{ marginBottom: "24px" }}>
          <Descriptions.Item label="Tên trạm sạc">{sessionData.stationName}</Descriptions.Item>
          <Descriptions.Item label="Mã phiên sạc">{sessionData.sessionId}</Descriptions.Item>
          <Descriptions.Item label="Điện năng tiêu thụ">{sessionData.energyConsumed} kWh</Descriptions.Item>
          {/* Không hiển thị chi tiết giảm giá */}
          <Descriptions.Item label="Tổng tiền thanh toán">
            <Text strong style={{ fontSize: "18px", color: "#ff4d4f" }}>
              {calculateTotal().toLocaleString("vi-VN")} VNĐ
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {/* Chọn phương thức thanh toán */}
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Thanh toán qua MoMo */}
          <Button
            type={paymentMethod === "momo" ? "primary" : "default"}
            block
            onClick={() => setPaymentMethod("momo")}
            aria-pressed={paymentMethod === "momo"}
          >
            Thanh toán với MoMo
          </Button>

          {/* Thanh toán bằng gói dịch vụ */}
          <Button
            type={paymentMethod === "package" ? "primary" : "default"}
            block
            onClick={() => setPaymentMethod("package")}
            aria-pressed={paymentMethod === "package"}
          >
            Gói dịch vụ
          </Button>

          {/* Thanh toán tiền mặt */}
          <Button
            type={paymentMethod === "cash" ? "primary" : "default"}
            block
            onClick={() => setPaymentMethod("cash")}
            aria-pressed={paymentMethod === "cash"}
          >
            Thanh toán tiền mặt (tại quầy)
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
