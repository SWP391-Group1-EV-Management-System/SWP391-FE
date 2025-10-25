/**
 * ENERGY SESSION SERVICE
 *
 * Service để xử lý các API liên quan đến phiên sạc năng lượng
 * Bao gồm tạo phiên sạc, lấy thông tin phiên sạc hiện tại, cập nhật trạng thái
 */

import api from "../utils/axios";

export const energySessionService = {
  /**
   * Lấy thông tin phiên sạc hiện tại của user
   */
  async getCurrentSession(userID) {
    try {
      const response = await api.get(`/api/charging/session/current/${userID}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Lấy thông tin phiên sạc thành công",
        };
      } else {
        return {
          success: false,
          data: null,
          message:
            response.data?.message || "Không có phiên sạc đang hoạt động",
        };
      }
    } catch (error) {
      console.error("Error getting current session:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể lấy thông tin phiên sạc",
      };
    }
  },

  /**
   * Tạo phiên sạc mới (cách cũ - tương thích ngược)
   */
  async createSession(bookingData) {
    try {
      const response = await api.post(
        "/api/charging/session/create",
        bookingData
      );

      // Backend trả về plain text: "Charging Session create completed successfully"
      // Kiểm tra status code 200/201 = success
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          data: {
            message: response.data, // Plain text message từ backend
            sessionId: null, // Backend không trả về session ID
          },
          message: "Tạo phiên sạc thành công",
        };
      }

      // Nếu response.data là object và có success field
      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Tạo phiên sạc thành công",
        };
      }

      return {
        success: false,
        data: null,
        message: response.data?.message || "Không thể tạo phiên sạc",
      };
    } catch (error) {
      console.group("❌ createSession Error");
      console.error("Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response Data:", error.response?.data);
      console.groupEnd();

      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Lỗi khi tạo phiên sạc",
      };
    }
  },

  /**
   * Tạo phiên sạc mới với format mới phù hợp Backend
   * @param {Object} chargingSessionRequest - Request object chứa booking và expectedEndTime
   */
  async createChargingSession(chargingSessionRequest) {
    try {
      console.log("Gửi request tạo phiên sạc:", chargingSessionRequest);

      // Thử các endpoint khác nhau dựa trên backend code
      const endpoints = [
        "/api/charging/session/create",
        "/api/session/create",
        "/api/chargingSession/create",
        "/api/charging-session/create",
      ];

      // Thử cả 2 format payload
      const simplePayload = {
        chargingPostId:
          chargingSessionRequest?.booking?.chargingPost?.idChargingPost,
        expectedEndTime: chargingSessionRequest?.expectedEndTime,
      };

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        // Thử với cả complex payload và simple payload
        const payloads = [chargingSessionRequest, simplePayload];

        for (let i = 0; i < payloads.length; i++) {
          try {
            console.log(`🔄 Thử endpoint: ${endpoint} với payload ${i + 1}/2`);
            console.log("Payload:", payloads[i]);

            response = await api.post(endpoint, payloads[i]);
            console.log(
              `✅ Thành công với endpoint: ${endpoint}, payload ${i + 1}`,
              response.data
            );

            // Nếu thành công, thoát khỏi cả 2 vòng lặp
            break;
          } catch (err) {
            console.log(
              `❌ Endpoint ${endpoint} payload ${i + 1} failed:`,
              err.response?.status,
              err.response?.data
            );
            lastError = err;
          }
        }

        // Nếu có response thì thoát vòng lặp endpoint
        if (response) break;
      }

      if (!response) {
        throw lastError;
      }

      console.log("Response từ API:", response.data);

      // Backend trả về string message, không có object success
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: {
            sessionId: null, // Backend không trả sessionId trong response này
            message: response.data,
          },
          message: response.data,
        };
      } else {
        return {
          success: false,
          data: null,
          message: "Không thể tạo phiên sạc",
        };
      }
    } catch (error) {
      console.error("Lỗi khi tạo phiên sạc:", error);

      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        return {
          success: false,
          data: null,
          message:
            error.response.data?.message ||
            error.response.data ||
            "Lỗi từ server",
        };
      } else if (error.request) {
        return {
          success: false,
          data: null,
          message: "Không thể kết nối đến server",
        };
      } else {
        return {
          success: false,
          data: null,
          message: "Lỗi không xác định",
        };
      }
    }
  },

  /**
   * Cập nhật trạng thái phiên sạc
   */
  async updateSessionStatus(sessionId, status) {
    try {
      const response = await api.put(
        `/api/charging/session/${sessionId}/status`,
        {
          status: status,
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Cập nhật trạng thái thành công",
        };
      } else {
        return {
          success: false,
          message: response.data?.message || "Không thể cập nhật trạng thái",
        };
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi cập nhật trạng thái",
      };
    }
  },

  /**
   * Lấy lịch sử phiên sạc
   */
  async getSessionHistory(userID, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const response = await api.get(
        `/api/charging/session/history/${userID}`,
        {
          params: { page, limit },
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data.map((session) =>
            this.mapSessionDataFromApi(session)
          ),
          pagination: response.data.pagination,
          message: "Lấy lịch sử thành công",
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.data?.message || "Không thể lấy lịch sử",
        };
      }
    } catch (error) {
      console.error("Error getting session history:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Lỗi khi lấy lịch sử phiên sạc",
      };
    }
  },

  /**
   * Map dữ liệu từ API response sang format UI
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
        chargingPostId: apiData.booking?.chargingPostId,
      },
    };
  },

  /**
   * Map status từ API sang UI format
   */
  mapStatusFromApi(apiStatus) {
    const statusMap = {
      ACTIVE: "charging",
      PAUSED: "paused",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
      PENDING: "pending",
    };

    return statusMap[apiStatus] || "unknown";
  },

  /**
   * Format duration từ seconds sang mm:ss hoặc hh:mm:ss
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  },

  /**
   * Tính toán thời gian còn lại dự kiến
   */
  calculateTimeLeft(sessionData) {
    if (!sessionData.targetBatteryLevel || !sessionData.currentBatteryLevel) {
      return "00:00";
    }

    const remainingBattery =
      sessionData.targetBatteryLevel - sessionData.currentBatteryLevel;
    const chargingRate = sessionData.chargingPower || 1;
    const estimatedMinutes = Math.ceil((remainingBattery / chargingRate) * 60);

    return this.formatDuration(estimatedMinutes * 60);
  },
};
