import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import '../src/index.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//Phòng đào tạo
import ExamManagement from "./pages/PDT/ExamManagement";
// đăng nhập
import  LoginForm  from "./pages/Login";

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* phòng đào tạo */}
        <Route path="/PDT" element={<ExamManagement />} />
      </Routes>
      {/* đăng nhập */}
      <Routes>
        <Route path="/login" element={<LoginForm />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
    
  );
}

export default App
