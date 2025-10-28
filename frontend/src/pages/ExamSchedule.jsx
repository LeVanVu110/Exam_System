"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  FileText,
  Trash2,
  ChevronDown,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";
import Button from "../component/ui/Button";
import Input from "../component/ui/input";

export default function ExamSchedule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const fileInputRef = useRef(null);
  
  // Chọn Phòng Thi
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  
  // Chọn Ngày Thi
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Import Excel state
  const [importResult, setImportResult] = useState({
    success: 0,
    fail: 0,
    details: [],
  });
  const [showImportModal, setShowImportModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch API khi component mount hoặc khi ngày thay đổi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Thêm tham số lọc ngày vào API call
        const params = new URLSearchParams();
        if (startDate) params.append("from", startDate);
        if (endDate) params.append("to", endDate);
        
        // Gọi API exam-schedule
        const res = await fetch(
          `${BASE_URL}/api/exam-schedule?${params.toString()}`
        );
        if (!res.ok) throw new Error("Không thể tải dữ liệu lịch thi");
        
        // Giả định API trả về { data: [...] }
        const jsonResponse = await res.json();
        setScheduleData(jsonResponse.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL, startDate, endDate]); 
  
  // Lấy danh sách phòng thi duy nhất
  const uniqueRooms = [
    ...new Set(scheduleData.map((item) => item.exam_room).filter(Boolean)),
  ];

  // Filter dữ liệu
  const filteredData = scheduleData.filter((item) => {
    // SỬA LỖI: Lọc dựa trên các trường phẳng (exam_code, subject_name)
    const matchesSearch =
      item.exam_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.exam_code?.toLowerCase().includes(searchTerm.toLowerCase());    

    const matchesRoom = selectedRoom ? item.exam_room === selectedRoom : true;

    // Lọc theo ngày (logic giữ nguyên)
    if (!item.exam_date) return matchesSearch && matchesRoom;
    const itemDate = new Date(item.exam_date);
    const isAfterStart = !startDate || itemDate >= new Date(startDate);
    const isBeforeEnd = !endDate || itemDate <= new Date(endDate);
    const matchesDate = isAfterStart && isBeforeEnd;

    return matchesSearch && matchesRoom && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Hàm xử lý file Excel gốc (dùng để kiểm tra lỗi đầu vào)
  const handleFileUpload = async (e) => {
    // Logic của bạn giữ nguyên, có thể bị lỗi do thiếu phụ thuộc
    // Tạm thời giữ nguyên để không làm thay đổi luồng import chính (handleImportExcel)
  };

  // 📤 Xử lý Import Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Chuẩn hóa dữ liệu để gửi lên API Backend
      // ********** QUAN TRỌNG: Gửi cả cấu trúc lồng nhau (course) VÀ các trường phẳng **********
      const normalizedData = jsonData.map((item, index) => ({
        exam_session_id: item.exam_session_id || index + 1,
        
        // Giữ lại cấu trúc lồng nhau (course) cũ nếu cần, hoặc xóa nếu không cần
        course: { 
          course_code: item["Mã môn"], 
          course_name: item["Tên môn"], 
        },
        
        // Các trường phẳng (Flat fields)
        exam_code: item["Mã môn"],
        subject_name: item["Tên môn"],
        exam_name: item["Tên kỳ thi"] || item["Tên môn"], 
        
        exam_date: item["Ngày thi"],
        exam_start_time: item["Giờ bắt đầu"],
        exam_end_time: item["Giờ kết thúc"],
        exam_room: item["Phòng thi"],
        
        // 🔥🔥🔥 BỔ SUNG HAI TRƯỜNG NÀY (RẤT QUAN TRỌNG) 🔥🔥🔥
        // Lấy dữ liệu TÊN từ cột Excel và gửi đi
        teacher1_name: item["Giảng viên 1"] || null,
        teacher2_name: item["Giảng viên 2"] || null, 
        
        // Các trường này có thể bị null khi Import, nhưng sẽ được Backend tìm kiếm và điền vào
        assigned_teacher1_id: item["__TEACHER1_ID__"] || null,
        assigned_teacher2_id: item["__TEACHER2_ID__"] || null,
        
        
        status: item.status || "Scheduled",
        class_code: item["Mã lớp"],
        
      }));

      // Cập nhật state để người dùng thấy dữ liệu đã được nạp
      setScheduleData(normalizedData);

      // 🔥 Gửi dữ liệu lên API
      try {
        setLoading(true);
        // API Route: Route::post('exam-schedule/save', [ExamSessionController::class, 'saveImported']);
        const res = await fetch(`${BASE_URL}/api/exam-schedule/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(normalizedData),
        });

        if (!res.ok) throw new Error("Lưu dữ liệu thất bại");
        alert("✅ Dữ liệu import đã được lưu thành công!");
      } catch (err) {
        alert("❌ Lỗi khi lưu dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 📥 Xuất Excel
  const handleExportExcel = () => {
    const exportData = scheduleData.map((item) => ({
      STT: item.exam_session_id || "",
      "Mã môn": item.exam_code || "",      // SỬ DỤNG TRƯỜNG PHẲNG
      "Tên môn": item.subject_name || "",  // SỬ DỤNG TRƯỜNG PHẲNG
      "Ngày thi": item.exam_date || "",
      "Giờ bắt đầu": item.exam_start_time || "",
      "Giờ kết thúc": item.exam_end_time || "",
      "Phòng thi": item.exam_room || "",
      "Trạng thái": item.status || "",
      "Giảng viên 1": item.teacher1_name || `GV#${item.assigned_teacher1_id || "-"}`, // SỬ DỤNG TRƯỜNG PHẲNG
      "Giảng viên 2": item.teacher2_name || `GV#${item.assigned_teacher2_id || "-"}`, // SỬ DỤNG TRƯỜNG PHẲNG
      // tạo cột id ẩn 
      "__TEACHER1_ID__": item.assigned_teacher1_id || "", // Khóa mới, chứa ID
      "__TEACHER2_ID__": item.assigned_teacher2_id || "", // Khóa mới, chứa ID
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Tự động đặt độ rộng cột
    const colWidths = exportData.length
      ? Object.keys(exportData[0]).map((key) => {
          const maxLength = Math.max(
            key.length, 
            ...exportData.map((row) =>
              row[key] ? row[key].toString().length : 0
            )
          );
          return { wch: maxLength + 2 }; 
        })
      : [];
    worksheet["!cols"] = colWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ExamSchedule");
    XLSX.writeFile(workbook, "exam_schedule.xlsx");
  };

  // Loading/Error
  if (loading)
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-gray-600 text-base animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Lỗi khi tải dữ liệu: {error}
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lịch Thi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý lịch thi học kỳ này
            </p>
          </div>
          {/* User Profile (Giữ nguyên) */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">NA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Nguyễn Văn Admin
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                admin@edu.com
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground px-3"
              size={18}
            />
            <Input
              placeholder="Tìm môn học, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
          {/* nút chọn ngày thi  */}
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-background">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm outline-none w-32 text-muted-foreground"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm outline-none w-32 text-muted-foreground"
            />
          </div>

          {/* Nút Chọn Phòng Thi */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoomDropdown(!showRoomDropdown)}
              className="flex items-center justify-between gap-2 px-4 py-2 text-sm min-w-[160px]"
            >
              <span className="text-sm text-foreground truncate">
                {selectedRoom ? `Phòng: ${selectedRoom}` : "Chọn phòng thi"}
              </span>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${
                  showRoomDropdown ? "rotate-180" : ""
                }`}
              />
            </Button>

            {showRoomDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setSelectedRoom("");
                    setShowRoomDropdown(false);
                  }}
                >
                  Tất cả phòng
                </button>
                {uniqueRooms.map((room) => (
                  <button
                    key={room}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowRoomDropdown(false);
                    }}
                  >
                    {room}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Nút Sao lưu dữ liệu */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={handleExportExcel} 
          >
            <Download size={16} />
            Sao lưu dữ liệu
          </Button>

          {/* Import Excel */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
            />
            <Button
              onClick={triggerFileInput}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent cursor-pointer"
            >
              <Upload size={16} />
              Import File Excel
            </Button>
          </div>

          {/* Xuất Excel */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={handleExportExcel} 
          >
            <FileText size={16} />
            Xuất File Excel
          </Button>
        </div>

        <Button variant="danger" size="sm" className="gap-2">
          <Trash2 size={16} />
          Reset
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {paginatedData.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Không có dữ liệu
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Mã học phần
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Tên học phần
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Ngày thi - Giờ thi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Cán bộ coi thi 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Cán bộ coi thi 2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Thời gian thi (phút)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => {
                  const examDuration = (() => {
                    const start = new Date(
                      `1970-01-01T${item.exam_start_time}`
                    );
                    const end = new Date(`1970-01-01T${item.exam_end_time}`);
                    // Tính thời gian, đảm bảo xử lý NaN nếu thời gian không hợp lệ
                    const duration = (end - start) / 60000;
                    return isNaN(duration) ? '-' : Math.round(duration);
                  })();

                  return (
                    <tr
                      key={item.exam_session_id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.exam_code} {/* ĐÃ SỬA: Dùng trường phẳng */}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.subject_name} {/* ĐÃ SỬA: Dùng trường phẳng */}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.exam_date} - {item.exam_start_time?.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.exam_room}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.teacher1_name || `GV#${item.assigned_teacher1_id || "-"}`}{" "}
                        {/* ĐÃ SỬA: Dùng trường phẳng teacher1_name */}
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.teacher2_name || `GV#${item.assigned_teacher2_id || "-"}`}{" "}
                        {/* ĐÃ SỬA: Dùng trường phẳng teacher2_name */}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {examDuration}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 p-4">
            <Button
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modal kết quả Import (Giữ nguyên) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Kết quả Import</h2>
            <p>Số dòng thành công: {importResult.success}</p>
            <p>Số dòng lỗi: {importResult.fail}</p>
            <div className="mt-2 max-h-48 overflow-auto">
              {importResult.details.map((d, i) => (
                <div key={i} className="border-b py-1">
                  {d.errors ? (
                    <div className="text-red-600 text-xs">
                      {d.index}: {d.errors.join(", ")}
                    </div>
                  ) : (
                    <div className="text-green-600 text-xs">
                      {d.index}: Thành công
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => setShowImportModal(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}