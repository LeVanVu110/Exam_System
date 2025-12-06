"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function ExamManagement() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE UI CUSTOM ---
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // --- HELPER UI ---
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- HÀM LẤY HEADER AUTH ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
      console.warn("⚠️ Không tìm thấy 'ACCESS_TOKEN'. Kiểm tra lại Login!");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // --- HÀM HỖ TRỢ BẮT LỖI DOWNLOAD ---
  const handleDownloadError = async (error) => {
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        showToast(
          `⛔ ${json.message || "Bạn không có quyền tải xuống!"}`,
          "error"
        );
      } catch (e) {
        showToast("❌ Lỗi không xác định khi tải file.", "error");
      }
    } else {
      if (error.response?.status === 401) {
        showToast(
          "🔒 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!",
          "error"
        );
      } else {
        showToast(
          error.response?.data?.message || "❌ Lỗi kết nối Server!",
          "error"
        );
      }
    }
  };

  // ✅ Tìm kiếm
  const handleSearch = async (overrideClassCode = null) => {
    // 👇 THÊM MỚI: Kiểm tra ngày hợp lệ
    if (from && to && new Date(from) > new Date(to)) {
      showToast("⚠️ Ngày bắt đầu không được lớn hơn ngày kết thúc!", "warning");
      return; // Dừng ngay, không gọi API
    }

    try {
      setLoading(true);

      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const activeClassCode =
        typeof overrideClassCode === "string" ? overrideClassCode : classCode;

      if (activeClassCode) params.class_code = activeClassCode;

      const res = await axios.get("http://localhost:8000/api/exam-sessions", {
        params,
        headers: getAuthHeaders(),
      });

      const fetchedData = Array.isArray(res.data.data) ? res.data.data : [];

      //THÊM ĐOẠN NÀY: Sắp xếp ID lớn nhất lên đầu (Mới nhất lên đầu)
      fetchedData.sort((a, b) => a.exam_session_id - b.exam_session_id);
      //CÁCH 2: (Khuyên dùng) Sắp xếp theo Ngày thi (Ngày mới nhất lên đầu)
      // fetchedData.sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));

      setData(fetchedData);
      setSelectedRows(new Set());
      setCurrentPage(1);

      // 👇 Đã thêm: Logic hiển thị thông báo kết quả tìm kiếm
      if (fetchedData.length > 0) {
        // Chỉ hiện thông báo nếu người dùng có nhập điều kiện lọc (ngày hoặc mã lớp)
        if (activeClassCode || from || to) {
          showToast(
            `✅ Tìm thấy ${fetchedData.length} ca thi phù hợp!`,
            "success"
          );
        }
      } else {
        // Nếu KHÔNG có dữ liệu (kết quả rỗng)
        if (activeClassCode) {
          // 🎯 Trường hợp 1: Có nhập Mã lớp -> Báo lỗi cụ thể theo yêu cầu của bạn
          showToast("⚠️ Không tìm thấy ca thi có mã này!", "warning");
        } else if (from || to) {
          // 🎯 Trường hợp 2: Chỉ nhập ngày (không nhập mã lớp)
          showToast(
            "⚠️ Không tìm thấy kết quả nào trong khoảng thời gian này.",
            "warning"
          );
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error.response?.status === 401) {
        showToast("🔒 Phiên đăng nhập hết hạn.", "error");
      } else {
        showToast("❌ Lỗi khi tải dữ liệu!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xử lý khi xóa mã lớp
  const handleClearClassCode = () => {
    setClassCode("");
    setSelectedRows(new Set());
    handleSearch("");
  };

  // Xử lý Xóa Đơn
  const handleDeleteSingle = (examSessionId) => {
    setConfirmModal({
      title: "Xóa kỳ thi?",
      message:
        "Bạn có chắc chắn muốn xóa kỳ thi này không? Hành động này không thể hoàn tác.",
      type: "danger",
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.delete(
            `http://localhost:8000/api/exam-sessions/${examSessionId}`,
            {
              headers: getAuthHeaders(),
            }
          );
          showToast("✅ Xóa kỳ thi thành công!", "success");
          handleSearch();
        } catch (error) {
          // 👇 CẬP NHẬT: Bắt lỗi 404 (Không tìm thấy)
          if (error.response?.status === 404) {
            showToast(
              "⚠️ Kỳ thi này không còn tồn tại (có thể đã bị xóa ở tab khác)!",
              "warning"
            );
            // Tự động tải lại danh sách để đồng bộ dữ liệu
            handleSearch();
          } else if (error.response?.status === 403) {
            showToast(`⛔ ${error.response.data.message}`, "error");
          } else if (error.response?.status === 401) {
            showToast("🔒 Vui lòng đăng nhập lại!", "error");
          } else {
            showToast("❌ Lỗi khi xóa kỳ thi!", "error");
          }
        } finally {
          setLoading(false);
          setConfirmModal(null);
        }
      },
    });
  };

  // Xử lý Xóa Nhiều
  const handleDeleteBulk = () => {
    if (selectedRows.size === 0) {
      showToast("⚠️ Vui lòng chọn ít nhất một kỳ thi để xóa!", "warning");
      return;
    }

    setConfirmModal({
      title: "Xóa hàng loạt?",
      message: `Bạn có chắc chắn muốn xóa ${selectedRows.size} kỳ thi đã chọn không?`,
      type: "danger",
      onConfirm: async () => {
        try {
          setLoading(true);
          const idsToDelete = Array.from(selectedRows);
          await axios.post(
            "http://localhost:8000/api/exam-sessions/delete-bulk",
            {
              ids: idsToDelete,
            },
            {
              headers: getAuthHeaders(),
            }
          );
          showToast(
            `✅ Xóa ${selectedRows.size} kỳ thi thành công!`,
            "success"
          );
          setSelectedRows(new Set());
          handleSearch();
        } catch (error) {
          if (error.response?.status === 403) {
            showToast(`⛔ ${error.response.data.message}`, "error");
          } else if (error.response?.status === 401) {
            showToast("🔒 Vui lòng đăng nhập lại!", "error");
          } else {
            showToast("❌ Lỗi khi xóa hàng loạt!", "error");
          }
        } finally {
          setLoading(false);
          setConfirmModal(null);
        }
      },
    });
  };

  const toggleRowSelection = (examSessionId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(examSessionId)) {
      newSelected.delete(examSessionId);
    } else {
      newSelected.add(examSessionId);
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

  // Import
  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast("⚠️ Vui lòng chọn file trước khi import!", "warning");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:8000/api/exam-sessions/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAuthHeaders(),
          },
        }
      );

      showToast(
        `✅ Import thành công! (${res.data.success_rows} / ${res.data.total_rows})`,
        "success"
      );
      setFile(null);
      e.target.reset();
      handleSearch();
    } catch (error) {
      console.error("🔥 Chi tiết lỗi import:", error.response?.data || error);
      if (error.response?.status === 403) {
        showToast(
          `⛔ ${error.response.data.message || "Không có quyền!"}`,
          "error"
        );
      } else if (error.response?.status === 401) {
        showToast("🔒 Vui lòng đăng nhập lại!", "error");
      } else if (error.response?.data?.message) {
        showToast(`❌ ${error.response.data.message}`, "error");
      } else {
        showToast("❌ Import thất bại! Kiểm tra lại file.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Export
  const handleExport = () => {
    // 👇 THÊM MỚI: Kiểm tra trước khi mở modal xác nhận
    if (from && to && new Date(from) > new Date(to)) {
      showToast("⚠️ Ngày bắt đầu không được lớn hơn ngày kết thúc!", "warning");
      return;
    }

    setConfirmModal({
      title: "Xuất file Excel?",
      message: "Bạn có muốn xuất danh sách kỳ thi theo bộ lọc hiện tại không?",
      type: "info",
      onConfirm: async () => {
        showToast("📁 Đang tạo file Excel...", "info");
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8000/api/exam-sessions/export`,
            {
              params: { from, to },
              responseType: "blob",
              headers: getAuthHeaders(),
            }
          );

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          const filename = `Lich_thi_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          showToast("✅ Xuất file Excel thành công!", "success");
        } catch (error) {
          await handleDownloadError(error);
        } finally {
          setLoading(false);
          setConfirmModal(null);
        }
      },
    });
  };

  const handleExportPDF = async (id) => {
    showToast("📄 Đang tạo file PDF...", "info");
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:8000/api/exam-sessions/${id}/report`,
        {
          responseType: "blob",
          headers: getAuthHeaders(),
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bao_cao_ky_thi_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("✅ Tải PDF thành công!", "success");
    } catch (error) {
      await handleDownloadError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const toggleRowExpand = (examSessionId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(examSessionId)) {
      newExpanded.delete(examSessionId);
    } else {
      newExpanded.add(examSessionId);
    }
    setExpandedRows(newExpanded);
  };

  // 👉 TÍNH TOÁN PHÂN TRANG
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10 relative">
      {/* 🔥 TOAST NOTIFICATION COMPONENT */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-[slideIn_0.3s_ease-out] 
            ${
              toast.type === "error"
                ? "bg-red-500"
                : toast.type === "success"
                ? "bg-emerald-600"
                : toast.type === "warning"
                ? "bg-amber-500"
                : "bg-blue-600"
            }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:bg-white/20 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 🔥 CUSTOM CONFIRM MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 scale-100 animate-[zoomIn_0.2s_ease-out]">
            <div className="p-6 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 
                        ${
                          confirmModal.type === "danger"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
              >
                {confirmModal.type === "danger" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {confirmModal.message}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow transition-colors flex items-center gap-2
                                ${
                                  confirmModal.type === "danger"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
              <span className="text-white font-bold text-lg">📘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Quản lý Kỳ Thi
              </h1>
              <p className="text-xs text-slate-500">Hệ thống quản lý đào tạo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[95%] mx-auto px-4 py-8 space-y-6">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Search className="w-4 h-4" />
                {loading ? "Đang tải..." : "Tìm kiếm"}
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium px-6 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
                Chọn file Excel (.xlsx, .xls)
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".xlsx,.xls,.csv"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-6 py-2.5 rounded-lg transition flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center shadow-sm"
            >
              <Upload className="w-4 h-4" />
              {loading ? "Đang tải..." : "Import File"}
            </button>
          </form>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách Kỳ Thi{" "}
              <span className="text-slate-500 text-sm font-normal">
                ({data.length} bản ghi)
              </span>
            </h2>
            {selectedRows.size > 0 && (
              <button
                onClick={handleDeleteBulk}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Xóa ({selectedRows.size})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-12 px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 && selectedRows.size === data.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="w-12 px-2 py-3"></th>
                  <th className="w-40 px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Mã ca thi
                  </th>
                  <th className="w-36 px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Mã lớp
                  </th>
                  {/* 👇 Đã sửa: Tăng độ rộng cột Môn học */}
                  <th className="min-w-[250px] px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Ngày thi
                  </th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Tình trạng
                  </th>
                  <th className="w-48 px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    GV 1
                  </th>
                  <th className="w-48 px-2 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    GV 2
                  </th>
                  <th className="w-24 px-2 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Báo cáo
                  </th>
                  <th className="w-24 px-2 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <React.Fragment key={item.exam_session_id}>
                      <tr
                        className={`hover:bg-slate-50 transition-colors ${
                          selectedRows.has(item.exam_session_id)
                            ? "bg-blue-50/50"
                            : ""
                        }`}
                      >
                        <td className="px-2 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(item.exam_session_id)}
                            onChange={() =>
                              toggleRowSelection(item.exam_session_id)
                            }
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-2">
                          <button
                            onClick={() =>
                              toggleRowExpand(item.exam_session_id)
                            }
                            className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100 transition-all"
                          >
                            {expandedRows.has(item.exam_session_id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                        <td
                          className="px-2 py-3 text-sm font-medium text-slate-900 truncate"
                          title={item.exam_code}
                        >
                          {item.exam_code}
                        </td>
                        <td
                          className="px-2 py-3 text-sm text-slate-600 truncate"
                          title={item.class_code}
                        >
                          {item.class_code}
                        </td>
                        {/* 👇 Đã sửa: Cho phép xuống dòng (whitespace-normal) */}
                        <td
                          className="px-2 py-3 text-sm text-slate-600 font-medium whitespace-normal"
                          title={item.subject_name}
                        >
                          {item.subject_name}
                        </td>
                        <td className="px-2 py-3 text-sm text-slate-600 whitespace-nowrap">
                          {item.exam_date}
                        </td>
                        <td className="px-2 py-3 text-sm">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${
                              item.status === "Hoàn thành"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : item.status === "Đang diễn ra"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td
                          className="px-2 py-3 text-sm text-slate-600 truncate"
                          title={item.teacher1_name}
                        >
                          {item.teacher1_name || "—"}
                        </td>
                        <td
                          className="px-2 py-3 text-sm text-slate-600 truncate"
                          title={item.teacher2_name}
                        >
                          {item.teacher2_name || "—"}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() =>
                              handleExportPDF(item.exam_session_id)
                            }
                            className="text-slate-500 hover:text-blue-600 transition-colors"
                            title="Xuất PDF"
                          >
                            <FileText size={18} />
                          </button>
                        </td>

                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() =>
                              handleDeleteSingle(item.exam_session_id)
                            }
                            disabled={loading}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(item.exam_session_id) && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan="11" className="px-2 py-4">
                            <div className="ml-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">
                                  Phòng thi
                                </p>
                                <p className="font-medium text-slate-800">
                                  {item.exam_room}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">
                                  Tổng máy / Số SV
                                </p>
                                <p className="font-medium text-slate-800">
                                  {item.total_computers || "N/A"} /{" "}
                                  {item.student_count}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">
                                  Thời gian
                                </p>
                                <p className="font-medium text-slate-800">
                                  {item.exam_start_time
                                    ? item.exam_start_time.slice(0, 5)
                                    : ""}{" "}
                                  -{" "}
                                  {item.exam_end_time
                                    ? item.exam_end_time.slice(0, 5)
                                    : ""}{" "}
                                  ({item.exam_duration} phút)
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">
                                  Khoa coi thi
                                </p>
                                <p className="font-medium text-slate-800">
                                  {item.exam_faculty}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl mb-3">📭</span>
                        <p>Không tìm thấy dữ liệu phù hợp</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 👉 THANH PHÂN TRANG */}
          {data.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Hiển thị{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> đến{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, data.length)}
                </span>{" "}
                trong tổng số <span className="font-medium">{data.length}</span>{" "}
                ca thi
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm transition-all text-slate-600"
                >
                  <ChevronLeft size={16} />
                </button>
                {/* Render Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(currentPage - p) <= 1
                  ) // Logic rút gọn số trang
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm font-medium transition-all shadow-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm transition-all text-slate-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoomIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
