/**
 * Service quản lý API và xử lý dữ liệu trạm sạc điện
 * Chứa các hàm gọi API và chuyển đổi dữ liệu
 */
import axios from "axios";

// Địa chỉ API backend, lấy từ file .env hoặc dùng mặc định
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Địa chỉ gốc API
  timeout: 10000, // Thời gian chờ tối đa: 10 giây
  headers: {
    "Content-Type": "application/json", // Định dạng dữ liệu JSON
  },
});

/**
 * Service chứa các hàm gọi API liên quan đến trạm sạc
 */
export const chargingStationService = {
  /**
   * Lấy danh sách tất cả trạm sạc từ server
   * @returns {Array} Mảng các trạm sạc đã được xử lý
   */
  async getAllStations() {
    try {
      // Gọi API endpoint để lấy tất cả trạm sạc
      const response = await apiClient.get("/charging/station/all");

      // Xử lý và map dữ liệu từ API
      const stations = response.data || [];
      return stationDataMapper.mapStationsFromApi(stations);
    } catch (error) {
      // Xử lý và ném lỗi với thông báo dễ hiểu
      throw this.handleError(error, "Không thể tải danh sách trạm sạc");
    }
  },

  /**
   * Lấy thông tin chi tiết một trạm sạc cụ thể
   * @param {string} stationId - ID của trạm sạc cần lấy
   * @returns {Object} Thông tin chi tiết trạm sạc
   */
  async getStationById(stationId) {
    try {
      // Gọi API với ID trạm sạc cụ thể
      const response = await apiClient.get(`/charging/station/${stationId}`);

      // Chuyển đổi dữ liệu từ format API sang format giao diện
      const mappedStation = stationDataMapper.mapStationFromApi(response.data);
      return mappedStation;
    } catch (error) {
      // Xử lý lỗi khi không tìm thấy trạm sạc
      throw this.handleError(error, "Không tìm thấy trạm sạc");
    }
  },

  /**
   * Lấy danh sách trụ sạc của một trạm cụ thể
   * @param {string} stationId - ID của trạm sạc
   * @returns {Array} Mảng các trụ sạc trong trạm
   */
  async getStationPosts(stationId) {
    try {
      // Gọi API lấy trụ sạc theo ID trạm
      const response = await apiClient.get(
        `/charging/station/posts/${stationId}`
      );

      // Xử lý và map dữ liệu từ API
      const posts = response.data || [];
      return stationDataMapper.mapPostsFromApi(posts);
    } catch (error) {
      // Xử lý lỗi khi không tải được danh sách trụ sạc
      throw this.handleError(error, "Không thể tải danh sách trụ sạc");
    }
  },

  /**
   * Xử lý và chuyển đổi lỗi API thành thông báo dễ hiểu
   * @param {Error} error - Lỗi từ API
   * @param {string} defaultMessage - Thông báo mặc định
   * @returns {Error} Lỗi với thông báo đã xử lý
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      const status = error.response.status;
      // Xử lý các mã lỗi HTTP phổ biến
      if (status === 400) return new Error("Yêu cầu không hợp lệ");
      if (status === 401) return new Error("Cần đăng nhập");
      if (status === 404) return new Error("Không tìm thấy dữ liệu");
      if (status === 500) return new Error("Lỗi server");
      return new Error(defaultMessage);
    } else if (error.request) {
      return new Error("Không thể kết nối đến server");
    } else {
      return new Error(defaultMessage);
    }
  },
};

// Utility để xử lý dữ liệu trạm sạc
export const stationDataMapper = {
  // Chuyển đổi dữ liệu từ API sang format component
  mapStationFromApi(apiStation) {
    return {
      // Map từ backend entity fields
      id: apiStation.idChargingStation,
      name: apiStation.nameChargingStation || "Không có tên",
      address: apiStation.address || "Chưa có địa chỉ",
      isActive: apiStation.isActive,
      status: this.mapActiveStatus(apiStation.isActive),
      establishedTime: apiStation.establishedTime,
      numberOfPosts: apiStation.numberOfPosts || 0,
      chargingPosts: apiStation.chargingPosts || [],

      // Các field tính toán thêm cho UI - đơn giản hóa
      distance: "N/A",
      totalSlots: apiStation.numberOfPosts || 0,
      availableSlots: this.calculateAvailableSlots(apiStation.chargingPosts),
      power: this.calculateTotalPower(apiStation.chargingPosts),
      type: "AC/DC", // Đơn giản hóa - không phân loại phức tạp
      openHours: "24/7",
      rating: 0,
      reviewCount: 0,
    };
  },

  // Chuyển đổi trạng thái hoạt động sang status UI
  mapActiveStatus(isActive) {
    return isActive ? "available" : "maintenance";
  },

  // Tính số cổng sạc khả dụng
  calculateAvailableSlots(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return 0;
    return chargingPosts.filter((post) => post.isAvailable === true).length;
  },

  // Tính tổng công suất trạm (sử dụng maxPower từ trụ sạc)
  calculateTotalPower(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return "N/A";
    const totalPower = chargingPosts.reduce((sum, post) => {
      return sum + (post.maxPower || 0);
    }, 0);
    return totalPower > 0 ? `${totalPower} kW` : "N/A";
  },

  // Tính toán thống kê trạm sạc
  calculateStatistics(stations) {
    const totalStations = stations.length;
    const activeStations = stations.filter((s) => s.isActive === true).length;
    const inactiveStations = totalStations - activeStations;

    // Tính tổng cổng sạc
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
      // Thêm mapping cho MapPage
      availableStations: availablePosts,
      bookedStations: busyPosts,
      averagePostsPerStation:
        totalStations > 0 ? Math.round(totalPosts / totalStations) : 0,
    };
  },

  // Map danh sách stations từ API
  mapStationsFromApi(apiStations) {
    if (!Array.isArray(apiStations)) return [];
    return apiStations.map((station) => this.mapStationFromApi(station));
  },

  // Map trụ sạc từ API - đơn giản hóa
  mapPostFromApi(apiPost) {
    return {
      // Map trực tiếp từ backend entity
      id: apiPost.idChargingPost,
      isActive: apiPost.isActive,
      maxPower: apiPost.maxPower || 0,
      chargingFeePerKWh: apiPost.chargingFeePerKWh || 0,
      chargingSessions: apiPost.chargingSessions || [],
      chargingTypes: apiPost.chargingType || [],

      // Display fields đơn giản
      powerDisplay: `${apiPost.maxPower || 0} kW`,
      feeDisplay: `${apiPost.chargingFeePerKWh || 0} VNĐ/kWh`,
      status: apiPost.isActive ? "available" : "maintenance",
      isAvailable:
        apiPost.isActive && !this.isPostBusy(apiPost.chargingSessions),
      supportedTypes: apiPost.chargingType?.map(
        (type) => type.typeName || type.name || "AC"
      ) || ["AC"],
    };
  },

  // Map danh sách trụ sạc từ API
  mapPostsFromApi(apiPosts) {
    if (!Array.isArray(apiPosts)) return [];
    return apiPosts.map((post) => this.mapPostFromApi(post));
  },

  // Kiểm tra trụ có đang được sử dụng không - giữ lại vì cần thiết
  isPostBusy(chargingSessions) {
    if (!Array.isArray(chargingSessions)) return false;
    return chargingSessions.some(
      (session) => session.status === "ACTIVE" || session.status === "CHARGING"
    );
  },
};

export default chargingStationService;
