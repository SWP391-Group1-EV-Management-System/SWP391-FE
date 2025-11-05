/*
 * Hook tùy chỉnh cho quản lý dữ liệu trạm sạc
 * Đơn giản hóa việc gọi API và quản lý state
 */

import { useState, useEffect } from "react";
import { chargingStationService } from "../services/chargingStationService.js";

/**
 * Hook quản lý dữ liệu trạm sạc
 */
export const useChargingStations = (options = {}) => {
  const { autoFetch = true, useLocation = false } = options;

  // Khai báo các state cần thiết
  const [stations, setStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [statistics, setStatistics] = useState({
    totalStations: 0,
    availableStations: 0,
    bookedStations: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm tính khoảng cách giữa 2 điểm (Leaflet)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    if (window.L) {
      const from = window.L.latLng(lat1, lng1);
      const to = window.L.latLng(lat2, lng2);
      const d = from.distanceTo(to);
      return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
    }
    // Fallback nếu không có leaflet
    return "N/A";
  };

  // Hàm tải danh sách trạm sạc (tất cả) và tự động tính khoảng cách nếu có userLocation
  const fetchStations = async (userLoc = null) => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API để lấy danh sách trạm sạc
      const stationsRaw = await chargingStationService.getAllStations();
      let stations = stationsRaw;

      // Nếu có vị trí user, tính khoảng cách cho từng trạm
      if (userLoc && userLoc.lat && userLoc.lng) {
        stations = stationsRaw.map((station) => {
          if (station.lat && station.lng) {
            return {
              ...station,
              distance: getDistance(
                userLoc.lat,
                userLoc.lng,
                station.lat,
                station.lng
              ),
            };
          }
          return { ...station, distance: "N/A" };
        });
        // Sắp xếp từ gần đến xa
        stations = stations.sort((a, b) => {
          if (a.distance === "N/A") return 1;
          if (b.distance === "N/A") return -1;
          // Chuyển về số để so sánh
          const getNum = (d) =>
            d.includes("km") ? parseFloat(d) * 1000 : parseFloat(d);
          return getNum(a.distance) - getNum(b.distance);
        });
      }

      setStations(stations);

      // Tính toán thống kê từ dữ liệu API
      const stats = {
        totalStations: stations.length,
        availableStations: stations.filter((station) => station.active === true)
          .length,
        bookedStations: stations.filter((station) => station.active === false)
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

  // ⭐ MỚI: Hàm tải trạm gần nhất dựa trên vị trí
  const fetchNearestStations = async (lat, lng) => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API /available với location
      const stations = await chargingStationService.getNearestStations(
        lat,
        lng
      );
      console.log("📍 Trạm gần nhất từ API:", stations);

      setStations(stations);
      setUserLocation({ lat, lng });

      // Tính thống kê
      const stats = {
        totalStations: stations.length,
        availableStations: stations.filter((station) => station.active === true)
          .length,
        bookedStations: stations.filter((station) => station.active === false)
          .length,
      };
      setStatistics(stats);

      return stations;
    } catch (err) {
      console.error("Lỗi khi tải trạm gần nhất:", err);
      setError(err.message || "Không thể tải danh sách trạm sạc gần bạn");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Tự động lấy vị trí user và fetch trạm, tự tính khoảng cách
  const fetchStationsWithUserLocation = async () => {
    try {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            await fetchStations({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.warn("Không lấy được vị trí:", error);
            fetchStations();
          }
        );
      } else {
        console.warn("Trình duyệt không hỗ trợ định vị");
        fetchStations();
      }
    } catch (err) {
      console.error("Lỗi khi tải trạm với vị trí:", err);
      setError(err.message);
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
      if (useLocation) {
        fetchStationsWithUserLocation();
      } else {
        fetchStations();
      }
    }
  }, [autoFetch, useLocation]);

  // Hàm lấy trụ sạc theo ID trạm
  const fetchStationPosts = async (stationId) => {
    try {
      return await chargingStationService.getStationPosts(stationId);
    } catch (err) {
      console.error(`Lỗi khi tải trụ sạc cho trạm ${stationId}:`, err);
      throw err;
    }
  };

  // Hàm lấy thông tin trụ sạc theo ID
  const fetchPostById = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      return await chargingStationService.getPostById(postId);
    } catch (err) {
      console.error(`Lỗi khi tải thông tin trụ ${postId}:`, err);
      setError(err.message || "Không thể tải thông tin trụ sạc");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy thông tin trạm sạc theo ID
  const fetchStationById = async (stationId) => {
    try {
      return await chargingStationService.getStationById(stationId);
    } catch (err) {
      console.error(`Lỗi khi tải thông tin trạm ${stationId}:`, err);
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
    userLocation, // ⭐ MỚI: Vị trí user

    // Các hàm điều khiển
    fetchStations,
    fetchNearestStations, // ⭐ MỚI: Fetch theo location
    fetchStationsWithUserLocation, // ⭐ MỚI: Auto get location & fetch
    fetchStationPosts,
    fetchPostById,
    fetchStationById,
    refresh,
    clearError,

    // Trạng thái tiện ích
    hasData: stations.length > 0,
    isEmpty: !loading && stations.length === 0 && !error,
  };
};

export default useChargingStations;
