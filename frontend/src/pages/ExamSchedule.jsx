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
  const [dateRange, setDateRange] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const fileInputRef = useRef(null);

  // Import Excel state
  const [importResult, setImportResult] = useState({
    success: 0,
    fail: 0,
    details: [],
  });
  const [showImportModal, setShowImportModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/exam-schedule`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu lịch thi");
        const data = await res.json();
        setScheduleData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL]);

  // Filter theo ô tìm kiếm
  const filteredData = scheduleData.filter(
    (item) =>
      item.exam_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course?.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Xử lý import Excel
  const handleFileUpload = async (e) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const successRows = [];
    const failRows = [];

    jsonData.forEach((row, index) => {
      const {
        "Mã lớp": classCode,
        "Mã môn": courseCode,
        "Ngày thi": examDate,
        Ca: session,
        Phòng: room,
      } = row;

      const errors = [];
      if (!classCode) errors.push("Thiếu mã lớp học");
      if (!courseCode) errors.push("Mã môn học không tồn tại");
      if (!examDate || isNaN(Date.parse(examDate)))
        errors.push(`Ngày thi không hợp lệ (${examDate})`);
      if (![1, 2, 3, 4].includes(Number(session)))
        errors.push(`Ca thi không hợp lệ (${session})`);
      if (!room) errors.push("Phòng thi không tồn tại");

      if (errors.length) {
        failRows.push({ index: index + 1, row, errors });
      } else {
        successRows.push(row);
      }
    });

    setImportResult({
      success: successRows.length,
      fail: failRows.length,
      details: [
        ...failRows,
        ...successRows.map((r, i) => ({ index: i + 1, row: r, success: true })),
      ],
    });
    setShowImportModal(true);
  };
  // 📤 Xử lý Import Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 🧩 Chuẩn hóa dữ liệu để React hiểu đúng
      const normalizedData = jsonData.map((item, index) => ({
        exam_session_id: item.exam_session_id || index + 1,
        course: {
          course_code: item.exam_code,
          course_name: item.exam_name,
        },
        exam_date: item.exam_date,
        exam_start_time: item.exam_start_time,
        exam_end_time: item.exam_end_time,
        exam_room: item.exam_room,
        teacher1: item["Tên GV1"]
          ? {
              user_profile: {
                user_firstname: item["Tên GV1"],
                user_lastname: "",
              },
            }
          : null,
        teacher2: item["Tên GV2"]
          ? {
              user_profile: {
                user_firstname: item["Tên GV2"],
                user_lastname: "",
              },
            }
          : null,
        assigned_teacher1_id: item.assigned_teacher1_id,
        assigned_teacher2_id: item.assigned_teacher2_id,
        status: item.status || "Sắp tới",
      }));

      console.log("✅ Chuẩn hóa dữ liệu import:", normalizedData);

      setScheduleData(normalizedData);
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 📥 Xuất Excel
 const handleExportExcel = () => {
  const exportData = scheduleData.map((item, index) => ({
    STT: index + 1,
    "Mã học phần": item.course?.course_code || "",
    "Tên học phần": item.course?.course_name || "",
    "Ngày thi": item.exam_date || "",
    "Giờ bắt đầu": item.exam_start_time || "",
    "Giờ kết thúc": item.exam_end_time || "",
    "Phòng": item.exam_room || "",
    "Cán bộ coi thi 1":
      item.teacher1
        ? `${item.teacher1.user_profile?.user_firstname || ""} ${item.teacher1.user_profile?.user_lastname || ""}`.trim()
        : `GV#${item.assigned_teacher1_id || "-"}`,
    "Cán bộ coi thi 2":
      item.teacher2
        ? `${item.teacher2.user_profile?.user_firstname || ""} ${item.teacher2.user_profile?.user_lastname || ""}`.trim()
        : `GV#${item.assigned_teacher2_id || "-"}`,
    "Thời gian thi (phút)": (() => {
      if (!item.exam_start_time || !item.exam_end_time) return "";
      const start = new Date(`1970-01-01T${item.exam_start_time}`);
      const end = new Date(`1970-01-01T${item.exam_end_time}`);
      return (end - start) / 60000;
    })(),
    "Ghi chú": item.status || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
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
          {/* User Profile */}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
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
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
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
            onClick={handleExportExcel} // <-- thêm dòng này
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
                    return (end - start) / 60000;
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
                        {item.course?.course_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.course?.course_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.exam_date} - {item.exam_start_time?.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.exam_room}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.teacher1
                          ? `${
                              item.teacher1.user_profile?.user_firstname || ""
                            } ${
                              item.teacher1.user_profile?.user_lastname || ""
                            }`
                          : `GV#${item.assigned_teacher1_id || "-"}`}
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.teacher2
                          ? `${
                              item.teacher2.user_profile?.user_firstname || ""
                            } ${
                              item.teacher2.user_profile?.user_lastname || ""
                            }`
                          : `GV#${item.assigned_teacher2_id || "-"}`}
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

      {/* Modal kết quả Import */}
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
