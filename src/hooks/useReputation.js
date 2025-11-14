import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import {
  getReputationLevels,
  getReputationLevelById,
  createReputationLevel,
  updateReputationLevel,
  deleteReputationLevel
} from '../services/reputationService';

export const useReputation = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách tất cả levels
  const fetchLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReputationLevels();
      setLevels(data);
      return data;
    } catch (err) {
      setError(err);
      message.error('Không thể tải danh sách mức uy tín');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết một level
  const fetchLevelById = async (levelId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReputationLevelById(levelId);
      return data;
    } catch (err) {
      setError(err);
      message.error('Không thể tải thông tin mức uy tín');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Tạo mới level
  const createLevel = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createReputationLevel(data);
      message.success('Tạo mức uy tín thành công');
      await fetchLevels(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      message.error('Không thể tạo mức uy tín');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật level
  const updateLevel = async (levelId, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateReputationLevel(levelId, data);
      message.success('Cập nhật mức uy tín thành công');
      await fetchLevels(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      message.error('Không thể cập nhật mức uy tín');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa level
  const deleteLevel = async (levelId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteReputationLevel(levelId);
      message.success('Xóa mức uy tín thành công');
      await fetchLevels(); // Refresh list
    } catch (err) {
      setError(err);
      message.error('Không thể xóa mức uy tín');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return {
    levels,
    loading,
    error,
    fetchLevels,
    fetchLevelById,
    createLevel,
    updateLevel,
    deleteLevel
  };
};