import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Form, Select } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import useCar from "../../hooks/useCar";
import useUser from "../../hooks/useUser";

const { TextArea } = Input;

// Map tên loại cổng sạc sang ID
const CHARGING_TYPE_IDS = {
  'CCS': 1,
  'CHAdeMO': 2,
  'AC': 3,
  'NACS': 4,
};

// Yup validation schema
const reportValidationSchema = Yup.object({
  olderOwnerId: Yup.string()
    .required("Vui lòng chọn chủ cũ!"),
  newerOwnerId: Yup.string()
    .required("Vui lòng chọn chủ mới!"),
  title: Yup.string()
    .required("Vui lòng nhập tiêu đề báo cáo!")
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(100, "Tiêu đề không được quá 100 ký tự"),
  content: Yup.string()
    .required("Vui lòng nhập nội dung báo cáo!")
    .min(10, "Nội dung phải có ít nhất 10 ký tự")
    .max(500, "Nội dung không được quá 500 ký tự"),
  licensePlate: Yup.string()
    .required("Vui lòng nhập biển số xe!")
    .matches(
      /^\d{2}[A-Z]{1,2}\d{1,6}$/,
      "Biển số xe không hợp lệ! (VD: 29A12345)"
    ),
  typeCar: Yup.string().required("Vui lòng chọn loại xe!"),
  chassisNumber: Yup.string()
    .required("Vui lòng nhập số khung!")
    .length(17, "Số khung phải có đúng 17 ký tự!")
    .matches(
      /^[A-HJ-NPR-Z0-9]{17}$/i,
      "Số khung không hợp lệ! (không chứa I, O, Q)"
    ),
  chargeType: Yup.number()
    .required("Vui lòng chọn loại cổng sạc!")
    .oneOf([1, 2, 3, 4], "Loại cổng sạc không hợp lệ"),
});

const ReportForm = ({ isOpen, onClose, onSubmit }) => {
  const [selectedChargingType, setSelectedChargingType] = useState("");
  
  // Lấy danh sách xe có sẵn từ database
  const { carDataList, loading: loadingCarData, fetchAllCarData } = useCar();
  
  // Lấy danh sách drivers
  const { users: drivers, loading: loadingDrivers } = useUser('Driver');

  // Load danh sách xe và drivers khi mở modal
  useEffect(() => {
    if (isOpen) {
      fetchAllCarData();
    }
  }, [isOpen, fetchAllCarData]);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      olderOwnerId: "",
      newerOwnerId: "",
      title: "",
      content: "",
      licensePlate: "",
      typeCar: "",
      chassisNumber: "",
      chargeType: "",
    },
    validationSchema: reportValidationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        formik.resetForm();
        setSelectedChargingType("");
      } catch (error) {
        console.error("Lỗi khi submit form:", error);
      }
    },
  });

  // Xử lý khi chọn xe từ dropdown
  const handleCarSelect = (carDataId) => {
    const selectedCar = carDataList.find(car => car.carDataId === carDataId);
    if (selectedCar) {
      const chargingTypeId = CHARGING_TYPE_IDS[selectedCar.chargingType] || 1;
      
      // Fill typeCar (tên xe) và chargeType (loại cổng sạc)
      formik.setFieldValue('typeCar', selectedCar.carName);
      formik.setFieldValue('chargeType', chargingTypeId);
      
      setSelectedChargingType(selectedCar.chargingType);
    }
  };

  // Tự động chuyển biển số xe thành chữ hoa
  const handleLicensePlateChange = (e) => {
    const upperValue = e.target.value.toUpperCase();
    formik.setFieldValue('licensePlate', upperValue);
  };

  // Tự động chuyển số khung thành chữ hoa
  const handleChassisNumberChange = (e) => {
    const upperValue = e.target.value.toUpperCase();
    formik.setFieldValue('chassisNumber', upperValue);
  };

  // Đóng modal và reset form
  const handleCancel = () => {
    formik.resetForm();
    setSelectedChargingType("");
    onClose();
  };

  // Tạo tên đầy đủ cho driver (firstName + lastName)
  const getDriverFullName = (driver) => {
    return `${driver.firstName} ${driver.lastName}`.trim();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
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
          Tạo báo cáo chuyển xe
        </div>
      }
    >
      <Form layout="vertical" size="large" onFinish={formik.handleSubmit}>
        {/* Chủ cũ - Dropdown chọn driver */}
        <Form.Item
          label="Chủ cũ"
          validateStatus={formik.touched.olderOwnerId && formik.errors.olderOwnerId ? "error" : ""}
          help={formik.touched.olderOwnerId && formik.errors.olderOwnerId}
        >
          <Select
            placeholder="Chọn chủ cũ"
            loading={loadingDrivers}
            value={formik.values.olderOwnerId || undefined}
            onChange={(value) => formik.setFieldValue('olderOwnerId', value)}
            onBlur={() => formik.setFieldTouched('olderOwnerId', true)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {drivers.map(driver => (
              <Select.Option key={driver.id} value={driver.id}>
                {getDriverFullName(driver)} ({driver.id})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Chủ mới - Dropdown chọn driver */}
        <Form.Item
          label="Chủ mới"
          validateStatus={formik.touched.newerOwnerId && formik.errors.newerOwnerId ? "error" : ""}
          help={formik.touched.newerOwnerId && formik.errors.newerOwnerId}
        >
          <Select
            placeholder="Chọn chủ mới"
            loading={loadingDrivers}
            value={formik.values.newerOwnerId || undefined}
            onChange={(value) => formik.setFieldValue('newerOwnerId', value)}
            onBlur={() => formik.setFieldTouched('newerOwnerId', true)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {drivers.map(driver => (
              <Select.Option key={driver.id} value={driver.id}>
                {getDriverFullName(driver)} ({driver.id})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Tiêu đề */}
        <Form.Item
          label="Tiêu đề"
          validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
          help={formik.touched.title && formik.errors.title}
        >
          <Input
            name="title"
            placeholder="Nhập tiêu đề báo cáo"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Nội dung */}
        <Form.Item
          label="Nội dung"
          validateStatus={formik.touched.content && formik.errors.content ? "error" : ""}
          help={formik.touched.content && formik.errors.content}
        >
          <TextArea
            name="content"
            placeholder="Nhập nội dung báo cáo"
            rows={4}
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Tên xe */}
        <Form.Item
          label="Tên xe"
          validateStatus={formik.touched.typeCar && formik.errors.typeCar ? "error" : ""}
          help={formik.touched.typeCar && formik.errors.typeCar}
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

        {/* Biển số xe */}
        <Form.Item
          label="Biển số xe"
          validateStatus={formik.touched.licensePlate && formik.errors.licensePlate ? "error" : ""}
          help={formik.touched.licensePlate && formik.errors.licensePlate}
        >
          <Input
            name="licensePlate"
            placeholder="Nhập biển số xe (VD: 29A12345)"
            maxLength={10}
            value={formik.values.licensePlate}
            onChange={handleLicensePlateChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Số khung */}
        <Form.Item
          label="Số khung"
          validateStatus={formik.touched.chassisNumber && formik.errors.chassisNumber ? "error" : ""}
          help={formik.touched.chassisNumber && formik.errors.chassisNumber}
        >
          <Input
            name="chassisNumber"
            placeholder="Nhập số khung (17 ký tự)"
            maxLength={17}
            value={formik.values.chassisNumber}
            onChange={handleChassisNumberChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Loại cổng sạc */}
        <Form.Item
          label="Loại cổng sạc"
          validateStatus={formik.touched.chargeType && formik.errors.chargeType ? "error" : ""}
          help={formik.touched.chargeType && formik.errors.chargeType}
        >
          <Select
            placeholder="Loại cổng sạc sẽ tự động được chọn"
            disabled
            value={formik.values.chargeType || undefined}
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

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ backgroundColor: "#0b9459", color: "#fff" }}
            loading={formik.isSubmitting}
          >
            Tạo báo cáo
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportForm;
