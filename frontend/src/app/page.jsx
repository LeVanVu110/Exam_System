"use client"

import { useState, useMemo } from "react"
import { Download, FileSpreadsheet, RotateCcw, Upload } from "lucide-react"
import { Button } from "../component/ui/Button"
import { Input } from "../component/ui/Input"
import { Sidebar } from "../component/sidebar"
import { useToast } from "../hooks/use-toast"
import { Toaster } from "../component/ui/Toaster"

const mockData = [
  {
    stt: 1,
    lopHocPhan: "CS101-01",
    tenHocPhan: "Nhập môn Lập trình",
    tinChi: 3,
    ngayThi: "15/01/2025 - 08:00",
    phongThi: "A101",
    svDuThi: 45,
    thoiGian: 90,
    cbct1: "TS. Nguyễn Văn A",
    cbct2: "ThS. Trần Thị B",
  },
  {
    stt: 2,
    lopHocPhan: "CS102-02",
    tenHocPhan: "Cấu trúc dữ liệu",
    tinChi: 4,
    ngayThi: "16/01/2025 - 14:00",
    phongThi: "B205",
    svDuThi: 38,
    thoiGian: 120,
    cbct1: "TS. PGS. Lê Văn C",
    cbct2: "TS. Phạm Thị D",
  },
  {
    stt: 3,
    lopHocPhan: "CS201-01",
    tenHocPhan: "Cơ sở dữ liệu",
    tinChi: 3,
    ngayThi: "18/01/2025 - 10:00",
    phongThi: "C301",
    svDuThi: 42,
    thoiGian: 90,
    cbct1: "TS. Hoàng Văn E",
    cbct2: "ThS. Vũ Thị F",
  },
  {
    stt: 4,
    lopHocPhan: "CS202-03",
    tenHocPhan: "Mạng máy tính",
    tinChi: 3,
    ngayThi: "20/01/2025 - 08:00",
    phongThi: "A102",
    svDuThi: 50,
    thoiGian: 90,
    cbct1: "TS. Đỗ Văn G",
    cbct2: "ThS. Bùi Thị H",
  },
]

export default function ExamSchedulePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("Chọn phòng thi")
  const { toast } = useToast()

  const filteredData = useMemo(() => {
    return mockData.filter((exam) => {
      const matchesSearch =
        searchTerm === "" ||
        exam.tenHocPhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.lopHocPhan.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDate = selectedDate === "" || exam.ngayThi.startsWith(selectedDate.split("-").reverse().join("/"))

      const matchesRoom = selectedRoom === "Chọn phòng thi" || exam.phongThi === selectedRoom

      return matchesSearch && matchesDate && matchesRoom
    })
  }, [searchTerm, selectedDate, selectedRoom])

  const handleBackup = () => {
    const backupData = JSON.stringify(mockData, null, 2)
    const blob = new Blob([backupData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    toast({
      title: "Sao lưu thành công!",
      description: (
        <span>
          Nếu bạn muốn tải file về thì click{" "}
          <a
            href={url}
            download={`backup-lich-thi-${new Date().toISOString().split("T")[0]}.json`}
            className="font-semibold text-primary underline hover:text-primary/80"
            onClick={() => {
              setTimeout(() => URL.revokeObjectURL(url), 100)
            }}
          >
            tại đây
          </a>
        </span>
      ),
      duration: 10000,
    })
  }

  const handleImport = () => {
    toast({
      title: "Import File Excel",
      description: "Chức năng đang được phát triển",
    })
  }

  const handleExport = () => {
    toast({
      title: "Xuất File Excel",
      description: "Chức năng đang được phát triển",
    })
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedDate("")
    setSelectedRoom("Chọn phòng thi")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <Toaster />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Lịch Thi</h1>
          <p className="text-muted-foreground">Quản lý lớp học và hoạt động giảng dạy</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Tên môn học, lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option>Chọn phòng thi</option>
              <option>A101</option>
              <option>A102</option>
              <option>B205</option>
              <option>C301</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Danh sách lịch thi</h2>
                <p className="text-sm text-muted-foreground">
                  Hiển thị {filteredData.length} buổi thi trong {mockData.length} thi hiện tại
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBackup} className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Sao lưu dữ liệu
                </Button>
                <Button variant="outline" size="sm" onClick={handleImport} className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import File Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
                  <FileSpreadsheet className="h-4 w-4" />
                  Xuất File Excel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">STT</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">LỚP HỌC PHẦN</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">TÊN HỌC PHẦN</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">TÍN CHỈ</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    NGÀY THI - GIỜ THI
                  </th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">PHÒNG THI</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">SV DỰ THI</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    THỜI GIAN (PHÚT)
                  </th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">CBCT 1</th>
                  <th className="p-3 text-left text-xs font-medium uppercase text-muted-foreground">CBCT 2</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((exam) => (
                    <tr key={exam.stt} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{exam.stt}</td>
                      <td className="p-3 text-sm">{exam.lopHocPhan}</td>
                      <td className="p-3 text-sm">{exam.tenHocPhan}</td>
                      <td className="p-3 text-sm">{exam.tinChi}</td>
                      <td className="p-3 text-sm">{exam.ngayThi}</td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {exam.phongThi}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{exam.svDuThi}</td>
                      <td className="p-3 text-sm">{exam.thoiGian}</td>
                      <td className="p-3 text-sm">{exam.cbct1}</td>
                      <td className="p-3 text-sm">{exam.cbct2}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">
                      Không tìm thấy kết quả phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
