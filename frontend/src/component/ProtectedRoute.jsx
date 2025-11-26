import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component bảo vệ Route
 * @param {string} screenCode - Mã màn hình (Ví dụ: 'USER_MGT', 'DASHBOARD')
 */
const ProtectedRoute = ({ screenCode }) => {
  // 1. Lấy danh sách quyền từ localStorage (đã lưu lúc Login)
  const permissionsStr = localStorage.getItem('user_permissions');
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Nếu chưa đăng nhập (không có token hoặc không có quyền), đá về Login
  if (!token || !permissionsStr) {
    return <Navigate to="/login" replace />;
  }

  const permissions = JSON.parse(permissionsStr);

  // 2. Tìm quyền của màn hình hiện tại trong danh sách
  // Ví dụ: permissions['USER_MGT'] sẽ trả về { is_view: 1, is_add: 0, ... }
  const currentScreenPerm = permissions[screenCode];

  // 3. Kiểm tra Logic chặn:
  // - Phải tồn tại object quyền cho mã này
  // - VÀ thuộc tính is_view phải là 1 (hoặc true)
  const isAllowed = currentScreenPerm && (currentScreenPerm.is_view === 1 || currentScreenPerm.is_view === true);

  // (Optional) Log ra console để debug xem tại sao bị chặn
  console.log(`[Guard] Kiểm tra màn hình: ${screenCode}`);
  console.log(`[Guard] Quyền user có:`, currentScreenPerm);
  console.log(`[Guard] Kết quả: ${isAllowed ? 'CHO PHÉP' : 'CHẶN'}`);

  // 4. Điều hướng
  if (isAllowed) {
    // Nếu OK: Trả về Outlet (nơi chứa nội dung của Route con bên trong)
    return <Outlet />;
  } else {
    // Nếu Fail: Điều hướng sang trang 403 Forbidden
    return <Navigate to="/403" replace />;
  }
};

export default ProtectedRoute;