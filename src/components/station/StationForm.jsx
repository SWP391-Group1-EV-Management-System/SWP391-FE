import { useEffect, useState, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Switch,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IoLocationSharp } from "react-icons/io5";
import { getStaff } from "../../services/userService";
import { useFormik } from "formik";
import * as Yup from "yup";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER = [10.7769, 106.7009]; // Ho Chi Minh City
const DEFAULT_ZOOM = 13;

// Component to handle map clicks and update marker position
function LocationPicker({ position, setPosition, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

// Component to recenter map and fix tile loading issues
function MapController({ position, shouldRecenter }) {
  const map = useMap();

  useEffect(() => {
    if (shouldRecenter && position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, shouldRecenter, map]);

  // Force map to refresh tiles when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

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
  const [mapPosition, setMapPosition] = useState(DEFAULT_CENTER);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  
  const isMapClickRef = useRef(false);

  // Load staff list
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
    latitude: Yup.number()
      .required("Vui lòng nhập vĩ độ hoặc chọn trên bản đồ")
      .min(-90, "Vĩ độ phải từ -90 đến 90")
      .max(90, "Vĩ độ phải từ -90 đến 90"),
    longitude: Yup.number()
      .required("Vui lòng nhập kinh độ hoặc chọn trên bản đồ")
      .min(-180, "Kinh độ phải từ -180 đến 180")
      .max(180, "Kinh độ phải từ -180 đến 180"),
    numberOfPosts: Yup.number()
      .min(0, "Số trụ phải >= 0")
      .max(1000, "Số trụ quá lớn")
      .nullable(),
    userManagerId: Yup.string().required("Vui lòng chọn người quản lý"),
    active: Yup.boolean().required("Trạng thái bắt buộc"),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      nameChargingStation: "",
      address: "",
      latitude: null,
      longitude: null,
      numberOfPosts: 0,
      userManagerId: "",
      active: true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const lat = parseFloat(values.latitude);
      const lng = parseFloat(values.longitude);
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        alert("Vui lòng nhập tọa độ hợp lệ!");
        return;
      }

      // ✅ FIXED: Đảm bảo payload đúng format với API
      const payload = {
        nameChargingStation: values.nameChargingStation.trim(),
        address: values.address.trim(),
        latitude: lat,
        longitude: lng,
        numberOfPosts: mode === "create" ? 0 : (parseInt(values.numberOfPosts) || 0),
        userManagerId: String(values.userManagerId),
        active: Boolean(values.active),
      };

      console.log("📤 Payload gửi lên API:", JSON.stringify(payload, null, 2));
      console.log("📤 Mode:", mode);
      
      onSubmit(payload);
    },
  });

  // ⭐ DEBUG: Log initialValues khi form mở
  useEffect(() => {
    if (visible && initialValues) {
      console.log("🔍 [StationForm] Initial values received:", initialValues);
      console.log("🔍 [StationForm] Latitude:", initialValues.latitude);
      console.log("🔍 [StationForm] Longitude:", initialValues.longitude);
    }
  }, [visible, initialValues]);

  // Handle map click - update form values NHƯNG KHÔNG recenter map
  const handleMapPositionChange = (newPosition) => {
    isMapClickRef.current = true;
    setMapPosition(newPosition);
    formik.setFieldValue("latitude", parseFloat(newPosition[0].toFixed(6)));
    formik.setFieldValue("longitude", parseFloat(newPosition[1].toFixed(6)));
    setShouldRecenter(false);
  };

  // Handle coordinate input change - update map VÀ recenter
  const handleCoordinateChange = (field, value) => {
    formik.setFieldValue(field, value);
    
    const lat = parseFloat(field === "latitude" ? value : formik.values.latitude);
    const lng = parseFloat(field === "longitude" ? value : formik.values.longitude);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      isMapClickRef.current = false;
      setMapPosition([lat, lng]);
      setShouldRecenter(true);
    }
  };

  // Get current location - recenter map
  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          isMapClickRef.current = false;
          setMapPosition([latitude, longitude]);
          formik.setFieldValue("latitude", parseFloat(latitude.toFixed(6)));
          formik.setFieldValue("longitude", parseFloat(longitude.toFixed(6)));
          setShouldRecenter(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  // Resolve user manager from initialValues
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

      const foundById = staffList.find((s) => String(s.id) === incoming);
      if (foundById) {
        formik.setFieldValue("userManagerId", String(foundById.id));
        return;
      }

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

  // ✅ FIXED: Set initial map position và KHÔNG cho phép chỉnh sửa tọa độ khi đang ở mode edit
  useEffect(() => {
    if (visible && initialValues?.latitude && initialValues?.longitude) {
      const lat = parseFloat(initialValues.latitude);
      const lng = parseFloat(initialValues.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapPosition([lat, lng]);
        setShouldRecenter(true);
        
        // Set giá trị cho form
        formik.setFieldValue("latitude", lat);
        formik.setFieldValue("longitude", lng);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  // Reset form and regenerate map when modal opens/closes
  useEffect(() => {
    if (visible) {
      setMapKey(prev => prev + 1);
    } else {
      formik.resetForm();
      setMapPosition(DEFAULT_CENTER);
      setShouldRecenter(false);
      isMapClickRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ✅ FIXED: Chỉ disable khi ở mode view, cho phép edit coordinates trong mode edit và create
  const isCoordinateDisabled = mode === "view";

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
      width={900}
      style={{ top: 20 }}
      destroyOnClose={false}
      afterOpenChange={(open) => {
        if (open) {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 300);
        }
      }}
    >
      <div>
        <Row gutter={16}>
          <Col span={24}>
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
                placeholder="VD: Trạm sạc Quận 1"
                value={formik.values.nameChargingStation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={mode === "view"}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
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
                placeholder="Nhập địa chỉ đầy đủ của trạm sạc"
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={mode === "view"}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Card 
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📍 Vị trí trạm sạc</span>
                  {mode !== "view" && (
                    <Button 
                      size="small" 
                      onClick={handleGetCurrentLocation}
                      icon={<IoLocationSharp />}
                    >
                      Vị trí hiện tại
                    </Button>
                  )}
                </div>
              }
              style={{ marginBottom: 16 }}
              size="small"
            >
              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <Form.Item
                    label="Vĩ độ (Latitude)"
                    validateStatus={
                      formik.touched.latitude && formik.errors.latitude
                        ? "error"
                        : ""
                    }
                    help={formik.touched.latitude && formik.errors.latitude}
                    required
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      name="latitude"
                      placeholder="VD: 10.7769"
                      style={{ width: "100%" }}
                      value={formik.values.latitude}
                      onChange={(value) => handleCoordinateChange("latitude", value)}
                      onBlur={formik.handleBlur}
                      disabled={isCoordinateDisabled}
                      step={0.000001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Kinh độ (Longitude)"
                    validateStatus={
                      formik.touched.longitude && formik.errors.longitude
                        ? "error"
                        : ""
                    }
                    help={formik.touched.longitude && formik.errors.longitude}
                    required
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      name="longitude"
                      placeholder="VD: 106.7009"
                      style={{ width: "100%" }}
                      value={formik.values.longitude}
                      onChange={(value) => handleCoordinateChange("longitude", value)}
                      onBlur={formik.handleBlur}
                      disabled={isCoordinateDisabled}
                      step={0.000001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {mode === "edit" && (
                <div style={{ 
                  marginBottom: 12, 
                  padding: "8px 12px",
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#d46b08"
                }}>
                  ⚠️ Thay đổi tọa độ có thể ảnh hưởng đến các phiên sạc đang diễn ra
                </div>
              )}

              <div style={{ 
                height: "350px", 
                border: "2px solid #d9d9d9", 
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative"
              }}>
                <MapContainer
                  key={mapKey}
                  center={mapPosition}
                  zoom={DEFAULT_ZOOM}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                  preferCanvas={true}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    minZoom={3}
                    crossOrigin={true}
                  />
                  <LocationPicker
                    position={mapPosition}
                    setPosition={handleMapPositionChange}
                    disabled={isCoordinateDisabled}
                  />
                  <MapController position={mapPosition} shouldRecenter={shouldRecenter} />
                </MapContainer>
              </div>
              
              {mode !== "view" && (
                <div style={{ 
                  marginTop: 8, 
                  fontSize: "12px", 
                  color: "#8c8c8c",
                  textAlign: "center" 
                }}>
                  💡 Nhấp vào bản đồ để chọn vị trí trạm sạc
                </div>
              )}
            </Card>
          </Col>
        </Row>

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
              style={{ flex: 1, minWidth: 150 }}
            >
              <InputNumber
                name="numberOfPosts"
                min={0}
                max={1000}
                style={{ width: "100%" }}
                value={formik.values.numberOfPosts}
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
                onClick={formik.handleSubmit}
                loading={loading}
                disabled={!formik.isValid}
              >
                {mode === "create" ? "Tạo trạm" : "Cập nhật"}
              </Button>
            )}
          </Space>
        </Form.Item>
      </div>
    </Modal>
  );
};

export default StationForm;