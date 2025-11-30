import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component bảo vệ Route
 * @param {string} screenCode - Mã màn hình (Ví dụ: 'USER_MGT', 'DASHBOARD')
 */
const ProtectedRoute = ({ screenCode }) => {
  // 1. Lấy Token & Quyền từ localStorage
  // [QUAN TRỌNG] Key phải khớp 100% với bên LoginForm ("ACCESS_TOKEN")
  const token = localStorage.getItem('ACCESS_TOKEN'); 
  const permissionsStr = localStorage.getItem('user_permissions');

  // Log debug để xem tại sao bị chặn
  console.log(`[Guard Check] Screen: ${screenCode}`);
  
  // 2. Kiểm tra đăng nhập cơ bản
  // Nếu không có token HOẶC không có chuỗi quyền -> Đá về Login
  if (!token || !permissionsStr) {
    console.warn("[Guard] Thiếu Token hoặc Permissions -> Redirect Login");
    return <Navigate to="/login" replace />;
  }

  // 3. Parse quyền ra Object
  let permissions = {};
  try {
    permissions = JSON.parse(permissionsStr);
  } catch (e) {
    console.error("[Guard] Lỗi parse JSON permissions", e);
    return <Navigate to="/login" replace />;
  }

  // 4. Tìm quyền của màn hình hiện tại
  // Ví dụ: permissions['DASHBOARD'] -> { is_view: 1, ... }
  const currentScreenPerm = permissions[screenCode];

  // 5. Kiểm tra Logic chặn:
  // - Phải tồn tại object quyền cho mã này
  // - VÀ thuộc tính is_view phải là 1 (hoặc true)
  const isAllowed = currentScreenPerm && (currentScreenPerm.is_view === 1 || currentScreenPerm.is_view === true);

  console.log(`[Guard] Quyền user tại ${screenCode}:`, currentScreenPerm);
  console.log(`[Guard] Kết quả: ${isAllowed ? '✅ CHO PHÉP' : '⛔ CHẶN (403)'}`);

  // 6. Điều hướng
  if (isAllowed) {
    // Nếu OK: Trả về Outlet (nội dung trang con)
    return <Outlet />;
  } else {
    // Nếu Fail: Điều hướng sang trang 403 Forbidden
    return <Navigate to="/403" replace />;
  }
};

export default ProtectedRoute;