/**
 * CHARGING STATION SERVICE - COMPLETE VERSION
 *
 * Added: createStation, updateStation, deleteStation methods
 */

import api from "../utils/axios.js";

/**
 * ===============================
 * ĐỐI TƯỢNG DỊCH VỤ CHÍNH
 * ===============================
 */
export const chargingStationService = {
  /**
   * ⭐ TẠO TRẠM SẠC MỚI
   * 
   * @param {Object} stationData - Dữ liệu trạm sạc
   * @returns {Promise<Object>} Response từ API
   */
  async createStation(stationData) {
    try {
      console.log("🚀 [Service] Creating station with data:", stationData);
      
      const response = await api.post("/api/charging/station/create", stationData);
      
      console.log("✅ [Service] Create response:", response.data);
      
      // Kiểm tra response - backend trả về boolean true/false
      if (response.data === true || response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: "Tạo trạm sạc thành công",
          data: response.data,
        };
      } else if (response.data === false) {
        return {
          success: false,
          message: "Không thể tạo trạm sạc. Vui lòng kiểm tra lại thông tin.",
        };
      }
      
      return {
        success: true,
        message: "Tạo trạm sạc thành công",
        data: response.data,
      };
    } catch (error) {
      console.error("❌ [Service] Create station error:", error);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                 error.response?.data || 
                 "Lỗi khi tạo trạm sạc",
        error: error.response?.data,
      };
    }
  },

  /**
   * ⭐ CẬP NHẬT TRẠM SẠC
   * 
   * @param {string} stationId - ID của trạm cần update
   * @param {Object} stationData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Response từ API
   */
  async updateStation(stationId, stationData) {
    try {
      console.log("🔄 [Service] Updating station", stationId, "with data:", stationData);
      
      const response = await api.put(
        `/api/charging/station/update/${stationId}`,
        stationData
      );
      
      console.log("✅ [Service] Update response:", response.data);
      
      // Kiểm tra response - backend trả về boolean true/false
      if (response.data === true || response.status === 200) {
        return {
          success: true,
          message: "Cập nhật trạm sạc thành công",
          data: response.data,
        };
      } else if (response.data === false) {
        return {
          success: false,
          message: "Không thể cập nhật trạm sạc. Vui lòng kiểm tra lại thông tin.",
        };
      }
      
      return {
        success: true,
        message: "Cập nhật trạm sạc thành công",
        data: response.data,
      };
    } catch (error) {
      console.error("❌ [Service] Update station error:", error);
      console.error("Response:", error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                 error.response?.data || 
                 "Lỗi khi cập nhật trạm sạc",
        error: error.response?.data,
      };
    }
  },

  /**
   * ⭐ VÔ HIỆU HÓA TRẠM SẠC (Soft delete)
   * 
   * @param {string} stationId - ID của trạm cần deactivate
   * @returns {Promise<Object>} Response từ API
   */
  async deactivateStation(stationId) {
    try {
      console.log("🗑️ [Service] Deactivating station:", stationId);
      
      const response = await api.put(`/api/charging/station/deactivate/${stationId}`);
      
      console.log("✅ [Service] Deactivate response:", response.data);
      
      if (response.data === true || response.status === 200) {
        return {
          success: true,
          message: "Đã vô hiệu hóa trạm sạc",
        };
      }
      
      return {
        success: false,
        message: "Không thể vô hiệu hóa trạm sạc",
      };
    } catch (error) {
      console.error("❌ [Service] Deactivate error:", error);
      
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi vô hiệu hóa trạm sạc",
      };
    }
  },

  /**
   * Lấy danh sách tất cả trạm sạc từ API
   */
  async getAllStations() {
    try {
      const response = await api.get("/api/charging/station/all");

      console.log("🔍 [Service] API Response sample:", {
        totalStations: response.data.length,
        firstStation: response.data[0],
        chargingPostsAvailable: response.data[0]?.chargingPostsAvailable,
        typeOfMap: typeof response.data[0]?.chargingPostsAvailable,
      });

      const mappedStations = stationDataMapper.mapStationsFromApi(
        response.data
      );

      console.log("📦 [Service] Mapped stations sample:", {
        totalMapped: mappedStations.length,
        firstMapped: mappedStations[0],
        availableSlots: mappedStations[0]?.availableSlots,
      });

      return mappedStations;
    } catch (error) {
      throw this.handleError(error, "Không thể tải danh sách trạm sạc");
    }
  },

  /**
   * Tìm trạm sạc gần nhất dựa trên vị trí hiện tại
   */
  async getNearestStations(latitude, longitude) {
    try {
      const response = await api.post("/api/charging/station/available", {
        latitude,
        longitude,
      });

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
   */
  async getStationById(stationId) {
    try {
      const response = await api.get(`/api/charging/station/${stationId}`);
      const mappedStation = stationDataMapper.mapStationFromApi(response.data);
      return mappedStation;
    } catch (error) {
      throw this.handleError(error, "Không tìm thấy trạm sạc");
    }
  },

  /**
   * Lấy danh sách các trụ (posts) của một trạm
   */
  async getStationPosts(stationId) {
    try {
      const response = await api.get(
        `/api/charging/station/posts/${stationId}`
      );

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
   */
  async createChargingSession(bookingData) {
    try {
      const response = await api.post(
        "/api/charging/session/create",
        bookingData
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Tạo phiên sạc thành công",
        };
      } else {
        return {
          success: false,
          message: response.data?.message || "Không thể tạo phiên sạc",
        };
      }
    } catch (error) {
      console.error("Error creating charging session:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        return {
          success: false,
          message: error.response.data?.message || "Lỗi từ server",
        };
      }

      return {
        success: false,
        message: "Không thể kết nối đến server",
      };
    }
  },

  /**
   * Chuyển lỗi từ API thành thông báo dễ hiểu cho người dùng
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return new Error("Yêu cầu không hợp lệ");
        case 401:
          return new Error("Cần đăng nhập");
        case 404:
          return new Error("Không tìm thấy dữ liệu");
        case 500:
          return new Error("Lỗi server");
        default:
          return new Error(defaultMessage);
      }
    }

    if (error.request) {
      return new Error("Không thể kết nối đến server");
    }

    return new Error(defaultMessage);
  },
};

/**
 * ===============================
 * TIỆN ÍCH CHUYỂN ĐỔI DỮ LIỆU
 * ===============================
 */
export const stationDataMapper = {
  /**
   * Chuyển dữ liệu trạm từ API sang định dạng UI
   */
  mapStationFromApi(apiStation) {
    return {
      id: apiStation.idChargingStation,
      name: apiStation.nameChargingStation || apiStation.name || "Không có tên",
      address: apiStation.address || "Chưa có địa chỉ",
      active: apiStation.active,
      status: this.mapActiveStatus(apiStation.active),
      establishedTime: apiStation.establishedTime,
      numberOfPosts: apiStation.numberOfPosts || 0,

      chargingPosts: apiStation.chargingPosts || [],
      chargingPostsAvailable: apiStation.chargingPostsAvailable || {},
      chargingSessionIds: apiStation.chargingSessionIds || [],

      // ⭐ Map coordinates - cả 2 format để đảm bảo tương thích
      lat: apiStation.latitude || 21.0285,
      lng: apiStation.longitude || 105.8542,
      latitude: apiStation.latitude || 21.0285,   // ⭐ Để form edit dùng
      longitude: apiStation.longitude || 105.8542, // ⭐ Để form edit dùng

      userManagerName: apiStation.userManagerName || "N/A",
      userManagerId: apiStation.userManagerId, // ⭐ Thêm để form có thể dùng

      distance: "N/A",
      totalSlots: apiStation.numberOfPosts || 0,
      availableSlots: this.calculateAvailableSlotsFromMap(
        apiStation.chargingPostsAvailable
      ),
      power: this.calculateTotalPower(apiStation.chargingPosts),
      chargingTypes: this.getChargingTypes(apiStation.chargingPosts),
      type: this.getChargingTypes(apiStation.chargingPosts),
      openHours: "24/7",
      rating: 0,
      reviewCount: 0,
    };
  },

  mapActiveStatus(active) {
    return active ? "available" : "maintenance";
  },

  calculateAvailableSlots(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return 0;
    return chargingPosts.filter((post) => post.isAvailable === true).length;
  },

  calculateAvailableSlotsFromMap(chargingPostsAvailable) {
    if (!chargingPostsAvailable || typeof chargingPostsAvailable !== "object")
      return 0;

    return Object.values(chargingPostsAvailable).filter(
      (available) => available === true
    ).length;
  },

  calculateTotalPower(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return "N/A";

    const totalPower = chargingPosts.reduce((sum, post) => {
      return sum + (post.maxPower || 0);
    }, 0);

    return totalPower > 0 ? `${totalPower} kW` : "N/A";
  },

  getChargingTypes(chargingPosts) {
    if (!Array.isArray(chargingPosts) || chargingPosts.length === 0) {
      return "AC/DC";
    }

    const allTypes = new Set();

    chargingPosts.forEach((post) => {
      if (Array.isArray(post.chargingType)) {
        post.chargingType.forEach((type) => {
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

    const uniqueTypes = Array.from(allTypes);
    return uniqueTypes.length > 0 ? uniqueTypes.join(", ") : "AC/DC";
  },

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
      availableStations: availablePosts,
      bookedStations: busyPosts,
      averagePostsPerStation:
        totalStations > 0 ? Math.round(totalPosts / totalStations) : 0,
    };
  },

  mapStationsFromApi(apiStations) {
    if (!Array.isArray(apiStations)) return [];
    return apiStations.map((station) => this.mapStationFromApi(station));
  },

  mapNearestStationsFromApi(apiStations, userLat, userLng) {
    if (!Array.isArray(apiStations)) return [];

    return apiStations
      .map((station) => {
        const mapped = {
          id: station.idChargingStation,
          name: station.nameChargingStation || "Không có tên",
          address: station.address || "Chưa có địa chỉ",
          active: station.active,
          status: this.mapActiveStatus(station.active),
          establishedTime: station.establishedTime,
          numberOfPosts: station.numberOfPosts || 0,

          lat: station.latitude || 21.0285,
          lng: station.longitude || 105.8542,

          chargingPostsAvailable: station.postAvailable || {},

          distance: station.distance
            ? `${station.distance.toFixed(1)} km`
            : "N/A",
          distanceValue: station.distance || 0,

          totalSlots: station.numberOfPosts || 0,
          availableSlots: this.calculateAvailableSlotsFromMap(
            station.postAvailable
          ),
          power: "N/A",
          type: "AC/DC",
          openHours: "24/7",
          rating: 0,
          reviewCount: 0,

          userManagerName: "N/A",
          chargingSessionIds: [],
        };

        return mapped;
      })
      .sort((a, b) => a.distanceValue - b.distanceValue);
  },

  mapPostFromApi(apiPost) {
    const CHARGING_TYPE_NAMES = {
      1: "CCS",
      2: "CHAdeMO",
      3: "AC",
    };

    return {
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

      powerDisplay: `${apiPost.maxPower || 0} kW`,
      feeDisplay: `${
        apiPost.chargingFeePerKWh || apiPost.charging_fee_per_kwh || 0
      } VNĐ/kWh`,
      status: apiPost.active || apiPost.is_active ? "available" : "maintenance",
      isAvailable:
        (apiPost.active || apiPost.is_active) &&
        !this.isPostBusy(apiPost.chargingSessions),
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

  mapPostsFromApi(apiPosts) {
    if (!Array.isArray(apiPosts)) return [];
    return apiPosts.map((post) => this.mapPostFromApi(post));
  },

  isPostBusy(chargingSessions) {
    if (!Array.isArray(chargingSessions)) return false;
    return chargingSessions.some(
      (session) => session.status === "ACTIVE" || session.status === "CHARGING"
    );
  },
};

export default chargingStationService;