import api from "../utils/axios";

// Service for creating and updating charging stations
export const getStations = async () => {
  try {
    const response = await api.get("/api/charging/station/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }
};

export const getStationById = async (stationId) => {
  try {
    const response = await api.get(`/api/charging/station/${stationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching station by id:", error);
    throw error;
  }
};

export const createStation = async (data) => {
  try {
    const response = await api.post("/api/charging/station/create", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating station:", error);
    throw error.response?.data || error;
  }
};

export const updateStation = async (stationId, data) => {
  try {
    const response = await api.put(
      `/api/charging/station/update/${stationId}`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating station:", error);
    throw error.response?.data || error;
  }
};

export default {
  getStations,
  getStationById,
  createStation,
  updateStation,
};
