"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Upload, Download, RotateCcw } from "lucide-react"

export default function ExamSchedule() {
  const [data, setData] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState("")
  const [room, setRoom] = useState("")
  const [search, setSearch] = useState("")

  // Lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:8000/api/exam-sessions", {
        params: { search, date, room },
      })
      setData(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Import file Excel
  const handleImport = async (e) => {
    e.preventDefault()
    if (!file) return alert("Vui lòng chọn file trước khi import!")

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)
      await axios.post("http://localhost:8000/api/exam-sessions/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      fetchData()
      alert("Import thành công!")
      setFile(null)
    } catch (error) {
      console.error("Lỗi import:", error)
      alert("Import thất bại!")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    window.location.href = "http://localhost:8000/api/exam-sessions/export"
  }

  const handleReset = () => {
    setSearch("")
    setDate("")
    setRoom("")
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Thi</h1>
        <p className="text-gray-500 text-sm">Quản lý lớp học và hoạt động giảng dạy</p>

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-4 flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Tên môn học, lớp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Chọn phòng thi</option>
            <option value="A101">A101</option>
            <option value="B205">B205</option>
            <option value="C301">C301</option>
            <option value="A102">A102</option>
          </select>

          {/* Buttons */}
          <div className="flex gap-2 mt-3 md:mt-0">
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Upload size={16} />
              Import File Excel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Download size={16} />
              Xuất File Excel
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">
              Danh sách lịch thi{" "}
              <span className="text-sm text-gray-500">(Hiển thị {data.length} buổi thi)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">STT</th>
                  <th className="px-6 py-3">LỚP HỌC PHẦN</th>
                  <th className="px-6 py-3">TÊN HỌC PHẦN</th>
                  <th className="px-6 py-3">TÍN CHỈ</th>
                  <th className="px-6 py-3">NGÀY THI - GIỜ THI</th>
                  <th className="px-6 py-3">PHÒNG THI</th>
                  <th className="px-6 py-3">SV DỰ THI</th>
                  <th className="px-6 py-3">THỜI GIAN (PHÚT)</th>
                  <th className="px-6 py-3">CBCT 1</th>
                  <th className="px-6 py-3">CBCT 2</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item.exam_session_id || index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">{index + 1}</td>
                      <td className="px-6 py-3">{item.class_code}</td>
                      <td className="px-6 py-3">{item.subject_name}</td>
                      <td className="px-6 py-3">{item.credits}</td>
                      <td className="px-6 py-3">{item.exam_date} - {item.exam_time}</td>
                      <td className="px-6 py-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item.exam_room}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">{item.student_count}</td>
                      <td className="px-6 py-3 text-center">{item.exam_duration}</td>
                      <td className="px-6 py-3">{item.teacher1_name}</td>
                      <td className="px-6 py-3">{item.teacher2_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
