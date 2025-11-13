import { useState, useEffect } from 'react';
import { chargingStationService } from '../services/chargingStationService';

/**
 * Hook quản lý danh sách trụ sạc của một trạm cụ thể
 * Lấy thông tin chi tiết các trụ sạc và tính toán thống kê
 */
export const useStationPosts = (stationId) => {
  // State lưu trữ danh sách trụ sạc
  const [posts, setPosts] = useState([]);
  
  // State theo dõi trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(false);
  
  // State lưu thông báo lỗi nếu có
  const [error, setError] = useState(null);

  // Theo dõi sự thay đổi của stationId để tải lại dữ liệu
  useEffect(() => {
    // Nếu không có stationId thì xóa dữ liệu cũ
    if (!stationId) {
      setPosts([]);
      return;
    }
    
    // Hàm bất đồng bộ để tải danh sách trụ sạc
    const loadPosts = async () => {
      // Bắt đầu quá trình tải - hiển thị loading
      setLoading(true);
      setError(null);
      
      try {
        // Gọi API thật để lấy danh sách trụ sạc theo trạm
        const data = await chargingStationService.getStationPosts(stationId);
        setPosts(data || []);
      } catch (err) {
        // Xử lý lỗi - hiển thị thông báo cho người dùng
        setError(err.message || 'Không thể tải danh sách trụ sạc');
        setPosts([]);
      } finally {
        // Kết thúc quá trình tải - tắt loading
        setLoading(false);
      }
    };

    // Gọi hàm tải dữ liệu
    loadPosts();
  }, [stationId]); // Chỉ chạy lại khi stationId thay đổi

  /**
   * Tính toán thống kê trụ sạc theo trạng thái
   * Phân loại các trụ sạc thành 4 nhóm chính
   */
  const statistics = {
    // Tổng số trụ sạc trong trạm
    total: posts.length,
    
    // Số trụ sạc sẵn sàng (có thể sử dụng)
    available: posts.filter(p => p.isAvailable).length,
    
    // Số trụ sạc đang bận (không khả dụng nhưng vẫn hoạt động)
    busy: posts.length - posts.filter(p => p.isAvailable).length - posts.filter(p => !p.active).length,
    
    // Số trụ sạc không hoạt động (bảo trì, hỏng hóc)
    inactive: posts.filter(p => !p.active).length,
  };

  // Trả về tất cả dữ liệu cần thiết cho component
  return {
    posts,      // Danh sách chi tiết các trụ sạc
    loading,    // Trạng thái đang tải dữ liệu
    error,      // Thông báo lỗi (nếu có)
    statistics  // Thống kê tổng quan
  };
};

export default useStationPosts;