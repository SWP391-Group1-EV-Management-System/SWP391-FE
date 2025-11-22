import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  getChargingTypes,
} from "../services/postService";

const normalize = (p) => {
  if (!p) return {};
  return {
    postId: p.postId || p.id || p.idChargingPost || null,
    name: p.nameChargingPost || p.name || `Post ${p.idChargingPost || p.id}`,
    chargingTypes: p.chargingType || p.chargingTypes || [],
    chargingStationId:
      p.chargingStationId || p.id_charging_station || p.chargingStation || null,
    maxPower: p.maxPower || p.max_power || 0,
    chargingFeePerKWh:
      p.chargingFeePerKWh || p.charging_fee_per_kwh || p.fee || 0,
    active: typeof p.active === "boolean" ? p.active : p.is_active ?? true,
    raw: p,
  };
};

export const usePost = () => {
  const [posts, setPosts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts();
      const normalized = Array.isArray(data) ? data.map(normalize) : [];
      setPosts(normalized);
      return normalized;
    } catch (err) {
      setError(err);
      message.error("Không thể tải danh sách trụ");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostById = async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPostById(postId);
      return normalize(data);
    } catch (err) {
      setError(err);
      message.error("Không thể tải thông tin trụ");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = useCallback(async () => {
    try {
      const data = await getChargingTypes();
      setTypes(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error loading charging types", err);
      message.error("Không thể tải danh sách loại sạc");
      throw err;
    }
  }, []);

  const createNewPost = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPost(payload);
      message.success("Tạo trụ thành công");
      await fetchPosts();
      return result;
    } catch (err) {
      setError(err);
      message.error("Không thể tạo trụ");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingPost = async (postId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updatePost(postId, payload);
      message.success("Cập nhật trụ thành công");
      await fetchPosts();
      return result;
    } catch (err) {
      setError(err);
      message.error("Không thể cập nhật trụ");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTypes();
  }, [fetchPosts, fetchTypes]);

  return {
    posts,
    types,
    loading,
    error,
    fetchPosts,
    fetchPostById,
    fetchTypes,
    createNewPost,
    updateExistingPost,
  };
};

export default usePost;
