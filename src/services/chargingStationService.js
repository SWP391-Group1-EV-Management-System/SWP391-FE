/**
 * CHARGING STATION SERVICE
 *
 * This service handles all API calls related to EV charging stations
 * and provides data transformation utilities for UI components.
 *
 * Features:
 * - Get all charging stations
 * - Get station details by ID
 * - Get charging posts for a station
 * - Data mapping from API to UI format
 * - Comprehensive error handling
 *
 * @module ChargingStationService
 */
/*
  - Dịch vụ quản lý trạm sạc
  - File này gom các hàm gọi API liên quan đến trạm sạc và các hàm map dữ liệu
  - Mục tiêu: tách logic gọi API và chuyển đổi dữ liệu để UI có thể dùng trực tiếp
*/

import api from "../utils/axios.js";
// Using shared axios instance (`api`) which centralizes baseURL, withCredentials,
// and token refresh logic. Endpoints below include the '/api' prefix to match
// the backend routing.

/**
 * ===============================
 * ĐỐI TƯỢNG DỊCH VỤ CHÍNH
 * ===============================
 */
export const chargingStationService = {
  /**
   * Lấy danh sách tất cả trạm sạc từ API
   *
   * @throws {Error} Khi yêu cầu API thất bại
   */
  async getAllStations() {
    try {
      const response = await api.get("/api/charging/station/all");
      const mappedStations = stationDataMapper.mapStationsFromApi(
        response.data
      );
      return mappedStations;
    } catch (error) {
      // Trường hợp lỗi: chuyển lỗi gốc thành Error có message dễ hiểu
      throw this.handleError(error, "Không thể tải danh sách trạm sạc");
    }
  },

  /**
   * Lấy thông tin chi tiết cho 1 trạm sạc cụ thể
   *
   * @throws {Error} Khi không tìm thấy trạm hoặc yêu cầu API lỗi
   */
  async getStationById(stationId) {
    try {
      const response = await api.get(`/api/charging/station/${stationId}`);
      // Debug: in ra dữ liệu thô từ API (giữ để thuận tiện khi dev)
      console.log("API trả về trạm:", response.data);

      // Map dữ liệu API sang cấu trúc mà UI mong đợi
      const mappedStation = stationDataMapper.mapStationFromApi(response.data);

      // Debug: in kết quả đã map
      console.log("Mapped trạm:", mappedStation);
      return mappedStation;
    } catch (error) {
      throw this.handleError(error, "Không tìm thấy trạm sạc");
    }
  },

  /**
   * Lấy danh sách các trụ (posts) của một trạm
   *
   * @throws {Error} Khi yêu cầu API thất bại
   */
  async getStationPosts(stationId) {
    try {
      const response = await api.get(`/api/charging/station/posts/${stationId}`);
      // Debug: log dữ liệu thô
      console.log("API trả về trụ:", response.data);

      // Map danh sách trụ (posts) sang dạng UI-friendly
      const mappedPosts = stationDataMapper.mapPostsFromApi(response.data);

      // Debug: log kết quả sau khi map
      console.log("Mapped trụ:", mappedPosts);
      return mappedPosts;
    } catch (error) {
      // Log debug information before throwing error
      console.error("Error details:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw this.handleError(error, "Không thể tải danh sách trụ sạc");
    }
  },

  /**
   * Tạo một phiên sạc mới (booking)
   *
   * @throws {Error} Khi yêu cầu API thất bại
   */
  async createChargingSession(bookingData) {
    try {
      const response = await api.post("/api/charging/session/create", bookingData);
      // Kiểm tra cấu trúc response từ API.
      // Nhiều API trả cấu trúc: { success: boolean, data: ..., message: '...'}
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Tạo phiên sạc thành công",
        };
      } else {
        // Trường hợp API trả thành công HTTP nhưng nội dung báo lỗi
        return {
          success: false,
          message: response.data?.message || "Không thể tạo phiên sạc",
        };
      }
    } catch (error) {
      // Ghi log lỗi để dev debug
      console.error("Error creating charging session:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        // Trả về object rõ ràng cho UI xử lý (không throw) vì hàm này dùng pattern success/fail
        return {
          success: false,
          message: error.response.data?.message || "Lỗi từ server",
        };
      }

      // Lỗi mạng / không có phản hồi
      return {
        success: false,
        message: "Không thể kết nối đến server",
      };
    }
  },

  /**
   * Chuyển lỗi từ API thành thông báo dễ hiểu cho người dùng
   *
   */
  handleError(error, defaultMessage) {
    // Handle HTTP response errors
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          // Bad Request
          return new Error("Yêu cầu không hợp lệ");
        case 401:
          // Unauthorized - cần token/đăng nhập
          return new Error("Cần đăng nhập");
        case 404:
          // Không tìm thấy resource
          return new Error("Không tìm thấy dữ liệu");
        case 500:
          // Lỗi server nội bộ
          return new Error("Lỗi server");
        default:
          // Các trường hợp khác trả về message mặc định truyền vào
          return new Error(defaultMessage);
      }
    }

    // Handle network errors
    if (error.request) {
      return new Error("Không thể kết nối đến server");
    }

    // Handle other errors
    // Nếu không phải lỗi HTTP hay network thì trả về message mặc định
    return new Error(defaultMessage);
  },
};

/**
 * ===============================
 * TIỆN ÍCH CHUYỂN ĐỔI DỮ LIỆU
 * ===============================
 *
 * Các hàm ở đây chuyển dữ liệu thô từ API sang định dạng dễ dùng cho UI
 */
export const stationDataMapper = {
  /**
   * Chuyển dữ liệu trạm từ API sang định dạng UI
   *
   */
  mapStationFromApi(apiStation) {
    return {
      // Core station data from API
      id: apiStation.idChargingStation,
      name: apiStation.nameChargingStation || apiStation.name || "Không có tên",
      address: apiStation.address || "Chưa có địa chỉ",
      active: apiStation.active,
      status: this.mapActiveStatus(apiStation.active),
      establishedTime: apiStation.establishedTime,
      numberOfPosts: apiStation.numberOfPosts || 0,
      chargingPosts: apiStation.chargingPosts || [],

      // Map coordinates - use API data if available, otherwise default values
      lat: apiStation.latitude || 21.0285, // Default to Hanoi coordinates
      lng: apiStation.longitude || 105.8542,

      // Trường thông tin tính toán/hiển thị cho UI
      distance: "N/A", // Khoảng cách sẽ được tính dựa vào vị trí người dùng (nếu có)
      totalSlots: apiStation.numberOfPosts || 0,
      availableSlots: this.calculateAvailableSlots(apiStation.chargingPosts),
      power: this.calculateTotalPower(apiStation.chargingPosts),
      type: "AC/DC", // Giá trị tạm (có thể lấy từ API nếu chi tiết)
      openHours: "24/7", // Mặc định
      rating: 0, // Placeholder - tính năng đánh giá sau
      reviewCount: 0, // Placeholder
    };
  },

  /**
   * Chuyển trạng thái boolean 'active' sang chuỗi trạng thái cho UI
   *
   */
  mapActiveStatus(active) {
    return active ? "available" : "maintenance";
  },

  /**
   * Tính số trụ/slot đang sẵn sàng
   *
   */
  calculateAvailableSlots(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return 0;
    return chargingPosts.filter((post) => post.isAvailable === true).length;
  },

  /**
   * Tính tổng công suất của trạm (cộng maxPower của mọi trụ)
   *
   */
  calculateTotalPower(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return "N/A";

    const totalPower = chargingPosts.reduce((sum, post) => {
      return sum + (post.maxPower || 0);
    }, 0);

    // Trả về chuỗi ví dụ: "150 kW" hoặc "N/A" nếu không có dữ liệu
    return totalPower > 0 ? `${totalPower} kW` : "N/A";
  },

  /**
   * Tính các chỉ số thống kê tổng hợp cho danh sách trạm
   *
   */
  calculateStatistics(stations) {
    const totalStations = stations.length;
    const activeStations = stations.filter((s) => s.active === true).length;
    const inactiveStations = totalStations - activeStations;

    const totalPosts = stations.reduce(
      (sum, station) => sum + (station.numberOfPosts || 0),
      0
    );
    const availablePosts = stations.reduce(
      (sum, station) => sum + (station.availableSlots || 0),
      0
    );
    const busyPosts = totalPosts - availablePosts;

    return {
      totalStations,
      activeStations,
      inactiveStations,
      totalPosts,
      availablePosts,
      busyPosts,
      // Additional mappings for UI components
      availableStations: availablePosts,
      bookedStations: busyPosts,
      averagePostsPerStation:
        totalStations > 0 ? Math.round(totalPosts / totalStations) : 0,
    };
  },

  /**
   * Chuyển mảng trạm API sang mảng trạm cho UI
   *
   */
  mapStationsFromApi(apiStations) {
    if (!Array.isArray(apiStations)) return [];
    return apiStations.map((station) => this.mapStationFromApi(station));
  },

  /**
   * Chuyển dữ liệu trụ sạc từ API sang định dạng UI
   *
   */
  mapPostFromApi(apiPost) {
    return {
      // Core post data
      id: apiPost.idChargingPost,
      name:
        apiPost.nameChargingPost ||
        apiPost.name ||
        `Trụ ${apiPost.idChargingPost}`,
      active: apiPost.active,
      maxPower: apiPost.maxPower || 0,
      chargingFeePerKWh: apiPost.chargingFeePerKWh || 0,
      chargingSessions: apiPost.chargingSessions || [],
      chargingTypes: apiPost.chargingType || [],

      // Trường hiển thị cho UI
      powerDisplay: `${apiPost.maxPower || 0} kW`,
      feeDisplay: `${apiPost.chargingFeePerKWh || 0} VNĐ/kWh`,
      status: apiPost.active ? "available" : "maintenance",
      // isAvailable = trụ active và không có session đang chạy
      isAvailable: apiPost.active && !this.isPostBusy(apiPost.chargingSessions),
      // supportedTypes: chuyển mảng đối tượng type sang chuỗi tên
      supportedTypes: apiPost.chargingType?.map(
        (type) => type.typeName || type.name || "AC"
      ) || ["AC"],
    };
  },

  /**
   * Chuyển mảng trụ sạc từ API sang mảng trụ cho UI
   *
   */
  mapPostsFromApi(apiPosts) {
    if (!Array.isArray(apiPosts)) return [];
    return apiPosts.map((post) => this.mapPostFromApi(post));
  },

  /**
   * Kiểm tra xem một trụ có đang được sử dụng hay không
   *
   */
  isPostBusy(chargingSessions) {
    if (!Array.isArray(chargingSessions)) return false;
    return chargingSessions.some(
      // Nếu có session với trạng thái ACTIVE hoặc CHARGING => trụ đang bận
      (session) => session.status === "ACTIVE" || session.status === "CHARGING"
    );
  },
};

export default chargingStationService;
