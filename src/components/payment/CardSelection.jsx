import React, { useState } from 'react';
import '../../assets/styles/payment/CardSelection.css';

const CardSelection = ({ 
  savedCards, 
  selectedCard, 
  handleCardSelect,
  userId 
}) => {
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Use the real savedCards data passed from PaymentPage
  const userCards = savedCards || [];

  if (userCards.length === 0) {
    return (
      <div className="card-selection">
        <h3 className="card-selection-title">Chọn thẻ ngân hàng</h3>
        <div className="no-cards-message">
          <p>Bạn chưa có thẻ ngân hàng nào được lưu</p>
          <button 
            className="add-card-btn primary"
            onClick={() => setShowAddCardModal(true)}
          >
            <span className="add-icon">+</span>
            <span>Thêm thẻ mới</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-selection">
      <h3 className="card-selection-title">Chọn thẻ ngân hàng</h3>
      <div className="card-list">
        {userCards.map(card => (
          <button
            key={card.id}
            className={`card-item ${selectedCard?.id === card.id ? 'selected' : ''} ${card.isDefault ? 'default-card' : ''}`}
            onClick={() => handleCardSelect && handleCardSelect(card)}
          >
            <div className="card-info">
              <h5>
                {card.number}
                {card.isDefault && <span className="default-badge">Mặc định</span>}
              </h5>
              <p>{card.bank} • {card.type} • {card.expiry}</p>
            </div>
            <div className="card-icon">
              {card.type === 'Visa' ? '💳' : 
               card.type === 'Mastercard' ? '🏧' : '💳'}
            </div>
          </button>
        ))}
        
        <button 
          className="add-card-btn"
          onClick={() => setShowAddCardModal(true)}
        >
          <span className="add-icon">+</span>
          <span>Thêm thẻ mới</span>
        </button>
      </div>

      {showAddCardModal && (
        <div className="modal-backdrop">
          <div className="add-card-modal">
            <h3>Thêm thẻ ngân hàng mới</h3>
            <p>Tính năng này sẽ được phát triển trong phiên bản tiếp theo</p>
            <button 
              className="btn-secondary"
              onClick={() => setShowAddCardModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSelection;