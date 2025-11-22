import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Switch,
  Select,
} from "antd";
import { getStaff } from "../../services/userService";
import { useFormik } from "formik";
import * as Yup from "yup";

const StationForm = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
  mode = "create", // 'create', 'edit', 'view'
}) => {
  const { Option } = Select;
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setStaffLoading(true);
      try {
        const data = await getStaff();
        if (!mounted) return;
        setStaffList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load staff list", err);
        setStaffList([]);
      } finally {
        if (mounted) setStaffLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const validationSchema = Yup.object({
    nameChargingStation: Yup.string()
      .required("Vui lòng nhập tên trạm")
      .min(2, "Tên phải có ít nhất 2 ký tự")
      .max(200, "Tên không được vượt quá 200 ký tự"),
    address: Yup.string()
      .required("Vui lòng nhập địa chỉ")
      .min(5, "Địa chỉ quá ngắn")
      .max(500, "Địa chỉ quá dài"),
    // numberOfPosts is managed by backend. Validate only when editing (display only), not when creating.
    numberOfPosts:
      mode === "edit"
        ? Yup.number()
            .required("Vui lòng nhập số trụ")
            .min(0, "Số trụ phải >= 0")
            .max(1000, "Số trụ quá lớn")
        : Yup.number().notRequired(),
    userManagerId: Yup.string().required("Vui lòng chọn người quản lý"),
    active: Yup.boolean().required("Trạng thái bắt buộc"),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      nameChargingStation: "",
      address: "",
      numberOfPosts: 0,
      userManagerId: "",
      active: true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Build payload with only the fields the backend expects
      const payload = {
        nameChargingStation: values.nameChargingStation,
        address: values.address,
        userManagerId:
          values.userManagerId !== undefined && values.userManagerId !== null
            ? String(values.userManagerId)
            : "",
        active: !!values.active,
      };

      onSubmit(payload);
    },
  });

  // If initialValues provide a manager name/string instead of id, try to resolve it
  useEffect(() => {
    if (!staffLoading && staffList.length && initialValues) {
      const incomingRaw =
        initialValues.userManagerId ||
        initialValues.userManagerName ||
        initialValues.userManager ||
        "";
      const incoming =
        incomingRaw !== null && incomingRaw !== undefined
          ? String(incomingRaw).trim()
          : "";
      if (!incoming) return;

      // If incoming already matches an id in staffList (compare as strings), set it
      const foundById = staffList.find((s) => String(s.id) === incoming);
      if (foundById) {
        formik.setFieldValue("userManagerId", String(foundById.id));
        return;
      }

      // Try match by full name or email
      const foundByName = staffList.find(
        (s) => `${s.firstName || ""} ${s.lastName || ""}`.trim() === incoming
      );
      const foundByEmail = staffList.find((s) => s.email === incoming);
      const match = foundByName || foundByEmail;
      if (match) {
        formik.setFieldValue("userManagerId", String(match.id));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffList, staffLoading, initialValues]);

  // Reset form when modal closes.
  // Avoid including `formik` or its methods in the dependency array because
  // their identity can change between renders and cause repeated resets
  // leading to the "Maximum update depth exceeded" error.
  useEffect(() => {
    if (!visible) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={
        mode === "create"
          ? "+ Thêm trạm mới"
          : mode === "view"
          ? "Chi tiết trạm"
          : "Chỉnh sửa trạm"
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={640}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Form.Item
          label="Tên trạm"
          validateStatus={
            formik.touched.nameChargingStation &&
            formik.errors.nameChargingStation
              ? "error"
              : ""
          }
          help={
            formik.touched.nameChargingStation &&
            formik.errors.nameChargingStation
          }
          required
        >
          <Input
            name="nameChargingStation"
            placeholder="VD: Trạm A"
            value={formik.values.nameChargingStation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={mode === "view"}
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          validateStatus={
            formik.touched.address && formik.errors.address ? "error" : ""
          }
          help={formik.touched.address && formik.errors.address}
          required
        >
          <Input.TextArea
            name="address"
            placeholder="Nhập địa chỉ trạm"
            rows={3}
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={mode === "view"}
          />
        </Form.Item>

        <Space style={{ width: "100%" }} size="large">
          {mode === "edit" && (
            <Form.Item
              label="Số trụ"
              validateStatus={
                formik.touched.numberOfPosts && formik.errors.numberOfPosts
                  ? "error"
                  : ""
              }
              help={formik.touched.numberOfPosts && formik.errors.numberOfPosts}
              required
              style={{ flex: 1, minWidth: 150 }}
            >
              <InputNumber
                name="numberOfPosts"
                min={0}
                max={1000}
                style={{ width: "100%" }}
                value={formik.values.numberOfPosts}
                // Display only: disabled so user cannot change
                disabled={true}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Người quản lý"
            validateStatus={
              formik.touched.userManagerId && formik.errors.userManagerId
                ? "error"
                : ""
            }
            help={formik.touched.userManagerId && formik.errors.userManagerId}
            required
            style={{ flex: 1, minWidth: 150 }}
          >
            <Select
              showSearch
              placeholder="Chọn người quản lý"
              optionFilterProp="children"
              value={formik.values.userManagerId || undefined}
              onChange={(val) =>
                formik.setFieldValue("userManagerId", String(val))
              }
              onBlur={() => formik.setFieldTouched("userManagerId", true)}
              loading={staffLoading}
              disabled={mode === "view"}
              filterOption={(input, option) =>
                option.children
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {staffList.map((s) => (
                <Option key={s.id} value={String(s.id)}>
                  {`${s.firstName || ""} ${s.lastName || ""}`.trim()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Kích hoạt" style={{ flex: 0 }}>
            <Switch
              checked={formik.values.active}
              onChange={(checked) => formik.setFieldValue("active", checked)}
              disabled={mode === "view"}
            />
          </Form.Item>
        </Space>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onCancel}>
              {mode === "view" ? "Đóng" : "Hủy"}
            </Button>
            {mode !== "view" && (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!formik.isValid || !formik.dirty}
              >
                {mode === "create" ? "Tạo" : "Cập nhật"}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StationForm;
