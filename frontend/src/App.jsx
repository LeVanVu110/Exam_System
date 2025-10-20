import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./component/Layout"
import Dashboard from "./pages/Dashboard"
import ExamSchedule from "./pages/ExamSchedule"
import ClassSchedule from "./pages/ClassSchedule"
import Documents from "./pages/Documents"
import Exams from "./pages/Exams"
import QA from "./pages/QA"
import "./index.css"; // <--- quan trọng

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exam-schedule" element={<ExamSchedule />} />
          <Route path="/class-schedule" element={<ClassSchedule />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/qa" element={<QA />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
