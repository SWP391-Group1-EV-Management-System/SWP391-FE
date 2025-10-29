/**
 * HOOK: useEnergySession (v2 - Optimized)
 *
 * Hook quản lý state và logic của phiên sạc năng lượng
 *
 * Chức năng chính:
 * - Fetch thông tin phiên sạc từ API (theo sessionId hoặc userId)
 * - Tự động kết thúc phiên sạc khi đến expectedEndTime
 * - Cung cấp function để kết thúc phiên sạc thủ công
 * - Xử lý error và loading states
 *
 * ĐÃ BỎ: Auto polling mỗi 30s (không cần thiết, tốn tài nguyên)
 * ĐÃ THÊM: Auto finish khi đến expectedEndTime
 *
 * @param {string|null} userID - ID của user hiện tại
 * @returns {Object} - Object chứa sessionData và các methods
 */

import { useState, useEffect, useRef } from "react";
import { getStatusConfig } from "../utils/energyUtils";
import { message } from "antd";
import api from "../utils/axios";

export const useEnergySession = (userID = null) => {
  // ==================== STATES ====================
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pausedAt, setPausedAt] = useState(null); // ISO string or Date
  const [isFinishing, setIsFinishing] = useState(false); // Đang finish session

  // Ref để tránh gọi finish nhiều lần
  const autoFinishTriggered = useRef(false);

  // ==================== EFFECT: FETCH SESSION DATA ====================
  useEffect(() => {
    fetchSessionData();
  }, [userID]);

  const fetchSessionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      const storedSessionId = localStorage.getItem("currentSessionId");

      if (storedSessionId) {
        const sessionResult = await fetchBySessionId(storedSessionId);

        if (sessionResult.success) {
          setSessionData(sessionResult.data);
          setIsLoading(false);
          return;
        }

        if (sessionResult.errorCode === 403) {
          setError("Bạn không có quyền truy cập phiên sạc này");
          setErrorCode(403);
          setIsLoading(false);
          return;
        }

        if (sessionResult.errorCode === 404) {
          console.log("Session không tồn tại, xóa khỏi localStorage");
          localStorage.removeItem("currentSessionId");
        }

        if (sessionResult.errorCode) {
          setError(
            sessionResult.message || "Không thể lấy thông tin phiên sạc"
          );
          setErrorCode(sessionResult.errorCode);
          setIsLoading(false);
          return;
        }
      }

      if (!userID) {
        setIsLoading(false);
        setError("Vui lòng đăng nhập để xem phiên sạc");
        console.warn("useEnergySession: userID is null or undefined");
        return;
      }

      const userResult = await fetchByUserId(userID);

      if (userResult.success) {
        setSessionData(userResult.data);
      } else {
        setSessionData(null);

        if (userResult.errorCode === 403) {
          setError("Bạn không có quyền truy cập phiên sạc");
          setErrorCode(403);
        } else {
          setError(userResult.message || "Không có phiên sạc đang hoạt động");
          setErrorCode(userResult.errorCode);
        }
      }
    } catch (err) {
      console.error("Error fetching session data:", err);
      setError("Không thể tải thông tin phiên sạc");
      setSessionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== EFFECT: UPDATE CURRENT TIME ====================
  // currentTime normally increments every second. When `pausedAt` is set
  // we stop advancing the clock so the UI can freeze and later resume
  // from the paused moment (without counting the paused duration).
  useEffect(() => {
    if (pausedAt) {
      // Ensure currentTime shows the paused moment
      try {
        const d = typeof pausedAt === "string" ? new Date(pausedAt) : pausedAt;
        if (!isNaN(d)) setCurrentTime(new Date(d));
      } catch (e) {
        console.warn("Invalid pausedAt value:", pausedAt, e);
      }

      // Do not start the ticking interval while paused
      return;
    }

    // If not paused, tick by incrementing previous time by 1s so that
    // resuming continues from the paused moment instead of jumping.
    // Initialize to now if currentTime is not set.
    setCurrentTime((prev) => (prev instanceof Date ? prev : new Date()));

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        try {
          return new Date(prev.getTime() + 1000);
        } catch (e) {
          return new Date();
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pausedAt]);

  // Restore paused state from localStorage on mount (if any)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentSessionPausedAt");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.time) {
          setPausedAt(parsed.time);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // ==================== EFFECT: AUTO FINISH KHI ĐẾN EXPECTED END TIME ====================
  useEffect(() => {
    // Chỉ chạy khi có sessionData và chưa done
    if (!sessionData?.expectedEndTime || sessionData?.isDone) {
      return;
    }

    // Reset flag khi session mới
    autoFinishTriggered.current = false;

    const checkAndAutoFinish = async () => {
      try {
        const expectedEnd = new Date(sessionData.expectedEndTime);
        const now = new Date();

        // Kiểm tra đã đến giờ kết thúc chưa
        const shouldFinish = now >= expectedEnd;

        if (shouldFinish && !autoFinishTriggered.current && !isFinishing) {
          console.log("⏰ Đã đến expectedEndTime, tự động kết thúc phiên sạc");

          autoFinishTriggered.current = true; // Đánh dấu đã trigger

          const totalEnergy = calculateEnergyCharged(sessionData);

          message.info(
            "Đã đến thời gian kết thúc dự kiến, đang kết thúc phiên sạc..."
          );

          const result = await finishSession(
            sessionData.chargingSessionId,
            totalEnergy
          );

          if (result.success) {
            message.success("Phiên sạc đã kết thúc tự động");
            await refetch(); // Refresh data
          }
        }
      } catch (error) {
        console.error("Error in auto finish:", error);
      }
    };

    // Check mỗi giây
    const interval = setInterval(checkAndAutoFinish, 1000);

    return () => clearInterval(interval);
  }, [sessionData?.expectedEndTime, sessionData?.isDone, isFinishing]);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Tính tổng năng lượng đã sạc
   * Công thức: energy (kWh) = maxPower (kW) × time (hours)
   */
  const calculateEnergyCharged = (session) => {
    try {
      const startTime = session?.startTime ? new Date(session.startTime) : null;
      const maxPower = session?.maxPower;

      if (!startTime || !maxPower) {
        return 0;
      }

      const now = new Date();
      const diffSeconds = Math.max(
        0,
        Math.floor((now.getTime() - startTime.getTime()) / 1000)
      );
      const hours = diffSeconds / 3600;
      const energyCharged = maxPower * hours;

      return Number(energyCharged.toFixed(2));
    } catch (error) {
      console.error("Error calculating energy charged:", error);
      return 0;
    }
  };

  /**
   * Lấy session theo sessionId
   */
  const fetchBySessionId = async (sessionId) => {
    console.log("🔍 Lấy session từ sessionId:", sessionId);

    try {
      const response = await api.get(`/api/charging/session/show/${sessionId}`);

      if (response.data) {
        console.log("✅ Đã lấy session từ sessionId");

        // Map API response to internal shape
        const mapped = mapSessionResponseFromApi(response.data);

        // Check if we have a local finished marker for this session -> if so
        // override the mapped values so the finished state persists across reloads
        try {
          const finishedRaw = localStorage.getItem("currentSessionFinished");
          if (finishedRaw) {
            const finished = JSON.parse(finishedRaw);
            if (finished && String(finished.sessionId) === String(sessionId)) {
              console.log(
                "ℹ️ Applying local finished marker for session",
                sessionId
              );
              const overridden = {
                ...mapped,
                isDone: true,
                status: "completed",
                endTime: finished.endTime || mapped.endTime,
                energyCharged:
                  finished.energyCharged !== undefined
                    ? finished.energyCharged
                    : mapped.energyCharged,
                rawData: {
                  ...(mapped.rawData || {}),
                  done: true,
                  endTime: finished.endTime || mapped.endTime,
                },
              };

              return { success: true, data: overridden };
            }
          }
        } catch (e) {
          console.warn("Failed to apply finished marker:", e);
        }

        return {
          success: true,
          data: mapped,
        };
      }

      return {
        success: false,
        errorCode: 404,
        message: "Không tìm thấy session",
      };
    } catch (error) {
      console.warn("⚠️ Không tìm thấy session với ID:", sessionId);
      return {
        success: false,
        errorCode: error.response?.status,
        message: error.response?.data?.message || "Không tìm thấy session",
      };
    }
  };

  /**
   * Lấy session theo userId (placeholder - nếu có API này)
   */
  const fetchByUserId = async (userId) => {
    console.log("🔍 Lấy session theo userID:", userId);

    // TODO: Implement nếu BE có API get session by userId
    // Hiện tại BE chỉ có GET /api/charging/session/show/{sessionId}

    return {
      success: false,
      errorCode: 404,
      message: "Không có phiên sạc đang hoạt động",
    };
  };

  // ==================== PUBLIC METHODS ====================

  /**
   * Pause the internal clock at a specific ISO timestamp so the UI freezes.
   * This will also persist `currentSessionPausedAt` to localStorage for
   * cross-component visibility.
   */
  const pauseTimer = (pausedAtIso) => {
    try {
      const iso = pausedAtIso || new Date().toISOString();
      setPausedAt(iso);
      localStorage.setItem(
        "currentSessionPausedAt",
        JSON.stringify({ sessionId: localStorage.getItem("currentSessionId"), time: iso })
      );
    } catch (e) {
      console.warn("Failed to persist currentSessionPausedAt:", e);
      setPausedAt(pausedAtIso || new Date().toISOString());
    }
  };

  /**
   * Resume the internal clock (remove paused state) and clear persisted marker.
   */
  const resumeTimer = () => {
    try {
      setPausedAt(null);
      localStorage.removeItem("currentSessionPausedAt");
    } catch (e) {
      console.warn("Failed to remove currentSessionPausedAt:", e);
      setPausedAt(null);
    }
  };

  /**
   * Kết thúc phiên sạc
   * Gọi API: POST /api/charging/session/finish/{sessionId}
   * Body: BigDecimal kWh
   */
  const finishSession = async (sessionId, totalEnergy) => {
    if (isFinishing) {
      console.log("⚠️ Đang xử lý finish session, bỏ qua request này");
      return { success: false, message: "Đang xử lý..." };
    }

    try {
      setIsFinishing(true);

      console.log("🏁 Hoàn thành phiên sạc:", {
        sessionId,
        totalEnergy: `${totalEnergy} kWh`,
      });

      const response = await api.post(
        `/api/charging/session/finish/${sessionId}`,
        totalEnergy, // Gửi số trực tiếp (BigDecimal)
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Response từ finish session:", response);

      if (response.status === 200) {
        const resultMessage =
          response.data || "Hoàn thành phiên sạc thành công";

        // If backend returns a new session id, update stored id.
        // Otherwise keep the existing `currentSessionId` until a new session starts.
        try {
          const returnedId =
            response.data?.newSessionId ||
            response.data?.sessionId ||
            response.data?.chargingSessionId;

          // If backend returns a new session id, update stored id.
          if (returnedId) {
            const stored = localStorage.getItem("currentSessionId");
            // Only update if different or not present
            if (!stored || stored !== String(returnedId)) {
              localStorage.setItem("currentSessionId", String(returnedId));
            }

            // If the returned id is different from the finished session, clear any finished marker
            if (String(returnedId) !== String(sessionId)) {
              localStorage.removeItem("currentSessionFinished");
            }
          }

          // Persist finished marker so reload keeps finished state
          const nowIso = new Date().toISOString();
          const finishedMarker = {
            sessionId: sessionId,
            endTime: nowIso,
            energyCharged:
              typeof totalEnergy === "number"
                ? String(totalEnergy)
                : totalEnergy,
          };

          try {
            localStorage.setItem(
              "currentSessionFinished",
              JSON.stringify(finishedMarker)
            );
          } catch (e) {
            console.warn("Failed to write currentSessionFinished:", e);
          }

          // Update sessionData to reflect finished state so the user stays on the
          // session page (stop live energy calc, keep realtime clock, disable finish button)
          setSessionData((prev) => {
            if (!prev) return prev;

            // Merge finished fields into current session data
            const updated = {
              ...prev,
              endTime: nowIso,
              isDone: true,
              status: "completed",
              // store the final energy value (string or number as existing code expects)
              energyCharged: finishedMarker.energyCharged,
              // reflect in rawData if present
              rawData: {
                ...(prev.rawData || {}),
                done: true,
                endTime: nowIso,
              },
            };

            return updated;
          });
        } catch (e) {
          console.warn(
            "Failed to inspect/modify currentSessionId in localStorage:",
            e
          );
        }

        return {
          success: true,
          message: resultMessage,
          data: {
            sessionId: sessionId,
            totalEnergy: totalEnergy,
          },
        };
      } else {
        return {
          success: false,
          message: "Không thể hoàn thành phiên sạc",
          errorCode: response.status,
        };
      }
    } catch (error) {
      console.error("❌ Error finishing session:", error);

      const statusCode = error.response?.status;
      let errorMessage = "Lỗi khi hoàn thành phiên sạc";

      if (statusCode === 404) {
        errorMessage = "Không tìm thấy phiên sạc";
      } else if (statusCode === 403) {
        errorMessage = "Bạn không có quyền hoàn thành phiên sạc này";
      } else if (statusCode === 400) {
        errorMessage = error.response?.data || "Dữ liệu không hợp lệ";
      } else if (error.response?.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
        errorCode: statusCode,
      };
    } finally {
      setIsFinishing(false);
    }
  };

  /**
   * Reload lại dữ liệu phiên sạc
   */
  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const storedSessionId = localStorage.getItem("currentSessionId");

      if (storedSessionId) {
        console.log("🔄 Refetch session từ sessionId:", storedSessionId);
        const response = await api.get(
          `/api/charging/session/show/${storedSessionId}`
        );

        if (response.data) {
          // Map and apply finished marker if present so reload keeps finished state
          const mapped = mapSessionResponseFromApi(response.data);
          try {
            const finishedRaw = localStorage.getItem("currentSessionFinished");
            if (finishedRaw) {
              const finished = JSON.parse(finishedRaw);
              if (
                finished &&
                String(finished.sessionId) === String(storedSessionId)
              ) {
                const overridden = {
                  ...mapped,
                  isDone: true,
                  status: "completed",
                  endTime: finished.endTime || mapped.endTime,
                  energyCharged:
                    finished.energyCharged !== undefined
                      ? finished.energyCharged
                      : mapped.energyCharged,
                  rawData: {
                    ...(mapped.rawData || {}),
                    done: true,
                    endTime: finished.endTime || mapped.endTime,
                  },
                };

                setSessionData(overridden);
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            console.warn("Failed to apply finished marker on refetch:", e);
          }

          setSessionData(mapped);
          setIsLoading(false);
          return;
        } else {
          console.warn("⚠️ Không tìm thấy session khi refetch");
          localStorage.removeItem("currentSessionId");
        }
      }

      // Không có session
      setSessionData(null);
      setError("Không có phiên sạc đang hoạt động");
    } catch (err) {
      console.error("Error refetching session data:", err);
      setError("Không thể tải lại thông tin phiên sạc");
      setSessionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== MAPPING FUNCTION ====================

  /**
   * Map dữ liệu từ API GET /api/charging/session/show/{sessionId}
   * Response format: ChargingSessionDetail
   */
  const mapSessionResponseFromApi = (apiData) => {
    if (!apiData) {
      console.warn("⚠️ mapSessionResponseFromApi: apiData is null");
      return null;
    }

    return {
      rawData: apiData,

      // Main fields từ ChargingSessionDetail
      chargingSessionId: apiData.chargingSessionId,
      sessionId: apiData.chargingSessionId, // Alias
      expectedEndTime: apiData.expectedEndTime,
      booking: apiData.booking,
      chargingPost: apiData.chargingPost,
      station: apiData.station,
      stationName: apiData.stationName,
      addressStation: apiData.addressStation,
      address: apiData.addressStation || "",
      pricePerKWH: apiData.pricePerKWH,
      maxPower: apiData.maxPower,
      typeCharging: apiData.typeCharging || [],
      user: apiData.user,
      userId: apiData.user,
      userManage: apiData.userManage,
      userManageId: apiData.userManage,
      startTime: apiData.startTime,

      // Battery info (calculated hoặc mặc định)
      batteryLevel: 0,
      energyCharged: "0",
      chargingPower: "0",

      // Time info
      endTime: apiData.endTime,

      // IDs
      chargingPostId: apiData.chargingPost,
      stationId: apiData.station,

      // Technical
      socketType: apiData.typeCharging?.[0] || "Type 2",
      power: apiData.maxPower ? `${apiData.maxPower}kW` : "0kW",
      voltage: "0V",
      current: "0A",

      // Pricing
      estimatedCost: "0",
      totalAmount: 0,
      pricePerKwh: apiData.pricePerKWH || "0",

      // Status
      status: apiData.done ? "completed" : "charging",
      isDone: apiData.done || false,

      // Booking
      bookingData: {
        bookingId: apiData.booking || "",
        userId: apiData.user,
        chargingStationId: apiData.station,
        chargingPostId: apiData.chargingPost,
      },
    };
  };

  // ==================== COMPUTED VALUES ====================
  const statusConfig = sessionData ? getStatusConfig(sessionData.status) : null;

  // ==================== RETURN ====================
  return {
    // States
    sessionData,
    setSessionData,
    currentTime,
    pausedAt,
    statusConfig,
    isLoading,
    isFinishing, // Thêm flag đang finish
    error,
    errorCode,

    // Methods
    finishSession, // Kết thúc phiên sạc (gọi API BE)
    pauseTimer,
    resumeTimer,
    refetch, // Reload dữ liệu
  };
};
