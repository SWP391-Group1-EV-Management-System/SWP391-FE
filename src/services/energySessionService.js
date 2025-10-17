/**
 * ENERGY SESSION SERVICE
 *
 * Service để xử lý các API liên quan đến phiên sạc năng lượng
 * Bao gồm tạo phiên sạc, lấy thông tin phiên sạc hiện tại, cập nhật trạng thái
 */

import axios from "axios";
// enable sending cookies for all axios requests
axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Create configured axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const energySessionService = {
  /**
   * Lấy thông tin phiên sạc hiện tại của user
   * @param {string} userId - ID của user
   * @returns {Promise<Object>} Thông tin phiên sạc
   */
  async getCurrentSession(userId) {
    try {
      const response = await apiClient.get(`/charging/session/current/${userId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Lấy thông tin phiên sạc thành công"
        };
      } else {
        return {
          success: false,
          data: null,
          message: response.data?.message || "Không có phiên sạc đang hoạt động"
        };
      }
    } catch (error) {
      console.error("Error getting current session:", error);
      return {
        success: false,
        data: null,
        message: "Không thể lấy thông tin phiên sạc"
      };
    }
  },

  /**
   * Tạo phiên sạc mới
   * @param {Object} bookingData - Dữ liệu booking
   * @returns {Promise<Object>} Thông tin phiên sạc được tạo
   */
  async createSession(bookingData) {
    try {
      const response = await apiClient.post("/charging/session/create", bookingData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Tạo phiên sạc thành công"
        };
      } else {
        return {
          success: false,
          data: null,
          message: response.data?.message || "Không thể tạo phiên sạc"
        };
      }
    } catch (error) {
      console.error("Error creating session:", error);
      return {
        success: false,
        data: null,
        message: "Lỗi khi tạo phiên sạc"
      };
    }
  },

  /**
   * Cập nhật trạng thái phiên sạc
   * @param {string} sessionId - ID của phiên sạc
   * @param {string} status - Trạng thái mới (start, pause, stop)
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updateSessionStatus(sessionId, status) {
    try {
      const response = await apiClient.put(`/charging/session/${sessionId}/status`, {
        status: status
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Cập nhật trạng thái thành công"
        };
      } else {
        return {
          success: false,
          message: response.data?.message || "Không thể cập nhật trạng thái"
        };
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      return {
        success: false,
        message: "Lỗi khi cập nhật trạng thái"
      };
    }
  },

  /**
   * Lấy lịch sử phiên sạc
   * @param {string} userId - ID của user
   * @param {Object} options - Tùy chọn phân trang
   * @returns {Promise<Object>} Danh sách lịch sử
   */
  async getSessionHistory(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const response = await apiClient.get(`/charging/session/history/${userId}`, {
        params: { page, limit }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data.map(session => this.mapSessionDataFromApi(session)),
          pagination: response.data.pagination,
          message: "Lấy lịch sử thành công"
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.data?.message || "Không thể lấy lịch sử"
        };
      }
    } catch (error) {
      console.error("Error getting session history:", error);
      return {
        success: false,
        data: [],
        message: "Lỗi khi lấy lịch sử phiên sạc"
      };
    }
  },

  /**
   * Map dữ liệu từ API response sang format UI
   * @param {Object} apiData - Dữ liệu từ API
   * @returns {Object} Dữ liệu đã được format
   */
  mapSessionDataFromApi(apiData) {
    if (!apiData) return null;

    return {
      // Session basic info
      sessionId: apiData.chargingSessionId,
      stationName: apiData.chargingStation?.name || "Trạm sạc",
      address: apiData.chargingStation?.address || "",
      
      // Battery and charging info
      batteryLevel: apiData.currentBatteryLevel || 0,
      energyCharged: apiData.energyConsumed || "0",
      chargingPower: apiData.chargingPower || "0",
      
      // Time info
      timeElapsed: this.formatDuration(apiData.duration || 0),
      estimatedTimeLeft: this.calculateTimeLeft(apiData),
      startTime: apiData.startTime,
      endTime: apiData.endTime,
      
      // Technical details
      socketType: apiData.chargingPost?.connectorType || "Unknown",
      power: `${apiData.chargingPost?.power || 0}kW`,
      voltage: apiData.voltage || "0V",
      current: apiData.current || "0A",
      
      // Pricing info
      estimatedCost: apiData.totalCost || "0",
      pricePerKwh: apiData.pricePerKwh || "0",
      pricePerMin: apiData.pricePerMin || "0",
      
      // Status
      status: this.mapStatusFromApi(apiData.status),
      
      // Booking info
      bookingData: {
        bookingId: apiData.booking?.bookingId,
        userId: apiData.booking?.userId,
        chargingStationId: apiData.booking?.chargingStationId,
        chargingPostId: apiData.booking?.chargingPostId
      }
    };
  },

  /**
   * Map status từ API sang UI format
   * @param {string} apiStatus - Status từ API
   * @returns {string} Status cho UI
   */
  mapStatusFromApi(apiStatus) {
    const statusMap = {
      'ACTIVE': 'charging',
      'PAUSED': 'paused',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
      'PENDING': 'pending'
    };
    
    return statusMap[apiStatus] || 'unknown';
  },

  /**
   * Format duration từ seconds sang mm:ss hoặc hh:mm:ss
   * @param {number} seconds - Số giây
   * @returns {string} Thời gian đã format
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  },

  /**
   * Tính toán thời gian còn lại dự kiến
   * @param {Object} sessionData - Dữ liệu phiên sạc
   * @returns {string} Thời gian còn lại
   */
  calculateTimeLeft(sessionData) {
    if (!sessionData.targetBatteryLevel || !sessionData.currentBatteryLevel) {
      return "00:00";
    }
    
    const remainingBattery = sessionData.targetBatteryLevel - sessionData.currentBatteryLevel;
    const chargingRate = sessionData.chargingPower || 1;
    const estimatedMinutes = Math.ceil((remainingBattery / chargingRate) * 60);
    
    return this.formatDuration(estimatedMinutes * 60);
  }
};