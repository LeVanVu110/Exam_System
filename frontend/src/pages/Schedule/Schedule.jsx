"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function ExamManagement() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());

  // ✅ Tìm kiếm + Popup khi không có dữ liệu
  const handleSearch = async () => {
    try {
      setLoading(true);

      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (classCode) params.class_code = classCode;

      const res = await axios.get("http://localhost:8000/api/exam-schedules", {
        params,
      });

      const fetchedData = Array.isArray(res.data.data) ? res.data.data : [];
      setData(fetchedData);
      setSelectedRows(new Set());

      if (fetchedData.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Không có dữ liệu!",
          text: `Không có kết quả nào cho mã lớp "${classCode}".`,
          confirmButtonColor: "#3085d6",
        });
      } else {
        toast.success(`✅ Tìm thấy ${fetchedData.length} kết quả phù hợp!`);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("❌ Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearClassCode = () => {
    setClassCode("");
    setSelectedRows(new Set());
  };

  const handleDeleteSingle = async (examscheduleId) => {
    const confirm = await Swal.fire({
      title: "Xóa kỳ thi?",
      text: "Bạn có chắc chắn muốn xóa kỳ thi này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(
          `http://localhost:8000/api/exam-schedules/${examscheduleId}`
        );
        toast.success("✅ Xóa kỳ thi thành công!");
        handleSearch();
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        toast.error("❌ Lỗi khi xóa kỳ thi!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedRows.size === 0) {
      toast.warning("⚠️ Vui lòng chọn ít nhất một kỳ thi để xóa!");
      return;
    }

    const confirm = await Swal.fire({
      title: "Xóa hàng loạt?",
      text: `Bạn có chắc chắn muốn xóa ${selectedRows.size} kỳ thi đã chọn không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa tất cả",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const idsToDelete = Array.from(selectedRows);
        await axios.post(
          "http://localhost:8000/api/exam-schedules/delete-bulk",
          {
            ids: idsToDelete,
          }
        );
        toast.success(`✅ Xóa ${selectedRows.size} kỳ thi thành công!`);
        setSelectedRows(new Set());
        handleSearch();
      } catch (error) {
        console.error("Lỗi khi xóa hàng loạt:", error);
        toast.error("❌ Lỗi khi xóa hàng loạt!");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleRowSelection = (examscheduleId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(examscheduleId)) {
      newSelected.delete(examscheduleId);
    } else {
      newSelected.add(examscheduleId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((item) => item.exam_session_id)));
    }
  };

  // ✅ Import Excel + Toastify
  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning("⚠️ Vui lòng chọn file trước khi import!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:8000/api/exam-schedules/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(
        `✅ Import thành công! (${res.data.success_rows} / ${res.data.total_rows})`
      );
      setFile(null);

      setTimeout(() => {
        handleSearch();
      }, 500);
    } catch (error) {
      console.error("🔥 Chi tiết lỗi import:", error.response?.data || error);
      toast.error("❌ Import thất bại! Kiểm tra lại file.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export Excel - Có xác nhận SweetAlert + thông báo rõ ràng
  const handleExport = async () => {
    const confirm = await Swal.fire({
      title: "Xuất file Excel?",
      text: "Bạn có muốn xuất danh sách kỳ thi theo bộ lọc hiện tại không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có, xuất ngay",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      toast.info("📁 Đang tạo file Excel...");

      // Dùng window.open thay vì window.location.href
      // để không tải trực tiếp mà mở tab tải (tránh chặn toast)
      window.open(
        `http://localhost:8000/api/exam-schedules/export?from=${from}&to=${to}`,
        "_blank"
      );
    }
  };

  // ✅ Xuất PDF từng kỳ thi
  const handleExportPDF = (id) => {
    toast.info("📄 Đang tạo file PDF...");
    window.open(
      `http://localhost:8000/api/exam-schedules/${id}/report`,
      "_blank"
    );
  };

  // 🔁 Tải dữ liệu khi load trang
  useEffect(() => {
    handleSearch();
  }, []);

  const toggleRowExpand = (examscheduleId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(examscheduleId)) {
      newExpanded.delete(examscheduleId);
    } else {
      newExpanded.add(examscheduleId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📘</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý Kỳ Thi
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Phòng giảng viên - Hệ thống quản lý kỳ thi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Tìm kiếm và Lọc
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mã lớp
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="Nhập mã lớp..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {classCode && (
                    <button
                      onClick={handleClearClassCode}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                      title="Xóa mã lớp"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium px-6 py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Tìm kiếm
              </button>
              <button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Import Dữ Liệu
          </h2>

          <form
            onSubmit={handleImport}
            className="flex flex-col md:flex-row items-end gap-4"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chọn file Excel
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".xlsx,.xls,.csv"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              {file && (
                <p className="text-xs text-slate-500 mt-1">📄 {file.name}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium px-6 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap w-full md:w-auto"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </form>
        </div>

        {/* Data Table Section */}
        {/* ✅ Bảng dữ liệu */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách Kỳ Thi ({data.length} bản ghi)
            </h2>
            <button
              onClick={handleDeleteBulk}
              disabled={loading || selectedRows.size === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Xóa ({selectedRows.size})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-8 px-2 py-2">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 && selectedRows.size === data.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="w-6 px-2 py-2"></th>
                  <th className="w-32 px-2 py-2 text-xs font-bold text-slate-700">
                    Mã ca thi
                  </th>
                  <th className="w-32 px-2 py-2 text-xs font-bold text-slate-700">
                    Mã lớp
                  </th>
                  <th className="w-40 px-2 py-2 text-xs font-bold text-slate-700">
                    Môn học
                  </th>
                  <th className="w-32 px-2 py-2 text-xs font-bold text-slate-700">
                    Ngày thi
                  </th>
                  <th className="w-32 px-2 py-2 text-xs font-bold text-slate-700">
                    Tình trạng
                  </th>
                  <th className="w-40 px-2 py-2 text-xs font-bold text-slate-700">
                    Giáo viên 1
                  </th>
                  <th className="w-40 px-2 py-2 text-xs font-bold text-slate-700">
                    Giáo viên 2
                  </th>
                  <th className="w-32 px-2 py-2 text-xs font-bold text-slate-700">
                    Kết quả
                  </th>
                  <th className="w-24 px-2 py-2 text-xs font-bold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {data.length > 0 ? (
                  data.map((item) => (
                    <>
                      <tr
                        key={item.exam_session_id}
                        className="hover:bg-slate-50"
                      >
                        <td className="text-center px-2 py-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(item.exam_session_id)}
                            onChange={() =>
                              toggleRowSelection(item.exam_session_id)
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() =>
                              toggleRowExpand(item.exam_session_id)
                            }
                            className="text-slate-500 hover:text-slate-800"
                          >
                            {expandedRows.has(item.exam_session_id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                        <td className="text-xs px-2 py-2 font-medium">
                          {item.exam_code}
                        </td>
                        <td className="text-xs px-2 py-2">{item.class_code}</td>
                        <td className="text-xs px-2 py-2">
                          {item.subject_name}
                        </td>
                        <td className="text-xs px-2 py-2">{item.exam_date}</td>
                        <td className="text-xs px-2 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.status === "Hoàn thành"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "Đang diễn ra"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-xs px-2 py-2">
                          {item.teacher1_name || "—"}
                        </td>
                        <td className="text-xs px-2 py-2">
                          {item.teacher2_name || "—"}
                        </td>
                        <td className="text-xs px-2 py-2">
                          <button
                            onClick={() =>
                              handleExportPDF(item.exam_session_id)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Xuất PDF
                          </button>
                        </td>

                        <td className="text-xs px-2 py-2">
                          <button
                            onClick={() =>
                              handleDeleteSingle(item.exam_session_id)
                            }
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-slate-400 text-white px-3 py-1 rounded text-xs transition flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(item.exam_session_id) && (
                        <tr className="bg-slate-50">
                          <td colSpan="11" className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                              <p>
                                <strong>Phòng thi:</strong> {item.exam_room}
                              </p>
                              <p>
                                <strong>Tổng máy:</strong>{" "}
                                {item.total_computers}
                              </p>
                              <p>
                                <strong>Số lượng SV:</strong>{" "}
                                {item.student_count}
                              </p>
                              <p>
                                <strong>Giờ thi:</strong> {item.exam_time}
                              </p>
                              <p>
                                <strong>Thời lượng:</strong>{" "}
                                {item.exam_duration} phút
                              </p>
                              <p>
                                <strong>Khoa coi thi:</strong>{" "}
                                {item.exam_faculty}
                              </p>
                              <p>
                                <strong>Ngày tạo:</strong> {item.created_at}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="text-center py-8 text-slate-500"
                    >
                      📭 Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
