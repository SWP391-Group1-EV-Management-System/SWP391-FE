import React from 'react';
import '../../assets/styles/payment/CardSelection.css';

const CardSelection = ({ 
  savedCards, 
  selectedCard, 
  handleCardSelect, 
  handleAddCard 
}) => {
  return (
    <div className="card-selection">
      <h4 className="card-selection-title">Chọn thẻ</h4>
      <div className="card-list">
        {savedCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardSelect(card.id)}
            className={`card-item ${selectedCard === card.id ? 'selected' : ''}`}
          >
            <div className="card-info">
              <h5>{card.number}</h5>
              <p>{card.type} • Hết hạn {card.expiry}</p>
            </div>
            <span className="card-icon">💳</span>
          </button>
        ))}
        
        <button onClick={handleAddCard} className="add-card-btn">
          <span style={{fontSize: '1.25rem', marginRight: '0.5rem'}}>+</span>
          Thêm thẻ mới
        </button>
      </div>
    </div>
  );
};

export default CardSelection;