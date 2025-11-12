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

  // Tính khoảng cách giữa 2 điểm
  const getDistance = (lat1, lng1, lat2, lng2) => {
    if (window.L) {
      const from = window.L.latLng(lat1, lng1);
      const to = window.L.latLng(lat2, lng2);
      const d = from.distanceTo(to);
      return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
    }
    return "N/A";
  };

  // Tải danh sách trạm sạc và tính khoảng cách
  const fetchStations = async (userLoc = null) => {
    try {
      setLoading(true);
      setError(null);

      const stationsRaw = await chargingStationService.getAllStations();
      let stations = stationsRaw;

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

        stations = stations.sort((a, b) => {
          if (a.distance === "N/A") return 1;
          if (b.distance === "N/A") return -1;
          const getNum = (d) =>
            d.includes("km") ? parseFloat(d) * 1000 : parseFloat(d);
          return getNum(a.distance) - getNum(b.distance);
        });
      }

      setStations(stations);

      const stats = {
        totalStations: stations.length,
        availableStations: stations.filter((station) => station.active === true)
          .length,
        bookedStations: stations.filter((station) => station.active === false)
          .length,
      };
      setStatistics(stats);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách trạm sạc");
    } finally {
      setLoading(false);
    }
  };

  // Tải trạm gần nhất dựa trên vị trí
  const fetchNearestStations = async (lat, lng) => {
    try {
      setLoading(true);
      setError(null);

      const stations = await chargingStationService.getNearestStations(
        lat,
        lng
      );

      setStations(stations);
      setUserLocation({ lat, lng });

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
      setError(err.message || "Không thể tải danh sách trạm sạc gần bạn");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy vị trí user và fetch trạm
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
            fetchStations();
          }
        );
      } else {
        fetchStations();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Làm mới dữ liệu
  const refresh = () => {
    fetchStations();
  };

  // Xóa lỗi
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

  // Lấy trụ sạc theo ID trạm
  const fetchStationPosts = async (stationId) => {
    try {
      return await chargingStationService.getStationPosts(stationId);
    } catch (err) {
      throw err;
    }
  };

  // Lấy thông tin trụ sạc theo ID
  const fetchPostById = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      return await chargingStationService.getPostById(postId);
    } catch (err) {
      setError(err.message || "Không thể tải thông tin trụ sạc");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin trạm sạc theo ID
  const fetchStationById = async (stationId) => {
    try {
      return await chargingStationService.getStationById(stationId);
    } catch (err) {
      throw err;
    }
  };

  // Trả về dữ liệu và các hàm để sử dụng
  return {
    stations,
    statistics,
    loading,
    error,
    userLocation,
    fetchStations,
    fetchNearestStations,
    fetchStationsWithUserLocation,
    fetchStationPosts,
    fetchPostById,
    fetchStationById,
    refresh,
    clearError,
    hasData: stations.length > 0,
    isEmpty: !loading && stations.length === 0 && !error,
  };
};

export default useChargingStations;
