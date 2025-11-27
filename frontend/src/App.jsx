import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./component/ProtectedRoute";
import ForbiddenPage from "./pages/403";

// Layouts
import Layout from "./component/Layout";
import LayoutPDT from "./pages/PDT/LayoutPDT";

// Pages
import ExamDashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule/Schedule";
import Documents from "./pages/Documents";
import ExamManagement from "./pages/PDT/ExamManagement";
import LoginForm from "./pages/Login";
import PermissionPage from "@/pages/Admin/permission";

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./component/Layout"
import ExamSchedule from "./pages/ExamSchedule"
import ClassSchedule from "./pages/ClassSchedule"
import Documents from "./pages/Documents"
import Userprofile from "./pages/UserProfile.jsx"
import "./index.css"; // <--- quan trọng
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public routes */}
        
          <Route path="/UserProfile" element={<Userprofile />} />
          
        </Route>
      </Routes>
      {/* đăng nhập */}
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* ---------- PROTECTED ROUTES ---------- */}

        {/* Dashboard → DASHBOARD */}
        <Route element={<ProtectedRoute screenCode="DASHBOARD" />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ExamDashboard />} />
          </Route>
        </Route>

        {/* Exam Schedule → EXAM_SCHEDULE */}
        <Route element={<ProtectedRoute screenCode="EXAM_SCHEDULE" />}>
          <Route element={<Layout />}>
            <Route path="/exam-schedule" element={<Schedule />} />
          </Route>
        </Route>

        {/* Exam Management (Training Dept) → EXAM_MGT */}
        <Route element={<ProtectedRoute screenCode="EXAM_MGT" />}>
          <Route element={<LayoutPDT />}>
            <Route path="/PDT/ExamManagement" element={<ExamManagement />} />
          </Route>
        </Route>

        {/* Documents → DOC_MGT */}
        <Route element={<ProtectedRoute screenCode="DOC_MGT" />}>
          <Route element={<Layout />}>
            <Route path="/documents" element={<Documents />} />
          </Route>
        </Route>

        {/* Permission Management → PERMISSION_MGT */}
        <Route element={<ProtectedRoute screenCode="PERMISSION_MGT" />}>
          <Route path="/permission" element={<PermissionPage />} />
        </Route>

        {/* Default route */}
        <Route path="/" element={<LoginForm />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
