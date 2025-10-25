# Protected Routes Documentation

## Tổng quan

Hệ thống Protected Routes được tạo để bảo vệ các trang yêu cầu xác thực và phân quyền người dùng. Hệ thống bao gồm:

- `ProtectedRoute`: Component chính để bảo vệ route
- `AdminRoute`: Route chỉ dành cho Admin
- `StaffRoute`: Route dành cho Staff và Admin
- `ManagerRoute`: Route dành cho Manager và Admin
- `RootRedirect`: Component điều hướng thông minh từ trang chủ

## Cách sử dụng

### 1. ProtectedRoute - Bảo vệ route cơ bản

```jsx
import { ProtectedRoute } from './components/auth';

// Route yêu cầu đăng nhập
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Route với role cụ thể
<Route path="/admin" element={
  <ProtectedRoute requiredRoles="ADMIN">
    <AdminPanel />
  </ProtectedRoute>
} />

// Route với nhiều role
<Route path="/management" element={
  <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
    <ManagementPanel />
  </ProtectedRoute>
} />
```

### 2. AdminRoute - Chỉ dành cho Admin

```jsx
import { AdminRoute } from "./components/auth";

<Route
  path="/admin-dashboard"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>;
```

### 3. StaffRoute - Dành cho Staff và Admin

```jsx
import { StaffRoute } from "./components/auth";

<Route
  path="/staff-panel"
  element={
    <StaffRoute>
      <StaffPanel />
    </StaffRoute>
  }
/>;
```

## Tính năng

### 1. Xác thực tự động

- Kiểm tra token/session trong localStorage
- Fetch user profile khi cần thiết
- Hiển thị loading state trong khi kiểm tra

### 2. Điều hướng thông minh

- Redirect về `/login` khi chưa đăng nhập
- Lưu intended destination để redirect lại sau khi login
- Redirect về `/app/home` khi không có quyền truy cập

### 3. Phân quyền linh hoạt

- Hỗ trợ single role: `requiredRoles="ADMIN"`
- Hỗ trợ multiple roles: `requiredRoles={['ADMIN', 'STAFF']}`
- Component wrapper sẵn cho các role phổ biến

### 4. Trải nghiệm người dùng tốt

- Loading state khi đang kiểm tra xác thực
- Error handling cho các trường hợp lỗi
- Preserve redirect destination sau khi login

## Cấu trúc trong App.jsx

```jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Smart root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected main app */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* User routes */}
          <Route path="home" element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin only */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Staff and Admin */}
          <Route
            path="staff"
            element={
              <StaffRoute>
                <StaffPanel />
              </StaffRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Role hierarchy

```
ADMIN     -> Có quyền truy cập tất cả
MANAGER   -> Có quyền quản lý, không có quyền admin
STAFF     -> Có quyền nhân viên
DRIVER    -> Chỉ có quyền cơ bản của tài xế
```

## Troubleshooting

### 1. Infinite redirect loop

- Kiểm tra logic trong `useAuth` hook
- Đảm bảo `fetchUserProfile` không gọi liên tục
- Kiểm tra localStorage có token hợp lệ

### 2. Role không được nhận diện

- Kiểm tra structure của `user.role` trong response
- Đảm bảo role được lưu đúng format (string hoặc array)
- Kiểm tra logic so sánh role trong component

### 3. Loading state không kết thúc

- Kiểm tra `setIsInitialized(true)` được gọi trong mọi trường hợp
- Đảm bảo `fetchUserProfile` resolve/reject đúng cách
- Kiểm tra error handling trong `useAuth`
