# Sử dụng Node.js 20 chính thức
FROM node:20-alpine

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy file cấu hình package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các gói npm
RUN npm install

# Copy toàn bộ mã nguồn dự án
COPY . .

# Mở cổng Vite dev server
EXPOSE 5173

# Chạy server Vite, cho phép truy cập từ bên ngoài (Docker host)
CMD ["npm", "run", "dev", "--", "--host"]
