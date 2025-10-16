# ĐẶC TẢ API THANH TOÁN & GÓI DỊCH VỤ - FE <-> BE

## 1. Gói dịch vụ (Service Package)
### GET /api/service-package/all
- **Trả về:** Danh sách tất cả gói dịch vụ
  - id, name, description, price, duration, type
- **Logic BE:** Trả về danh sách gói cho FE hiển thị, lọc, chọn.

### POST /api/service-package/create
- **Nhận:** Thông tin gói mới
  - name, description, price, duration, type
- **Logic BE:** Tạo mới gói dịch vụ.

### PUT /api/service-package/update/{id}
- **Nhận:** id, thông tin cập nhật
  - name, description, price, duration, type
- **Logic BE:** Cập nhật gói dịch vụ.

### DELETE /api/service-package/delete/{id}
- **Nhận:** id
- **Logic BE:** Xóa gói dịch vụ.

---

## 2. Thanh toán phiên sạc (Payment)
### POST /api/payment/create
- **Nhận:** Thông tin thanh toán
  - userId, sessionId, paymentMethod, packageId (nếu dùng), discount, totalAmount
- **Logic BE:** Tạo payment, tính giảm giá nếu có gói, lưu trạng thái thanh toán.

### GET /api/payment/paymentByUser/{userId}
- **Trả về:** Danh sách payment của user
  - paymentId, sessionId, price, paidAt, paymentMethod, paid, packageId, discount
- **Logic BE:** Trả về lịch sử thanh toán của user.

### GET /api/payment/{paymentId}
- **Trả về:** Chi tiết payment (biên lai)
  - paymentId, sessionId, stationName, duration, energyConsumed, packageName, discount, totalAmount, paymentMethod, paymentDate
- **Logic BE:** Trả về chi tiết biên lai cho FE hiển thị.

---

## 3. Xác nhận thanh toán
### POST /api/payment/confirm/{paymentId}
- **Nhận:** paymentId
- **Logic BE:** Xác nhận trạng thái thanh toán (chuyển từ pending sang paid).

---

## 4. Lấy danh sách gói dịch vụ cho user
### GET /api/service-package/user/{userId}
- **Trả về:** Danh sách gói user đã đăng ký
  - packageId, name, type, expiredAt, discount
- **Logic BE:** Trả về các gói user đã mua để FE hiển thị lựa chọn khi thanh toán.

---

## 5. Logic controller BE cần có:
- **ServicePackageController**
  - getAllPackages()
  - createPackage(data)
  - updatePackage(id, data)
  - deletePackage(id)
  - getUserPackages(userId)
- **PaymentController**
  - createPayment(data)
  - getPaymentsByUser(userId)
  - getPaymentDetail(paymentId)
  - confirmPayment(paymentId)

---

## 6. Dữ liệu FE cần nhận/gửi:
- Khi thanh toán: userId, sessionId, paymentMethod, packageId, discount, totalAmount
- Khi hiển thị biên lai: paymentId, sessionId, stationName, duration, energyConsumed, packageName, discount, totalAmount, paymentMethod, paymentDate
- Khi quản lý gói: id, name, description, price, duration, type

---

## 7. Kết nối API FE <-> BE:
- FE gọi API lấy danh sách gói, tạo/xóa/sửa gói (admin)
- FE gọi API tạo payment, xác nhận thanh toán, lấy lịch sử payment
- FE gọi API lấy biên lai chi tiết để hiển thị cho user
- FE gọi API lấy danh sách gói user đã đăng ký để áp dụng giảm giá khi thanh toán

---

## 8. Lưu ý cho BE:
- Tính toán giảm giá khi user chọn gói dịch vụ
- Trả về dữ liệu đã format đúng cho UI, FE chỉ cần gọi API và xử lý giao diện
- Xử lý nghiệp vụ, kiểm tra hợp lệ, trạng thái thanh toán ở BE

---

# NOTE - API & CONTROLLER LOGIC CẦN THÊM

## 1. Xác nhận thanh toán tiền mặt
- Khi user chọn "Tiền mặt" và xác nhận, FE sẽ gọi API tạo payment với trạng thái "pending".
- Staff sẽ xác nhận qua API:
  - **POST /api/payment/confirm/{paymentId}**
    - Nhận: paymentId
    - Logic: Chuyển trạng thái payment từ "pending" sang "paid", trả về biên lai cho FE hiển thị.

## 2. Tích hợp Momo
- Chỗ comment "TODO: Gắn component của Momo tại đây" là nơi FE sẽ nhúng component Momo khi tích hợp.
- Khi user chọn Momo và thanh toán, FE sẽ gọi API Momo và nhận kết quả, sau đó gọi API tạo payment và hiển thị biên lai.

## 3. API cần cho logic này:
- **POST /api/payment/create**: Tạo payment (trạng thái "pending" nếu tiền mặt, "paid" nếu chuyển khoản/Momo thành công).
- **POST /api/payment/confirm/{paymentId}**: Staff xác nhận thanh toán tiền mặt.
- **GET /api/payment/{paymentId}**: Lấy chi tiết biên lai để hiển thị sau khi xác nhận.

## 4. Controller cần có:
- **PaymentController**
  - createPayment(data)
  - confirmPayment(paymentId)
  - getPaymentDetail(paymentId)

## 5. Lưu ý:
- FE chỉ hiển thị biên lai sau khi staff xác nhận thanh toán tiền mặt qua API.
- Chỗ QR chuyển khoản và Momo chỉ là placeholder, sẽ thay bằng component thực khi tích hợp.
