const API_BASE_URL = 'http://localhost:3001';

// Lấy thông tin phiên sạc để thanh toán
export const fetchChargingSessionForPayment = async (sessionId) => {
  try {
    console.log('Fetching data for session:', sessionId);
    
    // Fetch data từ multiple endpoints
    const [sessionRes, stationRes, postRes, userRes] = await Promise.all([
      fetch(`${API_BASE_URL}/charging_session`), // Fetch all sessions, không phải single
      fetch(`${API_BASE_URL}/charging_station`),
      fetch(`${API_BASE_URL}/charging_post`),
      fetch(`${API_BASE_URL}/users`)
    ]);

    // Check nếu có lỗi network
    if (!sessionRes.ok || !stationRes.ok || !postRes.ok || !userRes.ok) {
      throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra JSON Server có đang chạy không.');
    }

    const [sessions, stations, posts, users] = await Promise.all([
      sessionRes.json(),
      stationRes.json(),
      postRes.json(),
      userRes.json()
    ]);

    console.log('All data fetched:', { sessions, stations, posts, users });

    // Tìm session theo ID từ array
    const session = sessions.find(s => s.charging_session_id === sessionId);
    if (!session) {
      throw new Error(`Không tìm thấy phiên sạc với ID: ${sessionId}`);
    }

    console.log('Found session:', session);

    const station = stations.find(s => s.id_charging_station === session.station_id);
    const post = posts.find(p => p.idChargingPost === session.charging_post_id);
    const user = users.find(u => u.user_id === session.user_id);

    console.log('Related data:', { station, post, user });

    // Transform data để phù hợp với PaymentPage
    const paymentData = {
      session_id: session.charging_session_id,
      station: station?.name_charging_station || 'Trạm không xác định',
      district: extractDistrict(station?.address),
      address: station?.address || '',
      chargingType: getChargingTypeName(post?.maxPower),
      date: formatSessionDate(session.start_time, session.end_time),
      time: formatSessionTime(session.start_time, session.end_time),
      vehicle: `Xe điện (${user?.first_name} ${user?.last_name})`,
      
      // Tính toán chi phí
      kwh: session.kwh || 0,
      chargingFeePerKwh: post?.charging_fee_per_kwh || 0,
      chargingCost: (session.kwh || 0) * (post?.charging_fee_per_kwh || 0),
      serviceFee: Math.round(((session.kwh || 0) * (post?.charging_fee_per_kwh || 0)) * 0.05), // 5% phí dịch vụ
      tax: Math.round(((session.kwh || 0) * (post?.charging_fee_per_kwh || 0)) * 0.1), // 10% thuế
      
      // Thông tin phiên sạc
      startTime: session.start_time,
      endTime: session.end_time,
      isDone: session.is_done,
      userId: session.user_id,
      postId: session.charging_post_id,
      stationId: session.station_id
    };

    // Tính tổng tiền
    paymentData.totalAmount = paymentData.chargingCost + paymentData.serviceFee + paymentData.tax;

    console.log('Payment data created:', paymentData);
    return paymentData;
    
  } catch (error) {
    console.error('Error in fetchChargingSessionForPayment:', error);
    
    // Kiểm tra nếu là lỗi network
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới server. Vui lòng chạy: npx json-server --watch db.json --port 3001');
    }
    
    throw new Error(error.message || 'Không thể tải thông tin phiên sạc để thanh toán');
  }
};

// Tạo payment record khi thanh toán
export const createPayment = async (sessionId, paymentMethod, amount) => {
  try {
    const paymentData = {
      payment_id: `PAY${Date.now()}`,
      user_id: sessionId.user_id, // Cần lấy từ session
      charging_session_id: sessionId,
      is_paid: false,
      created_at: new Date().toISOString(),
      paid_at: null,
      payment_method: paymentMethod,
      price: amount,
      session_id: sessionId
    };

    const response = await fetch(`${API_BASE_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error('Không thể tạo giao dịch thanh toán');
  }
};

// Cập nhật payment khi thanh toán thành công
export const updatePaymentStatus = async (paymentId, status = true) => {
  try {
    const updateData = {
      is_paid: status,
      paid_at: status ? new Date().toISOString() : null
    };

    const response = await fetch(`${API_BASE_URL}/payment/${paymentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Không thể cập nhật trạng thái thanh toán');
  }
};

// Lấy danh sách phiên sạc cần thanh toán
export const fetchUnpaidSessions = async (userId) => {
  try {
    const [sessionsRes, paymentsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/charging_session?user_id=${userId}&is_done=true`),
      fetch(`${API_BASE_URL}/payment?user_id=${userId}&is_paid=false`)
    ]);

    if (!sessionsRes.ok || !paymentsRes.ok) {
      throw new Error('Failed to fetch unpaid sessions');
    }

    const [sessions, payments] = await Promise.all([
      sessionsRes.json(),
      paymentsRes.json()
    ]);

    // Lọc các session đã hoàn thành nhưng chưa thanh toán
    const unpaidSessions = sessions.filter(session => {
      const hasPayment = payments.some(payment => 
        payment.charging_session_id === session.charging_session_id
      );
      return !hasPayment && session.is_done;
    });

    return unpaidSessions;
  } catch (error) {
    console.error('Error fetching unpaid sessions:', error);
    throw new Error('Không thể lấy danh sách phiên sạc chưa thanh toán');
  }
};

// Helper functions
const extractDistrict = (address) => {
  if (!address) return 'Chưa xác định';
  const parts = address.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : 'Chưa xác định';
};

const getChargingTypeName = (maxPower) => {
  if (!maxPower) return 'AC Type 2';
  if (maxPower <= 22) return `AC Charging (${maxPower}kW)`;
  if (maxPower <= 50) return `Fast Charging (${maxPower}kW DC)`;
  if (maxPower <= 100) return `Rapid Charging (${maxPower}kW DC)`;
  return `Ultra Fast Charging (${maxPower}kW DC)`;
};

const formatSessionDate = (startTime, endTime) => {
  if (!startTime) return 'Chưa xác định';
  const date = new Date(startTime);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatSessionTime = (startTime, endTime) => {
  if (!startTime) return 'Chưa xác định';
  
  const start = new Date(startTime);
  const startTimeStr = start.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  if (!endTime) {
    return `${startTimeStr} - Đang sạc`;
  }
  
  const end = new Date(endTime);
  const endTimeStr = end.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const duration = Math.round((end - start) / (1000 * 60)); // minutes
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  let durationStr = '';
  if (hours > 0) {
    durationStr = `${hours}h ${minutes}m`;
  } else {
    durationStr = `${minutes}m`;
  }
  
  return `${startTimeStr} - ${endTimeStr} (${durationStr})`;
};