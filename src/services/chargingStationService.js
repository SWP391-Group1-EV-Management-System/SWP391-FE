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

import axios from "axios";

/**
 * API Configuration
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Create configured axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ===============================
 * MAIN SERVICE OBJECT
 * ===============================
 */
export const chargingStationService = {
  /**
   * Fetch all charging stations from the API
   *
   * @returns {Promise<Array>} Array of mapped charging station objects
   * @throws {Error} When API request fails
   */
  async getAllStations() {
    try {
      const response = await apiClient.get("/charging/station/all");
      const mappedStations = stationDataMapper.mapStationsFromApi(
        response.data
      );
      return mappedStations;
    } catch (error) {
      throw this.handleError(error, "Không thể tải danh sách trạm sạc");
    }
  },

  /**
   * Fetch detailed information for a specific charging station
   *
   * @param {string} stationId - The unique identifier of the charging station
   * @returns {Promise<Object>} Mapped charging station object
   * @throws {Error} When station is not found or API request fails
   */
  async getStationById(stationId) {
    try {
      const response = await apiClient.get(`/charging/station/${stationId}`);
      console.log('API trả về trạm:', response.data);
      const mappedStation = stationDataMapper.mapStationFromApi(response.data);
      console.log('Mapped trạm:', mappedStation);
      return mappedStation;
    } catch (error) {
      throw this.handleError(error, "Không tìm thấy trạm sạc");
    }
  },

  /**
   * Fetch all charging posts for a specific station
   *
   * @param {string} stationId - The unique identifier of the charging station
   * @returns {Promise<Array>} Array of mapped charging post objects
   * @throws {Error} When API request fails
   */
  async getStationPosts(stationId) {
    try {
      const response = await apiClient.get(
        `/charging/station/posts/${stationId}`
      );
      console.log('API trả về trụ:', response.data);
      const mappedPosts = stationDataMapper.mapPostsFromApi(response.data);
      console.log('Mapped trụ:', mappedPosts);
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
   * Transform API errors into user-friendly error messages
   *
   * @param {Error} error - The original error object
   * @param {string} defaultMessage - Fallback error message
   * @returns {Error} New error with user-friendly message
   */
  handleError(error, defaultMessage) {
    // Handle HTTP response errors
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

    // Handle network errors
    if (error.request) {
      return new Error("Không thể kết nối đến server");
    }

    // Handle other errors
    return new Error(defaultMessage);
  },
};

/**
 * ===============================
 * DATA MAPPING UTILITIES
 * ===============================
 *
 * These utilities transform raw API data into UI-friendly formats
 */
export const stationDataMapper = {
  /**
   * Transform API station data to UI format
   *
   * @param {Object} apiStation - Raw station data from API
   * @returns {Object} UI-formatted station object
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

      // Computed fields for UI display
      distance: "N/A", // Will be calculated based on user location
      totalSlots: apiStation.numberOfPosts || 0,
      availableSlots: this.calculateAvailableSlots(apiStation.chargingPosts),
      power: this.calculateTotalPower(apiStation.chargingPosts),
      type: "AC/DC", // Simplified charging type
      openHours: "24/7", // Default operating hours
      rating: 0, // Placeholder for future feature
      reviewCount: 0, // Placeholder for future feature
    };
  },

  /**
   * Convert boolean active status to UI status string
   *
   * @param {boolean} active - Station active status from API
   * @returns {string} UI status: 'available' | 'maintenance'
   */
  mapActiveStatus(active) {
    return active ? "available" : "maintenance";
  },

  /**
   * Calculate number of available charging slots
   *
   * @param {Array} chargingPosts - Array of charging posts
   * @returns {number} Number of available slots
   */
  calculateAvailableSlots(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return 0;
    return chargingPosts.filter((post) => post.isAvailable === true).length;
  },

  /**
   * Calculate total power capacity of a station
   *
   * @param {Array} chargingPosts - Array of charging posts
   * @returns {string} Formatted power string (e.g., "150 kW")
   */
  calculateTotalPower(chargingPosts) {
    if (!Array.isArray(chargingPosts)) return "N/A";

    const totalPower = chargingPosts.reduce((sum, post) => {
      return sum + (post.maxPower || 0);
    }, 0);

    return totalPower > 0 ? `${totalPower} kW` : "N/A";
  },

  /**
   * Calculate comprehensive statistics for all stations
   *
   * @param {Array} stations - Array of station objects
   * @returns {Object} Statistics object with counts and totals
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
   * Transform array of API stations to UI format
   *
   * @param {Array} apiStations - Raw stations from API
   * @returns {Array} Array of UI-formatted station objects
   */
  mapStationsFromApi(apiStations) {
    if (!Array.isArray(apiStations)) return [];
    return apiStations.map((station) => this.mapStationFromApi(station));
  },

  /**
   * Transform API charging post data to UI format
   *
   * @param {Object} apiPost - Raw charging post data from API
   * @returns {Object} UI-formatted charging post object
   */
  mapPostFromApi(apiPost) {
    return {
      // Core post data
      id: apiPost.idChargingPost,
      name: apiPost.nameChargingPost || apiPost.name || `Trụ ${apiPost.idChargingPost}`,
      active: apiPost.active,
      maxPower: apiPost.maxPower || 0,
      chargingFeePerKWh: apiPost.chargingFeePerKWh || 0,
      chargingSessions: apiPost.chargingSessions || [],
      chargingTypes: apiPost.chargingType || [],

      // UI display fields
      powerDisplay: `${apiPost.maxPower || 0} kW`,
      feeDisplay: `${apiPost.chargingFeePerKWh || 0} VNĐ/kWh`,
      status: apiPost.active ? "available" : "maintenance",
      isAvailable:
        apiPost.active && !this.isPostBusy(apiPost.chargingSessions),
      supportedTypes: apiPost.chargingType?.map(
        (type) => type.typeName || type.name || "AC"
      ) || ["AC"],
    };
  },

  /**
   * Transform array of API charging posts to UI format
   *
   * @param {Array} apiPosts - Raw charging posts from API
   * @returns {Array} Array of UI-formatted charging post objects
   */
  mapPostsFromApi(apiPosts) {
    if (!Array.isArray(apiPosts)) return [];
    return apiPosts.map((post) => this.mapPostFromApi(post));
  },

  /**
   * Check if a charging post is currently in use
   *
   * @param {Array} chargingSessions - Array of charging sessions
   * @returns {boolean} True if post is busy
   */
  isPostBusy(chargingSessions) {
    if (!Array.isArray(chargingSessions)) return false;
    return chargingSessions.some(
      (session) => session.status === "ACTIVE" || session.status === "CHARGING"
    );
  },
};

export default chargingStationService;
