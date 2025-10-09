/*
 * Hook tùy chỉnh cho quản lý dữ liệu trạm sạc
 * Đơn giản hóa việc gọi API và quản lý state
 */

import { useState, useEffect } from "react";
import { chargingStationService } from "../services/chargingStationService.js";

/**
 * Hook quản lý dữ liệu trạm sạc
 * @param {Object} options - Tùy chọn cấu hình
 * @returns {Object} Dữ liệu và các hàm điều khiển
 */
export const useChargingStations = (options = {}) => {
  const { autoFetch = true } = options;

  // Khai báo các state cần thiết
  const [stations, setStations] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStations: 0,
    availableStations: 0,
    bookedStations: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm tải danh sách trạm sạc
  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API để lấy danh sách trạm sạc
      const stations = await chargingStationService.getAllStations();
      setStations(stations);

      // Tính toán thống kê từ dữ liệu API
      const stats = {
        totalStations: stations.length,
        availableStations: stations.filter(
          (station) => station.status === "available"
        ).length,
        bookedStations: stations.filter((station) => station.status === "busy")
          .length,
      };
      setStatistics(stats);
    } catch (err) {
      console.error("Lỗi khi tải trạm sạc:", err);
      setError(err.message || "Không thể tải danh sách trạm sạc");
    } finally {
      setLoading(false);
    }
  };

  // Hàm làm mới dữ liệu
  const refresh = () => {
    fetchStations();
  };

  // Hàm xóa lỗi
  const clearError = () => {
    setError(null);
  };

  // Tự động tải dữ liệu khi component được mount
  useEffect(() => {
    if (autoFetch) {
      fetchStations();
    }
  }, [autoFetch]);

  // Hàm lấy trụ sạc theo ID trạm
  const fetchStationPosts = async (stationId) => {
    try {
      return await chargingStationService.getStationPosts(stationId);
    } catch (err) {
      console.error(`Lỗi khi tải trụ sạc cho trạm ${stationId}:`, err);
      throw err;
    }
  };

  // Trả về dữ liệu và các hàm để sử dụng
  return {
    // Dữ liệu chính
    stations,
    statistics,
    loading,
    error,

    // Các hàm điều khiển
    fetchStations,
    fetchStationPosts,
    refresh,
    clearError,

    // Trạng thái tiện ích
    hasData: stations.length > 0,
    isEmpty: !loading && stations.length === 0 && !error,
  };
};

export default useChargingStations;
