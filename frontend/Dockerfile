# Dùng Node 20 bản Debian slim thay vì Alpine để tránh lỗi rollup
FROM node:20-slim

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json (nếu có)
COPY package*.json ./
COPY package-lock.json ./

# Cập nhật npm và cài dependencies
RUN npm install 

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở port cho Vite dev server
EXPOSE 5173

# Chạy server Vite, cho phép truy cập từ ngoài Docker host
CMD ["npm", "run", "dev", "--", "--host"]
