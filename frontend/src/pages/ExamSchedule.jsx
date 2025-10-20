"use client"

import { useState, useEffect } from "react"
import { Search, Download, FileText, Trash2, ChevronDown } from "lucide-react"
import Button from "../component/ui/button"
import Input from "../component/ui/input"

export default function ExamSchedule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState("")
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const BASE_URL = import.meta.env.VITE_API_URL

  // 🧠 Fetch API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${BASE_URL}/api/exam-schedule`)
        if (!res.ok) throw new Error("Không thể tải dữ liệu lịch thi")
        const data = await res.json()
        setScheduleData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [BASE_URL])

  // 🕵️‍♂️ Filter theo ô tìm kiếm
  const filteredData = scheduleData.filter((item) =>
    item.exam_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course?.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 🌀 Loading overlay full màn hình
if (loading) {
  return (
    <div className="flex items-center justify-center py-6">
      <p className="text-gray-600 text-base animate-pulse">
        Đang tải dữ liệu...
      </p>
    </div>
  )
}


  // ❌ Khi lỗi
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Lỗi khi tải dữ liệu: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lịch Thi</h1>
            <p className="text-sm text-muted-foreground mt-1">Quản lý lịch thi học kỳ này</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Nguyễn Văn Admin</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Tìm môn học, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-background">
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm outline-none w-24"
              placeholder="mm/dd/yyyy"
            />
            <ChevronDown size={16} className="text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm">
            Chọn phòng thi
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download size={16} />
          Sao lưu dữ liệu
        </Button>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <FileText size={16} />
          Import File Excel
        </Button>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <FileText size={16} />
          Xuất File Excel
        </Button>
        <Button variant="destructive" size="sm" className="gap-2 ml-auto">
          <Trash2 size={16} />
          Xóa
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Không có dữ liệu</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Mã học phần</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Tên học phần</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Ngày thi - Giờ thi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Phòng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Thời gian thi (phút)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const examDuration = (() => {
                    const start = new Date(`1970-01-01T${item.exam_start_time}`)
                    const end = new Date(`1970-01-01T${item.exam_end_time}`)
                    return (end - start) / 60000
                  })()

                  return (
                    <tr key={item.exam_session_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.course?.course_code}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.course?.course_name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.exam_date} - {item.exam_start_time?.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.exam_room}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{examDuration}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
