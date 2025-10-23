import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import '../src/index.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//Phòng đào tạo
import ExamManagement from "./pages/PDT/ExamManagement";

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* phòng đào tạo */}
        <Route path="/" element={<ExamManagement />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
    
  );
}

export default App
