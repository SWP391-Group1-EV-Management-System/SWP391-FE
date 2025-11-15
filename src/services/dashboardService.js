import api from "../utils/axios";

export const getDashboardInformation = async () => {
  try {
    const response = await api.get("/api/admin/dashboard/information");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard information:", error);
    throw error;
  }
};