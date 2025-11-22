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
import { useFormik } from "formik";
import * as Yup from "yup";
import { chargingStationService } from "../../services/chargingStationService";

const { Option } = Select;

const PostForm = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
  mode = "create",
  types = [], // charging types list from parent: [{ idChargingType, nameChargingType }]
}) => {
  const validationSchema = Yup.object({
    // chargingTypes is an array of selected charging type ids (one or many)
    chargingTypes: Yup.array()
      .of(Yup.number())
      .min(1, "Vui lòng chọn ít nhất một loại sạc")
      .required(),
    chargingStationId:
      mode === "create"
        ? Yup.string().required("Vui lòng chọn trạm")
        : Yup.mixed(),
    maxPower: Yup.number().min(0).notRequired(),
    chargingFeePerKWh: Yup.number()
      .min(0, "Phí phải >= 0")
      .required("Vui lòng nhập phí sạc trên mỗi kWh"),
    active: Yup.boolean().required(),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      chargingTypes: [],
      chargingStationId: "",
      maxPower: 0,
      chargingFeePerKWh: 0,
      active: true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Map FE form values to backend payload shape:
      // { stationId, listType, maxPower, chargingFeePerKWh, active }
      const listType = Array.isArray(values.chargingTypes)
        ? values.chargingTypes.map((v) => Number(v))
        : values.chargingTypes
        ? [Number(values.chargingTypes)]
        : [];

      const payload = {
        stationId:
          values.chargingStationId !== undefined &&
          values.chargingStationId !== null
            ? String(values.chargingStationId)
            : "",
        listType,
        maxPower: values.maxPower !== undefined ? Number(values.maxPower) : 0,
        chargingFeePerKWh:
          values.chargingFeePerKWh !== undefined
            ? Number(values.chargingFeePerKWh)
            : 0,
        active: !!values.active,
      };

      onSubmit(payload);
    },
  });

  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setStationsLoading(true);
      try {
        const data = await chargingStationService.getAllStations();
        if (!mounted) return;
        setStations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load stations list", err);
        setStations([]);
      } finally {
        if (mounted) setStationsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
          ? "+ Thêm trụ mới"
          : mode === "view"
          ? "Chi tiết trụ"
          : "Chỉnh sửa trụ"
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={640}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        {/* Removed 'Tên trụ' input - backend does not provide a name field */}

        <Form.Item
          label="Loại sạc"
          validateStatus={
            formik.touched.idChargingType && formik.errors.idChargingType
              ? "error"
              : ""
          }
          help={formik.touched.idChargingType && formik.errors.idChargingType}
          required
        >
          <Select
            mode="multiple"
            value={formik.values.chargingTypes}
            onChange={(val) => formik.setFieldValue("chargingTypes", val)}
            onBlur={() => formik.setFieldTouched("chargingTypes", true)}
            disabled={mode === "view"}
            placeholder="Chọn loại sạc (có thể chọn 1 hoặc nhiều)"
            style={{ width: "100%" }}
          >
            {Array.isArray(types) &&
              types.map((t) => (
                <Option
                  key={t.idChargingType ?? t.id}
                  value={t.idChargingType ?? t.id}
                >
                  {t.nameChargingType || t.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Công suất tối đa (kW)"
          help={
            formik.touched.maxPower && formik.errors.maxPower
              ? formik.errors.maxPower
              : null
          }
        >
          <InputNumber
            name="maxPower"
            min={0}
            style={{ width: "100%" }}
            value={formik.values.maxPower}
            onChange={(val) => formik.setFieldValue("maxPower", val)}
            disabled={mode === "view"}
          />
        </Form.Item>

        <Form.Item
          label="Phí sạc (VNĐ/kWh)"
          validateStatus={
            formik.touched.chargingFeePerKWh && formik.errors.chargingFeePerKWh
              ? "error"
              : ""
          }
          help={
            formik.touched.chargingFeePerKWh && formik.errors.chargingFeePerKWh
              ? formik.errors.chargingFeePerKWh
              : null
          }
          required
        >
          <InputNumber
            name="chargingFeePerKWh"
            min={0}
            style={{ width: "100%" }}
            value={formik.values.chargingFeePerKWh}
            onChange={(val) => formik.setFieldValue("chargingFeePerKWh", val)}
            disabled={mode === "view"}
            formatter={(value) => `${value}`}
          />
        </Form.Item>

        <Form.Item
          label="Trạm"
          validateStatus={
            formik.touched.chargingStationId && formik.errors.chargingStationId
              ? "error"
              : ""
          }
          help={
            formik.touched.chargingStationId && formik.errors.chargingStationId
              ? formik.errors.chargingStationId
              : null
          }
          required={mode === "create"}
        >
          <Select
            showSearch
            placeholder="Chọn trạm"
            optionFilterProp="children"
            value={formik.values.chargingStationId || undefined}
            onChange={(val) =>
              formik.setFieldValue("chargingStationId", String(val))
            }
            onBlur={() => formik.setFieldTouched("chargingStationId", true)}
            loading={stationsLoading}
            disabled={mode === "view"}
            filterOption={(input, option) =>
              option.children
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {Array.isArray(stations) &&
              stations.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="Kích hoạt">
          <Switch
            checked={formik.values.active}
            onChange={(checked) => formik.setFieldValue("active", checked)}
            disabled={mode === "view"}
          />
        </Form.Item>

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
                disabled={!formik.isValid}
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

export default PostForm;
