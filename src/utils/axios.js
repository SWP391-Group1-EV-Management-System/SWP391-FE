import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  try {
    const res = await api.post('/users/re-login');
    // Backend trả về string "Tạo mới token thành công"
    console.log('✅ Refresh token thành công:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Refresh token thất bại:', error.response?.status);
    throw error;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ KHÔNG retry cho các endpoint public (login, re-login)
    const publicEndpoints = ['/users/login', '/users/re-login'];
    if (publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))) {
      return Promise.reject(error);
    }

    // ✅ Chỉ xử lý 401 hoặc 403 và chưa retry
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      
      // 🔍 Check xem có phải token expired không
      const errorData = error.response.data;
      const isTokenExpired = 
        typeof errorData === 'string' && (errorData.includes('Token expired') || errorData.includes('Invalid token')) ||
        errorData?.error === 'Token expired' ||
        errorData?.error === 'Invalid token';

      // ⚠️ Nếu là 403, có thể do token hết hạn → Thử refresh
      if (error.response?.status === 403 || isTokenExpired) {
        console.log('⚠️ Token có thể hết hạn (401/403), thử refresh...');
      } else {
        // ❌ Không phải token expired → Có thể là unauthorized khác
        console.warn('⚠️ Unauthorized nhưng không phải token expired:', errorData);
        return Promise.reject(error);
      }

      // 🔄 Nếu đang refresh, thêm vào queue
      if (isRefreshing) {
        console.log('⏳ Đang refresh token, thêm request vào queue...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log('🔄 Retry request sau khi refresh:', originalRequest.url);
            return api(originalRequest);
          })
          .catch((err) => {
            console.error('❌ Retry thất bại:', err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Bắt đầu refresh token...');
        await refreshAccessToken();
        
        // ✅ Refresh thành công → Retry tất cả requests
        processQueue(null);
        
        console.log('✅ Refresh thành công, retry request gốc:', originalRequest.url);
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Refresh token thất bại:', refreshError.response?.status);
        
        // ❌ Refresh thất bại → Clear queue và logout
        processQueue(refreshError);
        
        // 🚨 Redirect về login nếu refresh token hết hạn
        if (refreshError.response?.status === 401) {
          console.warn('🚨 Refresh token hết hạn → Redirect về login');
          
          // Clear user state nếu có
          localStorage.removeItem('user'); // Nếu bạn lưu user info
          
          // Redirect về login
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { refreshAccessToken };