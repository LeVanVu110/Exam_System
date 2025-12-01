import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// Components
import ProtectedRoute from "./component/ProtectedRoute";
import ForbiddenPage from "./pages/403";
import Layout from "./component/Layout";
import LayoutPDT from "./pages/PDT/LayoutPDT";
import ExamDashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule/Schedule";
import Documents from "./pages/Documents";
import ExamManagement from "./pages/PDT/ExamManagement";
import LoginForm from "./pages/Login";
import PermissionPage from "@/pages/Admin/permission"; // Lưu ý đường dẫn alias '@'
import Userprofile from "./pages/UserProfile.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute screenCode="DASHBOARD" />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ExamDashboard />} />
            <Route path="/UserProfile" element={<Userprofile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute screenCode="EXAM_SCHEDULE" />}>
          <Route element={<Layout />}>
            <Route path="/exam-schedule" element={<Schedule />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute screenCode="EXAM_MGT" />}>
          <Route element={<LayoutPDT />}>
            <Route path="/PDT/ExamManagement" element={<ExamManagement />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute screenCode="DOC_MGT" />}>
          <Route element={<Layout />}>
            <Route path="/documents" element={<Documents />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute screenCode="PERMISSION_MGT" />}>
           {/* Giả sử PermissionPage dùng Layout chính, nếu không thì bỏ Layout ra */}
           <Route element={<Layout />}>
              <Route path="/permission" element={<PermissionPage />} />
           </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;