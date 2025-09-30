const API_BASE_URL = 'http://localhost:3001';

// Lấy danh sách thẻ ngân hàng của user
export const fetchUserBankCards = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bank_cards?user_id=${userId}&is_active=true`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch bank cards');
    }

    const cards = await response.json();
    
    // Format lại data cho component
    return cards.map(card => ({
      id: card.card_id,
      number: card.card_number,
      holderName: card.card_holder_name,
      bank: card.bank_name,
      type: card.card_type,
      expiry: `${card.expiry_month.toString().padStart(2, '0')}/${card.expiry_year.toString().slice(-2)}`,
      isDefault: card.is_default,
      isActive: card.is_active,
      fullExpiry: {
        month: card.expiry_month,
        year: card.expiry_year
      }
    }));
  } catch (error) {
    console.error('Error fetching user bank cards:', error);
    throw new Error('Không thể tải danh sách thẻ ngân hàng');
  }
};

// Thêm thẻ ngân hàng mới
export const addBankCard = async (userId, cardData) => {
  try {
    const newCard = {
      card_id: `CARD${Date.now()}`,
      user_id: userId,
      card_number: cardData.cardNumber,
      card_holder_name: cardData.holderName.toUpperCase(),
      bank_name: cardData.bankName,
      card_type: cardData.cardType,
      expiry_month: parseInt(cardData.expiryMonth),
      expiry_year: parseInt(cardData.expiryYear),
      is_default: cardData.isDefault || false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/bank_cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCard)
    });

    if (!response.ok) {
      throw new Error('Failed to add bank card');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding bank card:', error);
    throw new Error('Không thể thêm thẻ ngân hàng');
  }
};

// Cập nhật thẻ ngân hàng
export const updateBankCard = async (cardId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bank_cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updateData,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update bank card');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating bank card:', error);
    throw new Error('Không thể cập nhật thẻ ngân hàng');
  }
};

// Xóa thẻ ngân hàng (soft delete)
export const deleteBankCard = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bank_cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: false,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to delete bank card');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting bank card:', error);
    throw new Error('Không thể xóa thẻ ngân hàng');
  }
};

// Set thẻ mặc định
export const setDefaultCard = async (userId, cardId) => {
  try {
    // Unset all default cards first
    const allCardsResponse = await fetch(`${API_BASE_URL}/bank_cards?user_id=${userId}`);
    const allCards = await allCardsResponse.json();
    
    // Update all cards to not default
    await Promise.all(
      allCards.map(card => 
        fetch(`${API_BASE_URL}/bank_cards/${card.card_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            is_default: false,
            updated_at: new Date().toISOString()
          })
        })
      )
    );

    // Set new default card
    const response = await fetch(`${API_BASE_URL}/bank_cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_default: true,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to set default card');
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting default card:', error);
    throw new Error('Không thể đặt thẻ mặc định');
  }
};

// Validate thẻ ngân hàng
export const validateCardData = (cardData) => {
  const errors = {};

  // Validate card number (basic)
  if (!cardData.cardNumber || cardData.cardNumber.length < 16) {
    errors.cardNumber = 'Số thẻ phải có ít nhất 16 số';
  }

  // Validate holder name
  if (!cardData.holderName || cardData.holderName.trim().length < 2) {
    errors.holderName = 'Tên chủ thẻ không hợp lệ';
  }

  // Validate expiry
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (!cardData.expiryMonth || !cardData.expiryYear) {
    errors.expiry = 'Ngày hết hạn không hợp lệ';
  } else {
    const expiryYear = parseInt(cardData.expiryYear);
    const expiryMonth = parseInt(cardData.expiryMonth);
    
    if (expiryYear < currentYear || 
        (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errors.expiry = 'Thẻ đã hết hạn';
    }
  }

  // Validate bank name
  if (!cardData.bankName || cardData.bankName.trim().length < 2) {
    errors.bankName = 'Tên ngân hàng không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Mask card number for display
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
};

// Get card type from number
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('4')) return 'Visa';
  if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
  if (cleaned.startsWith('3')) return 'American Express';
  
  return 'Unknown';
};