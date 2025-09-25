import React from "react";

function HomePage() {
  return (
    <div className="page-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1>Trang chủ</h1>
            <p>Chào mừng bạn đến với hệ thống quản lý sạc xe điện Eco-Z</p>
            
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Thông tin tổng quan</h5>
                <p className="card-text">
                  Đây là trang chủ của hệ thống quản lý trạm sạc xe điện. 
                  Bạn có thể điều hướng đến các chức năng khác thông qua menu bên trái.
                </p>
              </div>
            </div>

            {/* Thêm nhiều content để test scroll */}
            <div className="row">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Trạm sạc gần nhất</h5>
                    <p className="card-text">Tìm trạm sạc gần bạn nhất</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Lịch sử sạc</h5>
                    <p className="card-text">Xem lại các phiên sạc đã thực hiện</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Thanh toán</h5>
                    <p className="card-text">Quản lý phương thức thanh toán</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thêm content dài để test scroll */}
            <div className="mt-4">
              <h3>Về Eco-Z</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              
              <h3>Tính năng nổi bật</h3>
              <ul>
                <li>Tìm kiếm trạm sạc thông minh</li>
                <li>Đặt trước trạm sạc</li>
                <li>Thanh toán không tiền mặt</li>
                <li>Theo dõi lịch sử sạc</li>
                <li>Quản lý gói dịch vụ</li>
              </ul>

              <h3>Hướng dẫn sử dụng</h3>
              <p>1. Đăng ký tài khoản</p>
              <p>2. Tìm trạm sạc gần nhất</p>
              <p>3. Đặt trước hoặc sạc trực tiếp</p>
              <p>4. Thanh toán và theo dõi</p>
              
              <div style={{ height: '500px', backgroundColor: '#e9ecef', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
                <h4>Khu vực test scroll</h4>
                <p>Đây là khu vực để test scroll. Nếu bạn thấy phần này thì scroll đã hoạt động tốt!</p>
                <div style={{ marginTop: '200px' }}>
                  <p>Nội dung ở giữa...</p>
                </div>
                <div style={{ marginTop: '200px' }}>
                  <p>Cuối khu vực test scroll.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
