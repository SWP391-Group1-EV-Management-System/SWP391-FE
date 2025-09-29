import React, { useState, useEffect } from 'react';

const PaymentMethods = ({ 
  selectedMethod, 
  selectedCard, 
  handleMethodSelect, 
  handleCardSelect, 
  handlePayClick,
  savedCards, 
  sessionData 
}) => {
  const [selectedServicePackage, setSelectedServicePackage] = useState(null);
  const [userServicePackages, setUserServicePackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch user's service packages
  useEffect(() => {
    const fetchUserServicePackages = async () => {
      try {
        setLoadingPackages(true);
        // Giả sử lấy từ API - có thể thay bằng call thực tế
        const mockPackages = [
          {
            id: 'PKG001',
            name: 'Gói Cơ bản',
            description: 'Miễn phí 50kWh/tháng',
            freeKwh: 50,
            remainingKwh: 35,
            discountPercent: 0,
            isActive: true
          },
          {
            id: 'PKG002', 
            name: 'Gói Premium',
            description: 'Giảm 15% tổng hóa đơn + 100kWh miễn phí',
            freeKwh: 100,
            remainingKwh: 75,
            discountPercent: 15,
            isActive: true
          },
          {
            id: 'PKG003',
            name: 'Gói VIP',
            description: 'Giảm 25% tổng hóa đơn + 200kWh miễn phí',
            freeKwh: 200,
            remainingKwh: 150,
            discountPercent: 25,
            isActive: false // Đã hết hạn
          }
        ];

        setUserServicePackages(mockPackages.filter(pkg => pkg.isActive));
      } catch (error) {
        console.error('Error fetching service packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };

    if (sessionData?.userId) {
      fetchUserServicePackages();
    }
  }, [sessionData?.userId]);

  // Tính toán giá sau khi áp dụng gói dịch vụ
  const calculateDiscountedPrice = () => {
    if (!sessionData || !selectedServicePackage) return sessionData?.totalAmount || 0;

    let discountedAmount = sessionData.totalAmount;

    // Áp dụng kWh miễn phí
    if (selectedServicePackage.remainingKwh > 0 && sessionData.kwh > 0) {
      const freeKwh = Math.min(selectedServicePackage.remainingKwh, sessionData.kwh);
      const freeAmount = freeKwh * sessionData.chargingFeePerKwh;
      discountedAmount = Math.max(0, discountedAmount - freeAmount);
    }

    // Áp dụng % giảm giá
    if (selectedServicePackage.discountPercent > 0) {
      discountedAmount = discountedAmount * (100 - selectedServicePackage.discountPercent) / 100;
    }

    return Math.round(discountedAmount);
  };

  console.log('PaymentMethods props:', {
    selectedMethod,
    selectedCard,
    handleMethodSelect,
    handleCardSelect,
    handlePayClick,
    savedCards,
    sessionData,
    selectedServicePackage,
    userServicePackages
  });

  // Kiểm tra nếu functions không tồn tại
  if (!handleMethodSelect || !handlePayClick) {
    console.error('Missing handler functions in PaymentMethods');
    return (
      <div className="alert alert-danger">
        <h5>Lỗi Payment Methods</h5>
        <p>Các function handler không được truyền đúng cách</p>
      </div>
    );
  }

  return (
    <div className="payment-card" style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h4 className="card-title">Phương thức thanh toán</h4>
      
      {/* Service Package Selection */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h5 style={{ marginBottom: '10px', color: '#28a745' }}>🎁 Chọn gói dịch vụ</h5>
        
        {loadingPackages ? (
          <div>Đang tải gói dịch vụ...</div>
        ) : userServicePackages.length > 0 ? (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '5px' }}>
                <input
                  type="radio"
                  name="service-package"
                  value=""
                  checked={!selectedServicePackage}
                  onChange={() => setSelectedServicePackage(null)}
                  style={{ marginRight: '8px' }}
                />
                <span>Không sử dụng gói dịch vụ</span>
              </label>
            </div>

            {userServicePackages.map(pkg => (
              <div key={pkg.id} style={{ marginBottom: '10px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  cursor: 'pointer',
                  padding: '10px',
                  border: selectedServicePackage?.id === pkg.id ? '2px solid #28a745' : '1px solid #ddd',
                  borderRadius: '4px',
                  background: selectedServicePackage?.id === pkg.id ? '#e8f5e8' : 'white'
                }}>
                  <input
                    type="radio"
                    name="service-package"
                    value={pkg.id}
                    checked={selectedServicePackage?.id === pkg.id}
                    onChange={() => setSelectedServicePackage(pkg)}
                    style={{ marginRight: '8px', marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#28a745' }}>{pkg.name}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{pkg.description}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Còn lại: {pkg.remainingKwh}kWh miễn phí
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Bạn chưa đăng ký gói dịch vụ nào
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div style={{ marginBottom: '15px' }}>
        <h5 style={{ marginBottom: '10px' }}>Phương thức thanh toán</h5>
        
        {/* Credit Card Option */}
        <div className="payment-method-option" style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="payment-method"
              value="credit-card"
              checked={selectedMethod === 'credit-card'}
              onChange={(e) => {
                console.log('Credit card selected');
                handleMethodSelect(e.target.value);
              }}
              style={{ marginRight: '8px' }}
            />
            <span>💳 Thanh toán bằng thẻ</span>
          </label>
        </div>

        {/* Cash Option */}
        <div className="payment-method-option" style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="payment-method"
              value="cash"
              checked={selectedMethod === 'cash'}
              onChange={(e) => {
                console.log('Cash selected');
                handleMethodSelect(e.target.value);
              }}
              style={{ marginRight: '8px' }}
            />
            <span>💵 Tiền mặt</span>
          </label>
        </div>
      </div>

      {/* Saved Cards (if credit card selected) */}
      {selectedMethod === 'credit-card' && savedCards && savedCards.length > 0 && (
        <div className="saved-cards" style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          background: '#f8f9fa', 
          borderRadius: '4px' 
        }}>
          <h6>Thẻ đã lưu</h6>
          {savedCards.map(card => (
            <div key={card.id} className="saved-card-option" style={{ marginBottom: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="saved-card"
                  value={card.id}
                  checked={selectedCard?.id === card.id}
                  onChange={() => {
                    console.log('Card selected:', card);
                    handleCardSelect && handleCardSelect(card);
                  }}
                  style={{ marginRight: '8px' }}
                />
                <span>{card.number} - {card.type}</span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Payment Summary */}
      {sessionData && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '15px', 
          background: '#e7f3ff', 
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <h6 style={{ marginBottom: '10px' }}>Chi tiết thanh toán</h6>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Phí sạc ({sessionData.kwh} kWh):</span>
            <span>{sessionData.chargingCost?.toLocaleString('vi-VN')} VND</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Phí dịch vụ:</span>
            <span>{sessionData.serviceFee?.toLocaleString('vi-VN')} VND</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Thuế:</span>
            <span>{sessionData.tax?.toLocaleString('vi-VN')} VND</span>
          </div>
          
          {selectedServicePackage && (
            <>
              <hr style={{ margin: '10px 0' }} />
              <div style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '5px' }}>
                Áp dụng gói: {selectedServicePackage.name}
              </div>
              {selectedServicePackage.remainingKwh > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#28a745', marginBottom: '5px' }}>
                  <span>- Miễn phí kWh:</span>
                  <span>-{Math.min(selectedServicePackage.remainingKwh, sessionData.kwh * sessionData.chargingFeePerKwh).toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              {selectedServicePackage.discountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#28a745', marginBottom: '5px' }}>
                  <span>- Giảm giá {selectedServicePackage.discountPercent}%:</span>
                  <span>-{((sessionData.totalAmount * selectedServicePackage.discountPercent) / 100).toLocaleString('vi-VN')} VND</span>
                </div>
              )}
            </>
          )}
          
          <hr style={{ margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
            <span>Tổng thanh toán:</span>
            <span style={{ color: selectedServicePackage ? '#28a745' : '#333' }}>
              {calculateDiscountedPrice().toLocaleString('vi-VN')} VND
              {selectedServicePackage && (
                <span style={{ fontSize: '12px', color: '#666', textDecoration: 'line-through', marginLeft: '10px' }}>
                  {sessionData.totalAmount?.toLocaleString('vi-VN')} VND
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Pay Button */}
      <button
        className="btn btn-primary w-100"
        onClick={() => {
          console.log('Pay button clicked', { selectedMethod, selectedServicePackage });
          handlePayClick(selectedServicePackage);
        }}
        disabled={!selectedMethod}
        style={{ 
          background: selectedMethod ? '#28a745' : '#6c757d',
          border: 'none',
          padding: '12px',
          borderRadius: '4px',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {selectedMethod ? `Thanh toán ${calculateDiscountedPrice().toLocaleString('vi-VN')} VND` : 'Chọn phương thức thanh toán'}
      </button>
    </div>
  );
};

export default PaymentMethods;