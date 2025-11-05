import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Form, Select, message, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const VehicleRegistrationForm = ({ isOpen, onClose, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();
  const [detectingCharging, setDetectingCharging] = useState(false);
  const [carNameValue, setCarNameValue] = useState("");

  // Set giá trị form khi mở modal
  useEffect(() => {
    if (isOpen && initialValues) {
      form.setFieldsValue(initialValues);
      setCarNameValue(initialValues.typeCar || "");
    } else if (isOpen) {
      form.resetFields();
      setCarNameValue("");
    }
  }, [isOpen, initialValues, form]);

  // Theo dõi thay đổi loại xe
  const handleCarNameChange = (e) => {
    setCarNameValue(e.target.value);
  };

  // Hàm gọi API Python để tìm loại sạc bằng AI
  const detectChargingType = async () => {
    const carName = form.getFieldValue("typeCar");

    if (!carName || carName.trim().length < 3) {
      message.warning("Vui lòng nhập tên loại xe (ít nhất 3 ký tự)");
      return;
    }

    setDetectingCharging(true);

    try {
      // Thay đổi URL này thành URL backend Python của bạn
      const response = await fetch("http://localhost:8000/api/detect-charging-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          car_name: carName.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        const chargingTypeData = result.data;

        // Map charging type từ string sang số (1: CCS, 2: CHAdeMO, 3: AC)
        const chargingTypeMap = {
          CCS: 1,
          CHAdeMO: 2,
          AC: 3,
        };

        const chargingTypeValue = chargingTypeMap[chargingTypeData.charging_type] || null;

        if (chargingTypeValue) {
          // Tự động điền vào select
          form.setFieldsValue({ chargingType: chargingTypeValue });

          message.success({
            content: (
              <div>
                <div>
                  <strong>✅ Tìm thấy loại sạc: {chargingTypeData.charging_type}</strong>
                </div>
                <div style={{ fontSize: "12px", marginTop: "5px" }}>{chargingTypeData.explanation}</div>
              </div>
            ),
            duration: 5,
          });
        }
      } else if (response.status === 404) {
        message.error({
          content: `❌ Không thể xác định loại xe "${carName}". Xe không tồn tại hoặc không tìm thấy thông tin. Vui lòng chọn loại sạc thủ công.`,
          duration: 4,
        });
      } else {
        throw new Error(result.detail || "Không thể tìm loại sạc");
      }
    } catch (error) {
      console.error("Error detecting charging type:", error);
      message.error({
        content: "❌ Không thể kết nối đến hệ thống AI. Vui lòng chọn loại sạc thủ công.",
        duration: 3,
      });
    } finally {
      setDetectingCharging(false);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Đảm bảo chargingType là số
      const processedValues = {
        ...values,
        chargingType: values.chargingType,
      };

      onSubmit(processedValues);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Đóng modal
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      title={
        <div
          style={{
            fontSize: "26px",
            fontWeight: "bold",
            color: "#333",
            letterSpacing: "0.025em",
            justifyContent: "center",
            display: "flex",
            marginBottom: "20px",
            padding: "0",
            borderRadius: "8px",
          }}
        >
          {isEditing ? "Cập nhật xe" : "Đăng ký xe"}
        </div>
      }
    >
      <Form form={form} layout="vertical" size="large">
        <Form.Item
          name="licensePlate"
          label="Biển số xe"
          rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
        >
          <Input placeholder="Nhập biển số xe" />
        </Form.Item>

        <Form.Item name="typeCar" label="Loại xe" rules={[{ required: true, message: "Vui lòng nhập loại xe!" }]}>
          <Input placeholder="Nhập loại xe (VD: VinFast VF5, Tesla Model 3)" onChange={handleCarNameChange} />
        </Form.Item>

        <Form.Item
          name="chassisNumber"
          label="Số khung"
          rules={[{ required: true, message: "Vui lòng nhập số khung!" }]}
        >
          <Input placeholder="Nhập số khung" />
        </Form.Item>

        <Form.Item
          name="chargingType"
          label={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Loại sạc</span>
              {carNameValue && carNameValue.trim().length >= 3 && (
                <Button
                  type="link"
                  icon={<SearchOutlined />}
                  onClick={detectChargingType}
                  loading={detectingCharging}
                  style={{
                    padding: "0 8px",
                    fontSize: "13px",
                    color: "#0b9459",
                  }}
                >
                  {detectingCharging ? "Đang tìm..." : "🤖 Tìm bằng AI"}
                </Button>
              )}
            </div>
          }
          rules={[{ required: true, message: "Vui lòng chọn loại sạc!" }]}
        >
          <Select placeholder="Chọn loại sạc (thủ công hoặc dùng AI)" disabled={detectingCharging}>
            <Select.Option value={1}>CCS</Select.Option>
            <Select.Option value={2}>CHAdeMO</Select.Option>
            <Select.Option value={3}>AC</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleSubmit}
            block
            size="large"
            style={{ backgroundColor: "#0b9459", color: "#fff" }}
          >
            {isEditing ? "Cập nhật xe" : "Đăng ký xe"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleRegistrationForm;
