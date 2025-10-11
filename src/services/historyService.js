const API_BASE_URL = 'http://localhost:3001';

export const fetchChargingHistory = async () => {
  try {
    // Fetch multiple endpoints to get complete data
    const [sessionsRes, stationsRes, postsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/charging_session`),
      fetch(`${API_BASE_URL}/charging_station`),
      fetch(`${API_BASE_URL}/charging_post`),
      fetch(`${API_BASE_URL}/users`)
    ]);

    if (!sessionsRes.ok || !stationsRes.ok || !postsRes.ok || !usersRes.ok) {
      throw new Error('Failed to fetch data from API');
    }

    const [sessions, stations, posts, users] = await Promise.all([
      sessionsRes.json(),
      stationsRes.json(),
      postsRes.json(),
      usersRes.json()
    ]);

    // Transform and merge data
    const enrichedSessions = sessions.map(session => {
      const station = stations.find(s => s.id_charging_station === session.station_id);
      const post = posts.find(p => p.idChargingPost === session.charging_post_id);
      const user = users.find(u => u.user_id === session.user_id);

      return {
        ...session,
        // Station info
        station_name: station?.name_charging_station || 'Trạm không xác định',
        station_address: station?.address || '',
        
        // Post info
        post_name: `Cổng ${post?.idChargingPost || 'N/A'}`,
        max_power: post?.maxPower || 0,
        charging_fee: post?.charging_fee_per_kwh || 0,
        
        // User info
        user_name: user ? `${user.first_name} ${user.last_name}` : 'Người dùng không xác định',
        
        // Calculated fields
        duration: session.start_time && session.end_time 
          ? Math.round((new Date(session.end_time) - new Date(session.start_time)) / (1000 * 60))
          : 0,
        
        status: getSessionStatus(session),
        charging_type: getChargingType(post?.maxPower),
        
        // Additional fields for compatibility
        energy: session.kwh || 0,
        cost: session.total_amount || 0,
        startTime: session.start_time,
        endTime: session.end_time,
        station: station?.name_charging_station || 'Trạm không xác định',
        port: `Cổng ${post?.idChargingPost || 'N/A'}`,
        plugType: getChargingType(post?.maxPower),
        transactionId: session.charging_session_id,
        
        // Calculate additional display data
        batteryStart: Math.floor(Math.random() * 30) + 10, // 10-40% (mock)
        batteryEnd: Math.floor(Math.random() * 40) + 60,   // 60-100% (mock)
        avgPower: post?.maxPower ? Math.round(post.maxPower * 0.7) : 20,
        maxPower: post?.maxPower || 50,
        pricePerKwh: post?.charging_fee_per_kwh || 4000,
        tax: session.total_amount ? Math.round(session.total_amount * 0.1) : 0,
        discount: 0,
        
        // Generate mock events based on session data
        events: generateMockEvents(session)
      };
    });

    return enrichedSessions;
  } catch (error) {
    console.error('Error fetching charging history:', error);
    throw new Error('Không thể tải dữ liệu lịch sử sạc từ server');
  }
};

const getSessionStatus = (session) => {
  if (!session.is_done && session.start_time && !session.end_time) {
    return 'Đang sạc';
  }
  if (session.is_done && session.end_time) {
    return 'Hoàn tất';
  }
  if (session.start_time && session.end_time && !session.is_done) {
    return 'Thất bại';
  }
  return 'Hủy';
};

const getChargingType = (maxPower) => {
  if (!maxPower) return 'AC Type 2';
  if (maxPower <= 22) return 'AC Type 2';
  if (maxPower <= 50) return 'CCS Combo 2';
  if (maxPower <= 100) return 'CHAdeMO';
  return 'Tesla Supercharger';
};

const generateMockEvents = (session) => {
  const events = [];
  if (!session.start_time) return events;
  
  const startTime = new Date(session.start_time);
  
  events.push({
    time: startTime.toLocaleTimeString('vi-VN'),
    event: 'Cắm sạc'
  });
  
  events.push({
    time: new Date(startTime.getTime() + 60000).toLocaleTimeString('vi-VN'),
    event: 'Xác thực thành công'
  });
  
  events.push({
    time: new Date(startTime.getTime() + 90000).toLocaleTimeString('vi-VN'),
    event: 'Bắt đầu sạc'
  });
  
  if (session.end_time) {
    events.push({
      time: new Date(session.end_time).toLocaleTimeString('vi-VN'),
      event: session.is_done ? 'Hoàn tất sạc' : 'Dừng sạc'
    });
  }
  
  return events;
};