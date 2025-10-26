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
   * Mục đích: Kiểm tra xem user có đang trong phiên sạc nào không
   * API endpoint: GET /api/charging/session/current/{userID}
   */
  async getCurrentSession(userID) {
    try {
      // Gọi API để lấy thông tin phiên sạc hiện tại
      const response = await api.get(`/api/charging/session/current/${userID}`);

      // Kiểm tra response có data và success = true
      if (response.data && response.data.success) {
        return {
          success: true,
          // Map dữ liệu từ API sang format chuẩn của UI
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Lấy thông tin phiên sạc thành công",
        };
      } else {
        // Trường hợp không có phiên sạc đang hoạt động
        return {
          success: false,
          data: null,
          message:
            response.data?.message || "Không có phiên sạc đang hoạt động",
        };
      }
    } catch (error) {
      console.error("Error getting current session:", error);

      const statusCode = error.response?.status;

      // Xử lý lỗi 403: Không có quyền truy cập
      if (statusCode === 403) {
        return {
          success: false,
          data: null,
          message: "Bạn không có quyền truy cập phiên sạc",
          errorCode: 403,
        };
      }

      // Xử lý các lỗi khác
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể lấy thông tin phiên sạc",
        errorCode: statusCode,
      };
    }
  },

  /**
   * Lấy thông tin phiên sạc theo ID cụ thể
   * API: GET /api/charging/session/show/{sessionId}
   * Lưu ý: Backend trả về trực tiếp object ChargingSessionResponse, không có wrapper {success, data}
   */
  async getSessionById(sessionId) {
    try {
      console.log("🔍 Đang lấy thông tin phiên sạc với ID:", sessionId);

      // Gọi API lấy thông tin phiên sạc theo ID
      const response = await api.get(`/api/charging/session/show/${sessionId}`);

      console.log("✅ Response từ API getSessionById:", response.data);

      // BE trả về trực tiếp object ChargingSessionResponse (không có wrapper)
      if (response.data) {
        return {
          success: true,
          // Map dữ liệu theo format ChargingSessionResponse
          data: this.mapSessionResponseFromApi(response.data),
          message: "Lấy thông tin phiên sạc thành công",
        };
      } else {
        // Trường hợp không có data trong response
        return {
          success: false,
          data: null,
          message: "Không tìm thấy phiên sạc",
          errorCode: 404,
        };
      }
    } catch (error) {
      console.error("❌ Error getting session by ID:", error);

      const statusCode = error.response?.status;

      // Xử lý lỗi 403: Không có quyền truy cập phiên sạc này
      if (statusCode === 403) {
        return {
          success: false,
          data: null,
          message: "Bạn không có quyền truy cập phiên sạc này",
          errorCode: 403,
        };
      }

      // Xử lý lỗi 404: Không tìm thấy phiên sạc
      if (statusCode === 404) {
        return {
          success: false,
          data: null,
          message: "Không tìm thấy phiên sạc",
          errorCode: 404,
        };
      }

      // Xử lý các lỗi khác
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể lấy thông tin phiên sạc",
        errorCode: statusCode,
      };
    }
  },

  /**
   * Tạo phiên sạc mới (phương thức cũ - giữ lại để tương thích ngược)
   * Lưu ý: Hàm này xử lý nhiều format response khác nhau từ backend:
   * - Format 1: Backend trả về plain string (sessionId)
   * - Format 2: Backend trả về object {chargingSessionId, ...}
   * - Format 3: Backend trả về {success: true, data: ...}
   */
  async createSession(bookingData) {
    try {
      console.log("📤 Gửi request tạo phiên sạc:", bookingData);

      // Gọi API tạo phiên sạc mới
      const response = await api.post(
        "/api/charging/session/create",
        bookingData
      );

      console.log("📥 Response từ BE:", response);
      console.log("📥 Response.data type:", typeof response.data);
      console.log("📥 Response.data value:", response.data);

      // Trường hợp 1: Backend trả về plain string sessionId (ví dụ: "AFJPV2552")
      // Đây là format đơn giản nhất, chỉ trả về ID của phiên sạc vừa tạo
      if (typeof response.data === "string" && response.data.trim() !== "") {
        const sessionId = response.data.trim();
        console.log("✅ Nhận được sessionId (string):", sessionId);

        return {
          success: true,
          data: {
            chargingSessionId: sessionId,
            sessionId: sessionId, // Alias để dễ sử dụng ở UI
            message: "Tạo phiên sạc thành công",
          },
          message: "Tạo phiên sạc thành công",
        };
      }

      // Trường hợp 2: Backend trả về object có chứa chargingSessionId
      // Format này có thể kèm theo thông tin bổ sung khác
      if (response.data?.chargingSessionId) {
        console.log(
          "✅ Nhận được sessionId (object):",
          response.data.chargingSessionId
        );
        return {
          success: true,
          data: {
            chargingSessionId: response.data.chargingSessionId,
            sessionId: response.data.chargingSessionId, // Alias
            message: response.data.message || "Tạo phiên sạc thành công",
            ...response.data, // Spread các field khác nếu có
          },
          message: "Tạo phiên sạc thành công",
        };
      }

      // Trường hợp 3: Backend trả về 200/201 nhưng không có dữ liệu rõ ràng
      // Xử lý trường hợp backend chỉ trả về status code thành công
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Tạo phiên sạc thành công (unknown format)");

        return {
          success: true,
          data: {
            message: response.data || "Tạo phiên sạc thành công",
            sessionId: null,
            chargingSessionId: null,
          },
          message: "Tạo phiên sạc thành công",
        };
      }

      // Trường hợp 4: Response có success field (format chuẩn)
      // Backend trả về object {success: true, data: {...}}
      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Tạo phiên sạc thành công",
        };
      }

      // Trường hợp thất bại - không match với bất kỳ format nào ở trên
      return {
        success: false,
        data: null,
        message: response.data?.message || "Không thể tạo phiên sạc",
      };
    } catch (error) {
      // Log chi tiết lỗi để debug
      console.group("❌ createSession Error");
      console.error("Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response Data:", error.response?.data);
      console.groupEnd();

      // Trả về object lỗi với thông tin chi tiết
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Lỗi khi tạo phiên sạc",
        errorDetails: {
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  /**
   * Tạo phiên sạc mới với format mới phù hợp Backend
   * Đây là phiên bản mới hơn của createSession, thử nhiều endpoint và format payload khác nhau
   * để tương thích với nhiều phiên bản backend khác nhau
   */
  async createChargingSession(chargingSessionRequest) {
    try {
      console.log("Gửi request tạo phiên sạc:", chargingSessionRequest);

      // Danh sách các endpoint có thể sử dụng (thử lần lượt đến khi nào thành công)
      // Vì không chắc chắn backend đang dùng endpoint nào
      const endpoints = [
        "/api/charging/session/create",
        "/api/session/create",
        "/api/chargingSession/create",
        "/api/charging-session/create",
      ];

      // Tạo payload đơn giản hơn từ chargingSessionRequest
      // Chỉ lấy các field cần thiết nhất
      const simplePayload = {
        chargingPostId:
          chargingSessionRequest?.booking?.chargingPost?.idChargingPost,
        expectedEndTime: chargingSessionRequest?.expectedEndTime,
      };

      let response;
      let lastError;

      // Vòng lặp qua tất cả các endpoint
      for (const endpoint of endpoints) {
        // Thử cả 2 format payload: complex (đầy đủ) và simple (rút gọn)
        const payloads = [chargingSessionRequest, simplePayload];

        // Thử từng payload với endpoint hiện tại
        for (let i = 0; i < payloads.length; i++) {
          try {
            console.log(`🔄 Thử endpoint: ${endpoint} với payload ${i + 1}/2`);
            console.log("Payload:", payloads[i]);

            // Gọi API với endpoint và payload hiện tại
            response = await api.post(endpoint, payloads[i]);
            console.log(
              `✅ Thành công với endpoint: ${endpoint}, payload ${i + 1}`,
              response.data
            );

            // Nếu thành công, thoát khỏi cả 2 vòng lặp (dùng break và kiểm tra response sau)
            break;
          } catch (err) {
            // Log lỗi nhưng tiếp tục thử các endpoint/payload khác
            console.log(
              `❌ Endpoint ${endpoint} payload ${i + 1} failed:`,
              err.response?.status,
              err.response?.data
            );
            lastError = err; // Lưu lại lỗi cuối cùng để throw nếu tất cả đều fail
          }
        }

        // Nếu có response thành công thì thoát vòng lặp endpoint
        if (response) break;
      }

      // Nếu tất cả endpoint và payload đều fail, throw lỗi cuối cùng
      if (!response) {
        throw lastError;
      }

      console.log("Response từ API:", response.data);

      // Backend trả về string message, không có object {success, data}
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
        // Trường hợp không thành công
        return {
          success: false,
          data: null,
          message: "Không thể tạo phiên sạc",
        };
      }
    } catch (error) {
      console.error("Lỗi khi tạo phiên sạc:", error);

      // Xử lý các loại lỗi khác nhau

      // Lỗi có response từ server (4xx, 5xx)
      if (error.response) {
        return {
          success: false,
          data: null,
          message:
            error.response.data?.message ||
            error.response.data ||
            "Lỗi từ server",
        };
      }
      // Lỗi không nhận được response (network error, timeout)
      else if (error.request) {
        return {
          success: false,
          data: null,
          message: "Không thể kết nối đến server",
        };
      }
      // Lỗi khác (lỗi khi setup request)
      else {
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
   * Mục đích: Cho phép pause/resume/stop phiên sạc
   * API: PUT /api/charging/session/{sessionId}/status
   */
  async updateSessionStatus(sessionId, status) {
    try {
      // Gọi API cập nhật trạng thái
      const response = await api.put(
        `/api/charging/session/${sessionId}/status`,
        {
          status: status,
        }
      );

      // Kiểm tra response thành công
      if (response.data && response.data.success) {
        return {
          success: true,
          data: this.mapSessionDataFromApi(response.data.data),
          message: "Cập nhật trạng thái thành công",
        };
      } else {
        // Trường hợp không thành công
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
   * Map dữ liệu từ API response sang format UI
   * Mục đích: Chuyển đổi dữ liệu từ backend format sang frontend format
   * Đảm bảo UI luôn nhận được data với cấu trúc nhất quán
   */
  mapSessionDataFromApi(apiData) {
    // Kiểm tra null/undefined
    if (!apiData) return null;

    return {
      // ===== Session basic info =====
      sessionId: apiData.chargingSessionId,
      stationName: apiData.chargingStation?.name || "Trạm sạc", // Tên trạm, fallback nếu null
      address: apiData.chargingStation?.address || "", // Địa chỉ trạm

      // ===== Battery and charging info =====
      batteryLevel: apiData.currentBatteryLevel || 0, // % pin hiện tại
      energyCharged: apiData.energyConsumed || "0", // Năng lượng đã sạc (kWh)
      chargingPower: apiData.chargingPower || "0", // Công suất sạc hiện tại (kW)

      // ===== Time info =====
      timeElapsed: this.formatDuration(apiData.duration || 0), // Thời gian đã sạc (format mm:ss)
      estimatedTimeLeft: this.calculateTimeLeft(apiData), // Thời gian còn lại dự kiến
      startTime: apiData.startTime, // Thời điểm bắt đầu
      endTime: apiData.endTime, // Thời điểm kết thúc

      // ===== Technical details =====
      socketType: apiData.chargingPost?.connectorType || "Unknown", // Loại cổng sạc (Type 2, CCS, CHAdeMO...)
      power: `${apiData.chargingPost?.power || 0}kW`, // Công suất tối đa của cổng
      voltage: apiData.voltage || "0V", // Điện áp
      current: apiData.current || "0A", // Dòng điện

      // ===== Pricing info =====
      estimatedCost: apiData.totalCost || "0", // Chi phí dự kiến/tổng chi phí
      pricePerKwh: apiData.pricePerKwh || "0", // Giá theo kWh
      pricePerMin: apiData.pricePerMin || "0", // Giá theo phút (nếu có)

      // ===== Status =====
      status: this.mapStatusFromApi(apiData.status), // Map status sang format UI

      // ===== Booking info =====
      // Lưu lại thông tin booking liên quan để reference nếu cần
      bookingData: {
        bookingId: apiData.booking?.bookingId,
        userId: apiData.booking?.userId,
        chargingStationId: apiData.booking?.chargingStationId,
        chargingPostId: apiData.booking?.chargingPostId,
      },
    };
  },

  /**
   * Map dữ liệu từ API GET /api/charging/session/show/{sessionId}
   * Response format: ChargingSessionResponse
   * Khác với mapSessionDataFromApi, function này xử lý format đặc biệt của endpoint show
   */
  mapSessionResponseFromApi(apiData) {
    // Kiểm tra null và log warning nếu thiếu data
    if (!apiData) {
      console.warn("⚠️ mapSessionResponseFromApi: apiData is null");
      return null;
    }

    const mappedData = {
      // Keep raw data for reference
      rawData: apiData,

      // Pass through BE ChargingSessionDetail fields (use same names so UI can access directly)
      chargingSessionId: apiData.chargingSessionId,
      expectedEndTime: apiData.expectedEndTime,
      booking: apiData.booking,
      chargingPost: apiData.chargingPost,
      station: apiData.station,
      stationName: apiData.stationName,
      addressStation: apiData.addressStation,
      pricePerKWH: apiData.pricePerKWH,
      maxPower: apiData.maxPower,
      typeCharging: apiData.typeCharging || [],
      user: apiData.user,
      userManage: apiData.userManage,
      startTime: apiData.startTime,

      // ===== Backward compatible aliases and UI-friendly fields =====
      sessionId: apiData.chargingSessionId,
      stationNameDisplay: apiData.stationName || "Trạm sạc",
      address: apiData.addressStation || "",

      // ===== Battery and charging info (best-effort) =====
      batteryLevel: 0,
      energyCharged: apiData.kwh?.toString() || "0",
      chargingPower: "0",

      // ===== Time info =====
      timeElapsed: this.calculateElapsedTime(apiData.startTime, apiData.endTime),
      estimatedTimeLeft: this.calculateRemainingTime(apiData.expectedEndTime),
      endTime: apiData.endTime,

      // ===== IDs =====
      chargingPostId: apiData.chargingPost,
      stationId: apiData.station,
      userId: apiData.user,
      userManageId: apiData.userManage,

      // ===== Technical defaults =====
      socketType: apiData.chargingPost?.connectorType || "Type 2",
      power: apiData.chargingPost?.power ? `${apiData.chargingPost.power}kW` : "0kW",
      voltage: apiData.voltage || "0V",
      current: apiData.current || "0A",

      // ===== Pricing info =====
      estimatedCost: apiData.totalAmount?.toString() || "0",
      totalAmount: apiData.totalAmount || 0,
      pricePerKwh: apiData.pricePerKwh || apiData.pricePerKWH || "0",

      // ===== Status =====
      status: apiData.done ? "completed" : "charging",
      isDone: apiData.done || false,

      // ===== Booking info =====
      bookingData: {
        bookingId: apiData.booking || "",
        userId: apiData.user,
        chargingStationId: apiData.station,
        chargingPostId: apiData.chargingPost,
      },
    };

    return mappedData;
  },

  /**
   * Map status từ API sang UI format
   * Mục đích: Chuẩn hóa status để UI có thể xử lý nhất quán
   */
  mapStatusFromApi(apiStatus) {
    // Object map từ API status sang UI status
    const statusMap = {
      ACTIVE: "charging", // Đang sạc
      PAUSED: "paused", // Tạm dừng
      COMPLETED: "completed", // Hoàn thành
      CANCELLED: "cancelled", // Đã hủy
      PENDING: "pending", // Chờ xử lý
    };

    // Trả về status đã map, fallback về "unknown" nếu không tìm thấy
    return statusMap[apiStatus] || "unknown";
  },

  /**
   * Format duration từ seconds sang mm:ss hoặc hh:mm:ss
   * Ví dụ:
   * - 65 seconds -> "01:05"
   * - 3665 seconds -> "01:01:05"
   */
  formatDuration(seconds) {
    // Tính số giờ
    const hours = Math.floor(seconds / 3600);
    // Tính số phút (lấy phần dư sau khi chia cho giờ, rồi chia cho 60)
    const minutes = Math.floor((seconds % 3600) / 60);
    // Tính số giây còn lại
    const secs = seconds % 60;

    // Nếu có giờ thì format hh:mm:ss
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      // Nếu không có giờ thì format mm:ss
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  },

  /**
   * Tính toán thời gian còn lại dự kiến dựa trên % pin và công suất sạc
   * Công thức: (% pin cần sạc) / (công suất sạc) * 60 = số phút còn lại
   */
  calculateTimeLeft(sessionData) {
    // Kiểm tra có đủ dữ liệu để tính không
    if (!sessionData.targetBatteryLevel || !sessionData.currentBatteryLevel) {
      return "00:00";
    }

    // Tính % pin còn lại cần sạc
    const remainingBattery =
      sessionData.targetBatteryLevel - sessionData.currentBatteryLevel;

    // Lấy công suất sạc (kW), fallback về 1 để tránh chia cho 0
    const chargingRate = sessionData.chargingPower || 1;

    // Tính số phút còn lại
    // remainingBattery / chargingRate = số giờ còn lại -> * 60 = số phút
    const estimatedMinutes = Math.ceil((remainingBattery / chargingRate) * 60);

    // Convert phút sang giây rồi format
    return this.formatDuration(estimatedMinutes * 60);
  },

  /**
   * Tính toán thời gian đã trôi qua giữa startTime và endTime (hoặc hiện tại)
   * Dùng cho: Hiển thị thời gian đã sạc trong phiên hiện tại hoặc đã hoàn thành
   */
  calculateElapsedTime(startTime, endTime) {
    // Kiểm tra có startTime không
    if (!startTime) return "00:00";

    // Convert startTime sang Date object
    const start = new Date(startTime);
    // Nếu có endTime thì dùng endTime, không thì dùng thời điểm hiện tại
    const end = endTime ? new Date(endTime) : new Date();
    // Tính chênh lệch thời gian bằng milliseconds, sau đó chia 1000 để ra giây
    const diffInSeconds = Math.floor((end - start) / 1000);

    // Format và đảm bảo không âm (Math.max với 0)
    return this.formatDuration(Math.max(0, diffInSeconds));
  },

  /**
   * Tính toán thời gian còn lại đến expectedEndTime
   * Dùng cho: Hiển thị countdown thời gian còn lại của phiên sạc
   */
  calculateRemainingTime(expectedEndTime) {
    // Kiểm tra có expectedEndTime không
    if (!expectedEndTime) return "00:00";

    // Convert expectedEndTime sang Date object
    const expected = new Date(expectedEndTime);
    // Lấy thời điểm hiện tại
    const now = new Date();
    // Tính chênh lệch thời gian bằng giây
    const diffInSeconds = Math.floor((expected - now) / 1000);

    // Nếu đã quá thời gian dự kiến (số âm), trả về 00:00
    if (diffInSeconds <= 0) return "00:00";

    // Format thời gian còn lại
    return this.formatDuration(diffInSeconds);
  },
};
