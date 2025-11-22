import api from "../utils/axios";

// Service for charging posts (trụ sạc)
export const getPosts = async () => {
  try {
    const res = await api.get("/api/charging/post/all");
    return res.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error.response?.data || error;
  }
};

export const getPostById = async (postId) => {
  try {
    const res = await api.get(`/api/charging/post/${postId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error.response?.data || error;
  }
};

export const createPost = async (data) => {
  try {
    const res = await api.post("/api/charging/post/create", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error.response?.data || error;
  }
};

export const updatePost = async (postId, data) => {
  try {
    const res = await api.put(`/api/charging/post/update/${postId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error.response?.data || error;
  }
};

export const getChargingTypes = async () => {
  try {
    const res = await api.get("/api/charging/type/all");
    return res.data;
  } catch (error) {
    console.error("Error fetching charging types:", error);
    throw error.response?.data || error;
  }
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  getChargingTypes,
};
