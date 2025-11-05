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

      // ⭐ Debug: Log API response
      console.log("🔍 [Service] API Response sample:", {
        totalStations: response.data.length,
        firstStation: response.data[0],
        chargingPostsAvailable: response.data[0]?.chargingPostsAvailable,
        typeOfMap: typeof response.data[0]?.chargingPostsAvailable,
      });

      const mappedStations = stationDataMapper.mapStationsFromApi(
        response.data
      );

      // ⭐ Debug: Log mapped data
      console.log("📦 [Service] Mapped stations sample:", {
        totalMapped: mappedStations.length,
        firstMapped: mappedStations[0],
        availableSlots: mappedStations[0]?.availableSlots,
      });

      return mappedStations;
    } catch (error) {
      // Trường hợp lỗi: chuyển lỗi gốc thành Error có message dễ hiểu
      throw this.handleError(error, "Không thể tải danh sách trạm sạc");
    }
  },

  /**
   * ⭐ MỚI: Tìm trạm sạc gần nhất dựa trên vị trí hiện tại
   * API này trả về khoảng cách từ vị trí user đến từng trạm
   *
   * @param {number} latitude - Vĩ độ của user
   * @param {number} longitude - Kinh độ của user
   * @returns {Promise<Array>} Danh sách trạm đã được sắp xếp theo khoảng cách
   * @throws {Error} Khi yêu cầu API thất bại
   */
  async getNearestStations(latitude, longitude) {
    try {
      const response = await api.post("/api/charging/station/available", {
        latitude,
        longitude,
      });

      // Map dữ liệu từ StationAndPost DTO
      const mappedStations = stationDataMapper.mapNearestStationsFromApi(
        response.data,
        latitude,
        longitude
      );

      return mappedStations;
    } catch (error) {
      console.error("Error fetching nearest stations:", error);
      throw this.handleError(error, "Không thể tải danh sách trạm sạc gần bạn");
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

      // Map dữ liệu API sang cấu trúc mà UI mong đợi
      const mappedStation = stationDataMapper.mapStationFromApi(response.data);

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
      const response = await api.get(
        `/api/charging/station/posts/${stationId}`
      );

      // Map danh sách trụ (posts) sang dạng UI-friendly
      const mappedPosts = stationDataMapper.mapPostsFromApi(response.data);

      return mappedPosts;
    } catch (error) {
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw this.handleError(error, "Không thể tải danh sách trụ sạc");
    }
  },

  /**
   * Lấy thông tin chi tiết cho 1 trụ sạc cụ thể từ QR code
   *
   * @param {string} postId - ID của trụ sạc (thường lấy từ QR code)
   * @throws {Error} Khi không tìm thấy trụ hoặc yêu cầu API lỗi
   */
  async getPostById(postId) {
    try {
      const response = await api.get(`/api/charging/post/${postId}`);
      return stationDataMapper.mapPostFromApi(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trụ:", error);
      throw this.handleError(error, "Không tìm thấy thông tin trụ sạc");
    }
  },

  /**
   * Tạo một phiên sạc mới (booking)
   *
   * @throws {Error} Khi yêu cầu API thất bại
   */
  async createChargingSession(bookingData) {
    try {
      const response = await api.post(
        "/api/charging/session/create",
        bookingData
      );
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

      // Charging posts data
      chargingPosts: apiStation.chargingPosts || [],
      chargingPostsAvailable: apiStation.chargingPostsAvailable || {},
      chargingSessionIds: apiStation.chargingSessionIds || [],

      // Map coordinates - use API data
      lat: apiStation.latitude || 21.0285, // Default to Hanoi coordinates
      lng: apiStation.longitude || 105.8542,

      // User manager info
      userManagerName: apiStation.userManagerName || "N/A",

      // Calculated fields for UI
      distance: "N/A", // Will be calculated based on user location
      totalSlots: apiStation.numberOfPosts || 0,
      availableSlots: this.calculateAvailableSlotsFromMap(
        apiStation.chargingPostsAvailable
      ),
      power: this.calculateTotalPower(apiStation.chargingPosts),
      chargingTypes: this.getChargingTypes(apiStation.chargingPosts), // ⭐ Unique charging types
      type: this.getChargingTypes(apiStation.chargingPosts), // ⭐ For backward compatibility
      openHours: "24/7", // Default value
      rating: 0, // Placeholder for future rating feature
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
   * Tính số trụ/slot đang sẵn sàng từ chargingPosts array
   *
   */
  calculateAvailableSlots(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return 0;
    return chargingPosts.filter((post) => post.isAvailable === true).length;
  },

  /**
   * Tính số trụ/slot đang sẵn sàng từ chargingPostsAvailable map
   * API trả về format: { "POST001": true, "POST002": false, ... }
   */
  calculateAvailableSlotsFromMap(chargingPostsAvailable) {
    if (!chargingPostsAvailable || typeof chargingPostsAvailable !== "object")
      return 0;

    // Count how many posts have value = true
    return Object.values(chargingPostsAvailable).filter(
      (available) => available === true
    ).length;
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
   * ⭐ Lấy danh sách loại sạc unique từ chargingPosts
   * Loại bỏ duplicate, chỉ giữ unique types
   */
  getChargingTypes(chargingPosts) {
    if (!Array.isArray(chargingPosts) || chargingPosts.length === 0) {
      return "AC/DC"; // Default
    }

    // Collect all charging types from all posts
    const allTypes = new Set();

    chargingPosts.forEach((post) => {
      if (Array.isArray(post.chargingType)) {
        post.chargingType.forEach((type) => {
          // Extract type name (could be object or string)
          const typeName =
            typeof type === "object"
              ? type.typeName || type.name || type.idChargingType
              : type;

          if (typeName) {
            allTypes.add(typeName.toString().toUpperCase());
          }
        });
      }
    });

    // Convert Set to Array and join with comma
    const uniqueTypes = Array.from(allTypes);

    return uniqueTypes.length > 0 ? uniqueTypes.join(", ") : "AC/DC";
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
   * ⭐ MỚI: Map dữ liệu từ API /available (StationAndPost DTO)
   * API này trả về thêm trường distance (khoảng cách tính từ BE)
   *
   * @param {Array} apiStations - Mảng StationAndPost từ BE
   * @param {number} userLat - Vĩ độ user (để tính lại nếu cần)
   * @param {number} userLng - Kinh độ user (để tính lại nếu cần)
   */
  mapNearestStationsFromApi(apiStations, userLat, userLng) {
    if (!Array.isArray(apiStations)) return [];

    return apiStations
      .map((station) => {
        // Map giống getAllStations nhưng có thêm distance từ BE
        const mapped = {
          // Core station data
          id: station.idChargingStation,
          name: station.nameChargingStation || "Không có tên",
          address: station.address || "Chưa có địa chỉ",
          active: station.active,
          status: this.mapActiveStatus(station.active),
          establishedTime: station.establishedTime,
          numberOfPosts: station.numberOfPosts || 0,

          // ⭐ Coordinates từ API
          lat: station.latitude || 21.0285,
          lng: station.longitude || 105.8542,

          // ⭐ Post availability map từ API
          chargingPostsAvailable: station.postAvailable || {},

          // ⭐ Distance từ BE (đã tính sẵn)
          distance: station.distance
            ? `${station.distance.toFixed(1)} km`
            : "N/A",
          distanceValue: station.distance || 0, // Số để sort

          // Calculated fields
          totalSlots: station.numberOfPosts || 0,
          availableSlots: this.calculateAvailableSlotsFromMap(
            station.postAvailable
          ),
          power: "N/A", // Không có trong StationAndPost DTO
          type: "AC/DC",
          openHours: "24/7",
          rating: 0,
          reviewCount: 0,

          // Manager info (không có trong StationAndPost DTO)
          userManagerName: "N/A",
          chargingSessionIds: [],
        };

        return mapped;
      })
      .sort((a, b) => a.distanceValue - b.distanceValue); // Sort theo khoảng cách gần nhất
  },

  /**
   * Chuyển dữ liệu trụ sạc từ API sang định dạng UI
   *
   */
  mapPostFromApi(apiPost) {
    // ⭐ Map charging type IDs to names
    const CHARGING_TYPE_NAMES = {
      1: "CCS",
      2: "CHAdeMO",
      3: "AC",
    };

    return {
      // Dữ liệu cốt lõi của trụ sạc
      id: apiPost.idChargingPost,
      name:
        apiPost.nameChargingPost ||
        apiPost.name ||
        `Trụ ${apiPost.idChargingPost}`,
      active: apiPost.active || apiPost.is_active,
      maxPower: apiPost.maxPower || 0,
      chargingFeePerKWh:
        apiPost.chargingFeePerKWh || apiPost.charging_fee_per_kwh || 0,
      chargingSessions: apiPost.chargingSessions || [],
      chargingTypes: apiPost.chargingType || [],
      chargingStationId:
        apiPost.chargingStationId ||
        apiPost.id_charging_station ||
        apiPost.chargingStation,
      waitingList: apiPost.waitingList || [],
      bookings: apiPost.bookings || [],

      // Display fields for UI
      powerDisplay: `${apiPost.maxPower || 0} kW`,
      feeDisplay: `${
        apiPost.chargingFeePerKWh || apiPost.charging_fee_per_kwh || 0
      } VNĐ/kWh`,
      status: apiPost.active || apiPost.is_active ? "available" : "maintenance",
      isAvailable:
        (apiPost.active || apiPost.is_active) &&
        !this.isPostBusy(apiPost.chargingSessions),
      // ⭐ Map chargingType array of IDs to array of names and remove duplicates
      supportedTypes: Array.isArray(apiPost.chargingType)
        ? [
            ...new Set(
              apiPost.chargingType.map(
                (typeId) => CHARGING_TYPE_NAMES[typeId] || `Type ${typeId}`
              )
            ),
          ]
        : ["AC"],
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
