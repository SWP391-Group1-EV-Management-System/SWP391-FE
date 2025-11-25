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

  // Validate biển số xe: 2 số + 1-2 chữ + tối đa 6 số
  const validateLicensePlate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập biển số xe!"));
    }
    
    // Pattern: 2 số đầu + 1-2 chữ cái + 1-6 số
    const licensePlatePattern = /^\d{2}[A-Z]{1,2}\d{1,6}$/;
    
    if (!licensePlatePattern.test(value.toUpperCase())) {
      return Promise.reject(
        new Error("Biển số xe không hợp lệ!")
      );
    }
    
    return Promise.resolve();
  };

  // Validate số khung: 17 ký tự, không chứa I, O, Q
  const validateChassisNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập số khung!"));
    }
    
    // Kiểm tra độ dài
    if (value.length !== 17) {
      return Promise.reject(new Error("Số khung phải có đúng 17 ký tự!"));
    }
    
    // Kiểm tra chỉ chứa chữ và số
    const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!validPattern.test(value)) {
      return Promise.reject(
        new Error("Số khung không hợp lệ!")
      );
    }
    
    return Promise.resolve();
  };

  // Tự động chuyển số khung thành chữ hoa
  const handleChassisNumberChange = (e) => {
    const upperValue = e.target.value.toUpperCase();
    form.setFieldValue('chassisNumber', upperValue);
  };

  // Tự động chuyển biển số xe thành chữ hoa
  const handleLicensePlateChange = (e) => {
    const upperValue = e.target.value.toUpperCase();
    form.setFieldValue('licensePlate', upperValue);
  };

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
          rules={[{ validator: validateLicensePlate }]}
        >
          <Input 
            placeholder="Nhập biển số xe (VD: 12A12345 hoặc 12AA12345)" 
            maxLength={10}
            onChange={handleLicensePlateChange}
          />
        </Form.Item>

        <Form.Item
          name="chassisNumber"
          label="Số khung"
          rules={[{ validator: validateChassisNumber }]}
        >
          <Input 
            placeholder="Nhập số khung (17 ký tự)" 
            maxLength={17}
            onChange={handleChassisNumberChange}
          />
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
