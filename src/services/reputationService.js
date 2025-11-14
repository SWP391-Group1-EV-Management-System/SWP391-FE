import api from "../utils/axios";

// Lấy danh sách tất cả reputation levels
export const getReputationLevels = async () => {
  try {
    const response = await api.get("/api/reputation-levels/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching reputation levels:", error);
    throw error;
  }
};

// Lấy chi tiết một reputation level
export const getReputationLevelById = async (levelId) => {
  try {
    const response = await api.get(`/api/reputation-levels/${levelId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reputation level:", error);
    throw error;
  }
};

// Tạo mới reputation level
export const createReputationLevel = async (data) => {
  try {
    console.log("Creating reputation level with data:", data);
    const response = await api.post("/api/reputation-levels/add", data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("Create reputation level response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating reputation level:", error);
    console.error("Error response:", error.response?.data);
    throw error.response?.data || error;
  }
};

// Cập nhật reputation level
export const updateReputationLevel = async (levelId, data) => {
  try {
    const response = await api.post(`/api/reputation-levels/update/${levelId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating reputation level:", error);
    throw error;
  }
};

// Xóa reputation level
export const deleteReputationLevel = async (levelId) => {
  try {
    const response = await api.delete(`/api/reputation-levels/delete/${levelId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting reputation level:", error);
    throw error;
  }
};