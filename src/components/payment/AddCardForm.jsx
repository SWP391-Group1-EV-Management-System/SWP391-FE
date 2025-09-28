import React from 'react';
import '../../assets/styles/payment/AddCardForm.css';

const AddCardForm = ({ newCard, setNewCard, handleSaveCard }) => {
  return (
    <div className="add-card-form">
      <h4 className="add-card-title">Thêm thẻ mới</h4>
      <div className="form-group">
        <input
          type="text"
          placeholder="Số thẻ"
          value={newCard.cardNumber}
          onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
          className="form-input"
        />
        <div className="form-row">
          <input
            type="text"
            placeholder="MM/YY"
            value={newCard.expiryDate}
            onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
            className="form-input"
          />
          <input
            type="text"
            placeholder="CVV"
            value={newCard.cvv}
            onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
            className="form-input"
          />
        </div>
        <input
          type="text"
          placeholder="Tên chủ thẻ"
          value={newCard.cardHolder}
          onChange={(e) => setNewCard({...newCard, cardHolder: e.target.value})}
          className="form-input"
        />
        <button onClick={handleSaveCard} className="save-card-btn">
          Lưu thẻ
        </button>
      </div>
    </div>
  );
};

export default AddCardForm;