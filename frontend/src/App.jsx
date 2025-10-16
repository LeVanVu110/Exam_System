import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//Phòng đào tạo
import ExamManagement from "./pages/PDT/ExamManagement";

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* phòng đào tạo */}
        <Route path="/PDT/ExamManagement" element={<ExamManagement />} />
      </Routes>
    </Router>
  );
}

export default App
