import React, { useState, useEffect } from 'react';
import '../../assets/styles/payment/ServicePackageSelection.css';

const ServicePackageSelection = ({ 
  selectedServicePackage, 
  setSelectedServicePackage,
  userId 
}) => {
  const [userServicePackage, setUserServicePackage] = useState(null);
  const [loadingPackage, setLoadingPackage] = useState(true);

  useEffect(() => {
    const fetchUserServicePackage = async () => {
      try {
        setLoadingPackage(true);
        
        // Mock data - khách hàng chỉ có 1 gói đã đăng ký
        const mockPackage = {
          id: 'PKG001',
          name: 'Gói Premium',
          description: 'Giảm 15% tổng hóa đơn + 50kWh miễn phí',
          freeKwh: 50,
          remainingKwh: 35,
          discountPercent: 15,
          isActive: true,
          expiryDate: '2024-12-31'
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserServicePackage(mockPackage);
      } catch (error) {
        console.error('Error fetching service package:', error);
        setUserServicePackage(null);
      } finally {
        setLoadingPackage(false);
      }
    };

    fetchUserServicePackage();
  }, [userId]);

  return (
    <div className="service-package-section">
      <h3 className="service-package-title">🎁 Gói dịch vụ</h3>
      
      {loadingPackage ? (
        <div className="loading-packages">
          <div className="loading-spinner-small"></div>
          <span>Đang tải gói dịch vụ...</span>
        </div>
      ) : userServicePackage ? (
        <div className="service-package-info">
          {/* No package option */}
          <div className={`package-option ${!selectedServicePackage ? 'selected' : ''}`}>
            <label className="package-label">
              <input
                type="radio"
                name="service-package"
                checked={!selectedServicePackage}
                onChange={() => setSelectedServicePackage(null)}
              />
              <div className="package-content">
                <div className="package-name">Không sử dụng gói</div>
                <div className="package-description">Thanh toán theo giá gốc</div>
              </div>
            </label>
          </div>

          {/* User's package option */}
          <div className={`package-option ${selectedServicePackage?.id === userServicePackage.id ? 'selected' : ''}`}>
            <label className="package-label">
              <input
                type="radio"
                name="service-package"
                checked={selectedServicePackage?.id === userServicePackage.id}
                onChange={() => setSelectedServicePackage(userServicePackage)}
              />
              <div className="package-content">
                <div className="package-name">{userServicePackage.name}</div>
                <div className="package-description">{userServicePackage.description}</div>
                
                <div className="package-detail">
                  <span className="package-label-text">Còn lại:</span>
                  <span className="package-value">{userServicePackage.remainingKwh}kWh miễn phí</span>
                </div>
                
                <div className="package-detail">
                  <span className="package-label-text">Giảm giá:</span>
                  <span className="package-value discount">{userServicePackage.discountPercent}%</span>
                </div>

                <div className="package-detail">
                  <span className="package-label-text">Hết hạn:</span>
                  <span className="package-value">{userServicePackage.expiryDate}</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      ) : (
        <div className="no-package-info">
          <span className="no-package-text">Bạn chưa đăng ký gói dịch vụ nào</span>
          <p className="no-package-note">Liên hệ để đăng ký gói dịch vụ ưu đãi</p>
        </div>
      )}
    </div>
  );
};

export default ServicePackageSelection;