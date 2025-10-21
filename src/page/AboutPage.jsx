import React from "react";
import "../assets/styles/WelcomePageBody.css";
import {
  MdOutlineLocationOn,
  MdPhoneIphone,
  MdOutlineMailOutline,
  MdOutlineContactPage,
} from "react-icons/md";
import SocialFooter from "../components/welcome/SocialFooter";

function WelcomePageBody() {
  return (
    <>
      <div className="welcomePageBody-header">
        <div className="welcomePageBody-cover-background">
          {/* Title Section */}
          <div className="welcomePageBody-content">
            <div className="welcomePageBody-title-header">Eco-Z</div>
            <div className="welcomePageBody-title-subheader">
              Sạc nhanh – Xanh sạch – An toàn tuyệt đối
            </div>
          </div>

          {/* Main Content Container - overlapping both header and body */}
          <div className="main-content-container">
            {/* Stats Section */}
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-number green">20+</div>
                <div className="stat-title">Trụ sạc</div>
                <div className="stat-description">
                  Phủ sóng rộng khắp,
                  <br />
                  sẵn sàng phục vụ lúc nào.
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number green">100+</div>
                <div className="stat-title">Người dùng tin chọn</div>
                <div className="stat-description">
                  Tin tương và đồng hành
                  <br />
                  cùng dịch vụ sạc xanh.
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number green">250 kW</div>
                <div className="stat-title">Công suất</div>
                <div className="stat-description">
                  Sạc siêu nhanh, tiết kiệm
                  <br />
                  tối đa thời gian.
                </div>
              </div>
            </div>

            {/* Package Cards Section */}
            <div className="package-section">
              <div className="package-card">
                <div className="package-header">
                  <div className="package-badge">Gói 1</div>
                  <div className="package-subtitle">Dành cho gia đình</div>
                </div>
                <div className="package-price">50.000vnđ</div>
                <button className="package-btn">Mua ngay</button>
                <div className="package-features">
                  <div className="feature">✓ Sạc 300kWh</div>
                  <div className="feature">✓ Ưu tiên sạc ưu tiên</div>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <div className="package-badge">Gói 1</div>
                  <div className="package-subtitle">Dành cho gia đình</div>
                </div>
                <div className="package-price">50.000vnđ</div>
                <button className="package-btn">Mua ngay</button>
                <div className="package-features">
                  <div className="feature">✓ Sạc 300kWh</div>
                  <div className="feature">✓ Ưu tiên sạc ưu tiên</div>
                </div>
              </div>

              <div className="package-card box">
                <div className="package-header">
                  <div className="package-badge">Gói 1</div>
                  <div className="package-subtitle">Dành cho gia đình</div>
                </div>
                <div className="package-price">50.000vnđ</div>
                <button className="package-btn">Mua ngay</button>
                <div className="package-features">
                  <div className="feature">✓ Sạc 300kWh</div>
                  <div className="feature">✓ Ưu tiên sạc ưu tiên</div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
              <div className="main-title">
                SẠC NHANH - XANH - AN TOÀN CÙNG ECO-Z
              </div>
              <button className="register-btn">Đăng ký miễn phí →</button>
            </div>

            {/* Footer Section */}
            <div className="footer-section">
              <img src="src/assets/images/logo.png" alt="Logo" />
              <div className="contact-info">
                <div className="contact-title">
                  <MdOutlineLocationOn size={20} /> ĐỊA CHỈ
                </div>
                <div className="contact-detail">
                  Lô E2a-7, Đường D1, Khu Công nghệ cao,
                  <br />
                  Phường Tăng Nhơn Phú, TP HCM
                </div>
              </div>
              <div className="contact-info">
                <div className="contact-title">
                  <MdOutlineContactPage size={20} /> LIÊN HỆ
                </div>

                <div className="contact-detail">
                  <MdPhoneIphone size={20} /> Điện thoại: (028) 7300 6588
                </div>
                <div className="contact-detail">
                  <MdOutlineMailOutline size={20} /> Email: kho2032@gmail.com
                </div>
              </div>
              <div className="contact-info">
                <SocialFooter />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePageBody;
