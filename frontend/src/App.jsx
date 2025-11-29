import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// Components
// Lưu ý: Đảm bảo đường dẫn import đúng với cấu trúc thư mục thực tế của bạn
import ProtectedRoute from "./component/ProtectedRoute"; // Hoặc ./components/ProtectedRoute
import ForbiddenPage from "./pages/403";
import Layout from "./component/Layout"; // Hoặc ./components/Layout
import LayoutPDT from "./pages/PDT/LayoutPDT";
import ExamDashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule/Schedule";
import Documents from "./pages/Documents";
import ExamManagement from "./pages/PDT/ExamManagement";
import LoginForm from "./pages/Login"; // Đã sửa lại đường dẫn import này
import PermissionPage from "./pages/Admin/permission"; // Kiểm tra lại đường dẫn này
import Userprofile from "./pages/UserProfile.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {/* Redirect root "/" về login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Protected Routes */}
        
        {/* 1. Dashboard */}
        <Route element={<ProtectedRoute screenCode="DASHBOARD" />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ExamDashboard />} />
            <Route path="/UserProfile" element={<Userprofile />} />
          </Route>
        </Route>

        {/* 2. Lịch thi */}
        <Route element={<ProtectedRoute screenCode="EXAM_SCHEDULE" />}>
          <Route element={<Layout />}>
            <Route path="/exam-schedule" element={<Schedule />} />
          </Route>
        </Route>

        {/* 3. Quản lý kỳ thi (PDT) */}
        <Route element={<ProtectedRoute screenCode="EXAM_MGT" />}>
          <Route element={<LayoutPDT />}>
            {/* Đây chính là route bạn đang cần */}
            <Route path="/PDT/ExamManagement" element={<ExamManagement />} />
          </Route>
        </Route>

        {/* 4. Tài liệu (Giáo viên) */}
        <Route element={<ProtectedRoute screenCode="DOC_MGT" />}>
          <Route element={<Layout />}>
            <Route path="/documents" element={<Documents />} />
          </Route>
        </Route>

        {/* 5. Phân quyền (Admin) */}
        <Route element={<ProtectedRoute screenCode="PERMISSION_MGT" />}>
           <Route element={<Layout />}>
             <Route path="/permission" element={<PermissionPage />} />
           </Route>
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<div className="text-center mt-10">404 - Trang không tồn tại</div>} />

      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;