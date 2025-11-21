import React from "react";
import { Link } from "react-router";
import "../assets/styles/WelcomePageBody.css";
import {
  MdOutlineLocationOn,
  MdPhoneIphone,
  MdOutlineMailOutline,
  MdOutlineContactPage,
  MdArrowForward,
} from "react-icons/md";
import { GiCheckMark } from "react-icons/gi";
import SocialFooter from "../components/welcome/SocialFooter";
import usePackage from "../hooks/usePackage";
import { useEffect } from "react";

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

            {/* Package Cards Section (from API) */}
            <div className="package-section">
              {/* Hook to load packages */}
              {/* We'll render loading state or mapped packages */}
              {(() => {
                const { packages, loading, error, fetchAll } = usePackage();

                useEffect(() => {
                  fetchAll().catch(() => { });
                }, [fetchAll]);

                if (loading) {
                  return (
                    <>
                      <div className="package-card placeholder">Đang tải...</div>
                      <div className="package-card placeholder">Đang tải...</div>
                      <div className="package-card placeholder">Đang tải...</div>
                    </>
                  );
                }

                if (error) {
                  return (
                    <div className="package-error">Không thể tải gói dịch vụ</div>
                  );
                }

                if (!packages || packages.length === 0) {
                  return (
                    <div className="package-empty">Chưa có gói dịch vụ nào</div>
                  );
                }

                return packages.map((p, idx) => {
                  const title = p.name || p.title || p.packageName || `Gói ${idx + 1}`;
                  const priceRaw = p.price ?? p.servicePrice ?? p.amount ?? p.cost ?? 0;
                  const price = typeof priceRaw === 'number' ? priceRaw.toLocaleString('vi-VN') + ' VNĐ' : String(priceRaw);

                  // Normalize features: accept array, or string with newlines, or description string
                  let features = [];
                  if (Array.isArray(p.features)) {
                    features = p.features;
                  } else if (typeof p.features === 'string' && p.features.trim() !== '') {
                    // Split by newlines (backend may return a single string with line breaks)
                    features = p.features.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
                  } else if (typeof p.description === 'string' && p.description.trim() !== '') {
                    features = p.description.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
                  } else {
                    features = [];
                  }

                  return (
                    <div key={p.packageId || p.id || idx} className={`package-card ${idx === 2 ? 'box' : ''}`}>
                      <div className="package-header">
                        <div className="package-badge">{p.packageId || `Gói ${idx + 1}`}</div>
                        <div className="package-subtitle">{title}</div>
                      </div>
                      <div className="package-price">{price}</div>
                      <button className="package-btn">Mua ngay</button>
                      <div className="package-features">
                        {features.length > 0 ? features.map((f, i) => (
                          <div key={i} className="feature"><GiCheckMark size={18} style={{ marginRight: 8, color: '#008E4A' }} /> {f}</div>
                        )) : (
                          <div className="feature"><GiCheckMark size={20} style={{ marginRight: 8, color: '#008E4A' }} /> Không có thông tin tính năng</div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom Section — centered CTA */}
            <div
              className="bottom-section"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                textAlign: "center",
              }}
            >
              <div className="main-title">
                SẠC NHANH - XANH - AN TOÀN CÙNG ECO-Z
              </div>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="register-btn">
                  <span>Đăng ký miễn phí</span>
                  <MdArrowForward size={24} />
                </button>
              </Link>
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
