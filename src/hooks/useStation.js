import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import {
  getStations,
  getStationById,
  createStation,
  updateStation,
} from "../services/stationService";

// Helper to normalize station object keys for UI
const normalize = (s) => {
  if (!s) return {};
  return {
    stationId:
      s.stationId ||
      s.id ||
      s.idChargingStation ||
      s.id_charging_station ||
      null,
    name: s.nameChargingStation || s.name || s.nameChargingStation || "",
    address: s.address || "",
    numberOfPosts: s.numberOfPosts ?? s.totalSlots ?? 0,
    userManagerId: s.userManagerId || s.managerId || s.userManager || "",
    active: typeof s.active === "boolean" ? s.active : s.isActive ?? true,
    raw: s,
  };
};

export const useStation = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStations();
      // normalize array
      const normalized = Array.isArray(data) ? data.map(normalize) : [];
      setStations(normalized);
      return normalized;
    } catch (err) {
      setError(err);
      message.error("Không thể tải danh sách trạm");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStationById = async (stationId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStationById(stationId);
      return normalize(data);
    } catch (err) {
      setError(err);
      message.error("Không thể tải thông tin trạm");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNewStation = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createStation(data);
      message.success("Tạo trạm thành công");
      await fetchStations();
      return result;
    } catch (err) {
      setError(err);
      message.error("Không thể tạo trạm");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingStation = async (stationId, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateStation(stationId, data);
      message.success("Cập nhật trạm thành công");
      await fetchStations();
      return result;
    } catch (err) {
      setError(err);
      message.error("Không thể cập nhật trạm");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return {
    stations,
    loading,
    error,
    fetchStations,
    fetchStationById,
    createNewStation,
    updateExistingStation,
  };
};

export default useStation;
