# WebSocket Integration - Real-time Status Updates

## 🎯 Vấn đề đã giải quyết

Khi người dùng A hủy booking, BE tự động chuyển B từ waitingList → booking và C tiếp tục chờ với vị trí mới. Tuy nhiên, FE không tự động cập nhật và redirect người dùng.

## ✅ Giải pháp

### 1. Subscribe đúng WebSocket channels theo BE spec

BE gửi 2 loại message qua WebSocket:

#### Channel 1: `/user/queue/booking-status`

**Mục đích:** Thông báo khi user được chuyển từ waiting → booking

**Message format:**

```json
{
  "status": "CONFIRMED",
  "bookingId": "ABC12345",
  "message": "Your booking has been confirmed",
  "postId": "POST001"
}
```

**Khi nào gửi:** BE tự động gửi khi:

- User đầu tiên trong waiting list
- Booking hiện tại bị cancel
- → User được promote lên booking

#### Channel 2: `/user/queue/position-update`

**Mục đích:** Cập nhật vị trí mới trong hàng đợi

**Message format:**

```json
{
  "position": 2,
  "postId": "POST001",
  "message": "Your position has been updated to 2"
}
```

**Khi nào gửi:** BE tự động gửi khi:

- Có người cancel trong waiting list
- Vị trí của user thay đổi

---

## 📂 Files đã thay đổi

### 1. `src/services/WebSocketService.js`

**Thêm 2 methods mới:**

```javascript
// Subscribe to booking status changes
subscribeToBookingStatus(callback);

// Subscribe to position updates
subscribeToPositionUpdate(callback);
```

**Cách hoạt động:**

- `subscribeToBookingStatus`: Subscribe `/user/queue/booking-status`
- `subscribeToPositionUpdate`: Subscribe `/user/queue/position-update`
- Parse JSON response từ BE
- Gọi callback với data đã parse

### 2. `src/hooks/useWebSocket.js`

**State mới:**

```javascript
const [bookingConfirmed, setBookingConfirmed] = useState(null);
```

**Logic:**

1. Subscribe to `booking-status` channel
   - Khi nhận message với `status: "CONFIRMED"`
   - Set `bookingConfirmed` state với bookingId và postId
2. Subscribe to `position-update` channel

   - Khi nhận message với `position`
   - Update `position` state
   - Lưu vào localStorage

3. Giữ nguyên old notification channel (backward compatibility)

**Return value:**

```javascript
return {
  connected,
  messages,
  position,
  maxWaitingTime,
  bookingConfirmed, // ← NEW
  clearMessages,
};
```

### 3. `src/page/WaitingListPage.jsx`

**Thay đổi chính:**

#### a) Subscribe WebSocket

```javascript
const {
  connected,
  messages,
  position,
  maxWaitingTime: wsMaxWaitingTime,
  bookingConfirmed, // ← NEW
} = useWebSocket(user?.id, chargingPostId);
```

#### b) Handle booking confirmed

```javascript
useEffect(() => {
  if (bookingConfirmed) {
    // Update localStorage
    localStorage.setItem("bookingId", bookingConfirmed.bookingId);
    localStorage.setItem("bookingStatus", "booking");
    localStorage.removeItem("waitingListId");

    // Show notification
    notification.success({
      message: "Chuyển sang Booking!",
      description: bookingConfirmed.message,
    });

    // Redirect to booking page
    setTimeout(() => navigate("/app/booking"), 1500);
  }
}, [bookingConfirmed, navigate]);
```

#### c) Improved polling (fallback)

- Poll mỗi 3 giây (giảm từ 5s)
- Check waiting list bị xóa/cancelled → tìm booking mới
- Handle 404 error (waiting list deleted)
- Match booking theo `chargingPostId`

---

## 🔄 Flow hoàn chỉnh

### Khi Driver A hủy booking:

#### **Driver B** (đầu hàng đợi):

1. ✅ BE gửi message qua `/user/queue/booking-status`
   ```json
   { "status": "CONFIRMED", "bookingId": "BK123", ... }
   ```
2. ✅ FE nhận trong `useWebSocket` → set `bookingConfirmed`
3. ✅ `WaitingListPage` detect `bookingConfirmed` changed
4. ✅ Update localStorage: `bookingId`, `bookingStatus = "booking"`
5. ✅ Show notification: "Chuyển sang Booking!"
6. ✅ **Auto redirect to `/app/booking`** sau 1.5s
7. ✅ `BookingPage` fetch detail từ `bookingId` trong localStorage

#### **Driver C** (vị trí #2 → #1):

1. ✅ BE gửi message qua `/user/queue/position-update`
   ```json
   { "position": 1, "postId": "POST001", ... }
   ```
2. ✅ FE nhận trong `useWebSocket` → update `position = 1`
3. ✅ `WaitingListPage` hiển thị vị trí mới: **#1**
4. ✅ Show notification: "Vị trí mới: 1"
5. ✅ Vẫn ở `WaitingListPage`, chờ đến lượt

---

## 🧪 Testing

### Test WebSocket manually (Browser Console):

```javascript
// 1. Check localStorage
console.log("bookingStatus:", localStorage.getItem("bookingStatus"));
console.log("waitingListId:", localStorage.getItem("waitingListId"));
console.log("queuePostId:", localStorage.getItem("queuePostId"));

// 2. Check WebSocket connection
// Trong Console, filter log với keyword "useWebSocket" hoặc "WaitingListPage"
// Sẽ thấy:
// - 🔌 WebSocket connected: true
// - 📩 Booking status received
// - 📍 Position update received

// 3. Kiểm tra message format
// Khi có message từ BE, console sẽ log:
// - Full data: { status, bookingId, message, postId }
// - Position: { position, postId, message }
```

### Test flow:

1. **User A, B, C book cùng trụ** (A vào booking, B/C vào waiting)
2. **A hủy booking**
3. **Quan sát Console:**
   - B nhận `booking-status` message với `status: "CONFIRMED"`
   - C nhận `position-update` message với `position: 1`
4. **Verify kết quả:**
   - B tự động redirect sang `/app/booking`
   - C hiển thị vị trí #1 trong waiting list

---

## 🔍 Debug Tips

### Nếu không nhận được WebSocket message:

1. **Check kết nối:**

   ```javascript
   // Console sẽ show:
   // ✅ [useWebSocket] WebSocket is connected, subscribing...
   // ✅ Successfully subscribed to: /user/queue/booking-status
   // ✅ Successfully subscribed to: /user/queue/position-update
   ```

2. **Check userId:**

   ```javascript
   // Đảm bảo userId được gửi trong STOMP header
   // Console:
   // 🔌 [WebSocketService] Connecting with userId: DRV001
   ```

3. **Check BE logs:**
   - BE có gửi message không?
   - Format message có đúng JSON không?
   - Channel destination có đúng không?

### Nếu polling không hoạt động:

1. **Check localStorage:**

   ```javascript
   localStorage.getItem("bookingStatus"); // Phải là "waiting"
   ```

2. **Check polling logs:**

   ```javascript
   // Console sẽ show mỗi 3 giây:
   // 🔍 [WaitingListPage] Polling: Checking status change...
   // 📊 [WaitingListPage] Poll result: { ... }
   ```

3. **Check API response:**
   ```javascript
   // Nếu có booking mới:
   // ✅ [WaitingListPage] Found active booking: { bookingId, status, ... }
   ```

---

## 📊 Technical Details

### Dependencies:

- `sockjs-client`: SockJS WebSocket client
- `@stomp/stompjs`: STOMP protocol over WebSocket

### Polling frequency:

- **3 seconds** (fallback nếu WebSocket miss message)

### localStorage keys:

- `bookingId`: ID của booking hiện tại
- `bookingStatus`: `"waiting"` hoặc `"booking"`
- `waitingListId`: ID của waiting list entry
- `initialQueueRank`: Vị trí ban đầu trong queue
- `queuePostId`: ID của charging post
- `maxWaitingTime`: Thời gian chờ tối đa

---

## 🎉 Kết luận

Sau khi implement:

- ✅ **WebSocket real-time:** User nhận thông báo ngay lập tức
- ✅ **Auto redirect:** User B tự động chuyển sang booking page
- ✅ **Position update:** User C thấy vị trí mới real-time
- ✅ **Fallback polling:** Đảm bảo không miss update (3s interval)
- ✅ **Robust error handling:** Handle 404, network errors, etc.

**Không cần reload trang, mọi thứ đều tự động!** 🚀
