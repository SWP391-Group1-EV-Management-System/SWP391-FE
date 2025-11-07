# --- GIAI ĐOẠN 1: "BUILDER" ---
# Sử dụng base image Node.js 20 (react-router@7 yêu cầu Node >= 20)
FROM node:20-alpine AS builder

# Cài đặt build dependencies cho Alpine Linux
RUN apk add --no-cache python3 make g++

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy file package.json và package-lock.json (nếu có)
# Copy riêng 2 file này trước để tận dụng cache của Docker
COPY package*.json ./

# Xóa package-lock.json để tránh conflict
RUN rm -f package-lock.json

# Cấu hình npm timeout và registry
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Cài patch-package global trước
RUN npm install -g patch-package

# Cài đặt các thư viện với retry
RUN npm install --legacy-peer-deps || npm install --legacy-peer-deps || npm install --legacy-peer-deps

# Cài riêng rollup native binding cho Alpine Linux
RUN npm install --no-save @rollup/rollup-linux-x64-musl

# Copy toàn bộ code còn lại của dự án
COPY . .

# Chạy lệnh build của React
RUN npm run build

# --- GIAI ĐOẠN 2: "SERVER" ---
# Sử dụng base image Nginx (web server) siêu nhẹ
FROM nginx:1.23-alpine

# Copy các file tĩnh đã được build ở Giai đoạn 1
# Vite build output là /dist (không phải /build)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config để hỗ trợ React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80 (port mặc định của Nginx)
EXPOSE 80

# Lệnh để chạy Nginx ở foreground (để Docker có thể quản lý nó)
CMD ["nginx", "-g", "daemon off;"]