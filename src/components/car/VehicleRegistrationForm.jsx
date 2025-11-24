import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Form, Select } from "antd";
import useCar from "../../hooks/useCar";

// Map tên loại cổng sạc sang ID
const CHARGING_TYPE_IDS = {
  'CCS': 1,
  'CHAdeMO': 2,
  'AC': 3,
  'NACS': 4,
};

const VehicleRegistrationForm = ({ isOpen, onClose, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();
  const [selectedChargingType, setSelectedChargingType] = useState("");
  
  // Lấy danh sách xe có sẵn từ database
  const { carDataList, loading: loadingCarData, fetchAllCarData } = useCar();

  // Load danh sách xe khi mở modal
  useEffect(() => {
    if (isOpen) {
      fetchAllCarData();
    }
  }, [isOpen, fetchAllCarData]);

  // Set giá trị form khi mở modal (chế độ edit)
  useEffect(() => {
    if (isOpen && initialValues) {
      form.setFieldsValue(initialValues);
      
      // Tìm tên charging type từ ID
      const chargingTypeName = Object.keys(CHARGING_TYPE_IDS).find(
        key => CHARGING_TYPE_IDS[key] === initialValues.chargingType
      );
      setSelectedChargingType(chargingTypeName || "");
    } else if (isOpen) {
      form.resetFields();
      setSelectedChargingType("");
    }
  }, [isOpen, initialValues, form]);

  // Xử lý khi chọn xe từ dropdown
  const handleCarSelect = (carDataId) => {
    const selectedCar = carDataList.find(car => car.carDataId === carDataId);
    if (selectedCar) {
      const chargingTypeId = CHARGING_TYPE_IDS[selectedCar.chargingType] || 1;
      
      // Fill typeCar (tên xe) và chargingType (loại cổng sạc)
      form.setFieldsValue({ 
        typeCar: selectedCar.carName,
        chargingType: chargingTypeId 
      });
      
      setSelectedChargingType(selectedCar.chargingType);
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
      setSelectedChargingType("");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Đóng modal
  const handleCancel = () => {
    form.resetFields();
    setSelectedChargingType("");
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
          name="typeCar"
          label="Tên xe"
          rules={[{ required: true, message: "Vui lòng chọn tên xe!" }]}
        >
          <Select
            placeholder="Chọn tên xe"
            loading={loadingCarData}
            onChange={handleCarSelect}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {carDataList.map(car => (
              <Select.Option key={car.carDataId} value={car.carDataId}>
                {car.carName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="licensePlate"
          label="Biển số xe"
          rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
        >
          <Input placeholder="Nhập biển số xe (VD: 30A-12345)" />
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
          label="Loại cổng sạc"
          rules={[{ required: true, message: "Vui lòng chọn loại cổng sạc!" }]}
        >
          <Select 
            placeholder="Loại cổng sạc sẽ tự động được chọn" 
            disabled
          >
            <Select.Option value={1}>CCS</Select.Option>
            <Select.Option value={2}>CHAdeMO</Select.Option>
            <Select.Option value={3}>AC</Select.Option>
            <Select.Option value={4}>NACS</Select.Option>
          </Select>
        </Form.Item>

        {selectedChargingType && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: '#e6f7ff', 
            borderRadius: 8, 
            border: '1px solid #91d5ff',
            textAlign: 'center'
          }}>
            <strong>✅ Loại cổng sạc:</strong>{' '}
            <span style={{ color: '#0b9459', fontWeight: 'bold', fontSize: '16px' }}>
              {selectedChargingType}
            </span>
          </div>
        )}

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
