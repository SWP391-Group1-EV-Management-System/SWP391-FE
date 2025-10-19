import api from '../utils/axios';

/**
 * Đăng nhập
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    
    // Backend set cookies (jwt, refresh) qua Set-Cookie
    const data = response.data;
    
    return {
      success: true,
      message: typeof data === 'string' ? data : data?.message || 'Đăng nhập thành công!',
      data: data || null,
    };
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error('Sai tài khoản hoặc mật khẩu');
    }
    
    const serverMsg = typeof error.response?.data === 'string'
      ? error.response.data
      : error.response?.data?.message || 'Đăng nhập thất bại';
    
    throw new Error(serverMsg);
  }
};

/**
 * Đăng xuất
 */
export const logoutApi = async () => {
  try {
    const response = await api.post('/users/logout');
    
    // Hiển thị thông báo thành công
    const msg = typeof response.data === 'string' 
      ? response.data 
      : 'Đăng xuất thành công!';
    
    console.log(msg);
    return response;
    
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    throw new Error('Đăng xuất thất bại');
  }
};

/**
 * Lấy thông tin user hiện tại
 * QUAN TRỌNG: Không catch lỗi 401 ở đây để interceptor xử lý
 */
export const getUserProfile = async () => {
  try {
    console.log('📡 Đang gọi API /api/users/me...');
    const response = await api.get('/api/users/me');
    
    console.log('✅ Lấy thông tin user thành công:', response.data);
    
    // Trả về user object (có thể wrapped hoặc không)
    return response.data?.user || response.data;
    
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin user:', error.response?.status, error.message);
    
    // KHÔNG catch 401 ở đây - để interceptor xử lý
    // Chỉ throw lỗi lên để caller xử lý
    throw error;
  }
};

export default { login, logoutApi, getUserProfile };