
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./component/Layout"
import Dashboard from "./pages/Dashboard"
import ExamSchedule from "./pages/ExamSchedule"
import ClassSchedule from "./pages/ClassSchedule"
import Documents from "./pages/Documents"
import Exams from "./pages/Exams"
import QA from "./pages/QA"
import "./index.css"; // <--- quan trọng
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//Phòng đào tạo
import ExamManagement from "./pages/PDT/ExamManagement";
// đăng nhập
import  LoginForm  from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* phòng đào tạo */}
        <Route path="/" element={<ExamManagement />} />
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/exam-schedule" element={<ExamSchedule />} />
          <Route path="/class-schedule" element={<ClassSchedule />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/qa" element={<QA />} />
        </Route>
      </Routes>
      {/* đăng nhập */}
      <Routes>
        <Route path="/login" element={<LoginForm />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  )
}


export default App
