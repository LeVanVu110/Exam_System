
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./component/Layout"
import ExamSchedule from "./pages/ExamSchedule"
import ClassSchedule from "./pages/ClassSchedule"
import Documents from "./pages/Documents"
import Exams from "./pages/Exams"
import QA from "./pages/QA"
import "./index.css"; // <--- quan trọng
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExamDashboard from './pages/Dashboard.jsx';
//Phòng đào tạo
import ExamManagement from "./pages/PDT/ExamManagement";
// đăng nhập
import  LoginForm  from "./pages/Login";
import  Schedule  from "./pages/Schedule/Schedule";
// phân quyền
import PermissionPage from "@/pages/Admin/permission-manager";

function App() {
  return (
    <Router>
      <Routes>
        {/* phòng đào tạo */}
        <Route path="PDT/ExamManagement" element={<ExamManagement />} />
      {/* Cán bộ coi thi */}
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<ExamDashboard />} />
          <Route path="/exam-schedule" element={<Schedule />} />
          <Route path="/class-schedule" element={<ClassSchedule />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/qa" element={<QA />} />
{/* đăng nhập */}
          <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        </Route>
        {/* Quản lý quyền */}
        <Route path="/permission" element={<PermissionPage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  )
}


export default App
