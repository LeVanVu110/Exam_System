"use client"

import React, { useState, useEffect } from "react" 
import axios from "axios"
import { Upload, Download, Search, ChevronDown, ChevronUp, Trash2, FileText } from "lucide-react"
import Swal from "sweetalert2"
import { toast } from "react-toastify"

export default function ExamManagement() {
  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [classCode, setClassCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [selectedRows, setSelectedRows] = useState(new Set())

  // --- HÀM LẤY HEADER AUTH (BEARER TOKEN) ---
  const getAuthHeaders = () => {
    // ⚠️ QUAN TRỌNG: Kiểm tra tab Application -> Local Storage xem key là 'ACCESS_TOKEN' hay 'token'
    const token = localStorage.getItem("ACCESS_TOKEN"); 
    
    if (!token) {
        console.warn("⚠️ Không tìm thấy 'ACCESS_TOKEN' trong localStorage. Kiểm tra lại logic Login!");
    }

    return {
      "Authorization": `Bearer ${token}`,
      // Content-Type sẽ tự động được set tùy vào axios call (multipart vs json)
    };
  };

  // --- HÀM HỖ TRỢ BẮT LỖI DOWNLOAD (BLOB) ---
  const handleDownloadError = async (error) => {
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        toast.error(`⛔ ${json.message || "Bạn không có quyền tải xuống!"}`);
      } catch (e) {
        toast.error("❌ Lỗi không xác định khi tải file.");
      }
    } else {
        if (error.response?.status === 401) {
            toast.error("🔒 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        } else {
            toast.error(error.response?.data?.message || "❌ Lỗi kết nối Server!");
        }
    }
  };

  // ✅ Tìm kiếm + Popup khi không có dữ liệu
  const handleSearch = async () => {
    try {
      setLoading(true)

      const params = {}
      if (from) params.from = from
      if (to) params.to = to
      if (classCode) params.class_code = classCode

      const res = await axios.get("http://localhost:8000/api/exam-sessions", {
        params,
        headers: getAuthHeaders() // Thêm Auth Header
      })

      const fetchedData = Array.isArray(res.data.data) ? res.data.data : []
      setData(fetchedData)
      setSelectedRows(new Set())

      if (fetchedData.length === 0) {
        if (classCode || from || to) {
            Swal.fire({
            icon: "info",
            title: "Không có dữ liệu!",
            text: `Không có kết quả nào phù hợp.`,
            confirmButtonColor: "#3085d6",
            })
        }
      } 
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error)
      
      if (error.response?.status === 401) {
          toast.error("🔒 Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
          // Tùy chọn: Tự động logout nếu cần
          // localStorage.removeItem("ACCESS_TOKEN");
          // window.location.href = "/login";
      } else {
          toast.error("❌ Lỗi khi tải dữ liệu!")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClearClassCode = () => {
    setClassCode("")
    setSelectedRows(new Set())
  }

  const handleDeleteSingle = async (examSessionId) => {
    const confirm = await Swal.fire({
      title: "Xóa kỳ thi?",
      text: "Bạn có chắc chắn muốn xóa kỳ thi này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    })

    if (confirm.isConfirmed) {
      try {
        setLoading(true)
        await axios.delete(`http://localhost:8000/api/exam-sessions/${examSessionId}`, {
            headers: getAuthHeaders() // Thêm Auth Header
        })
        toast.success("✅ Xóa kỳ thi thành công!")
        handleSearch()
      } catch (error) {
        if (error.response?.status === 403) {
            toast.error(`⛔ ${error.response.data.message}`);
        } else if (error.response?.status === 401) {
            toast.error("🔒 Vui lòng đăng nhập lại để thực hiện!");
        } else {
            console.error("Lỗi khi xóa:", error)
            toast.error("❌ Lỗi khi xóa kỳ thi!")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteBulk = async () => {
    if (selectedRows.size === 0) {
      toast.warning("⚠️ Vui lòng chọn ít nhất một kỳ thi để xóa!")
      return
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
    })

    if (confirm.isConfirmed) {
      try {
        setLoading(true)
        const idsToDelete = Array.from(selectedRows)
        await axios.post("http://localhost:8000/api/exam-sessions/delete-bulk", {
          ids: idsToDelete,
        }, {
            headers: getAuthHeaders() // Thêm Auth Header
        })
        toast.success(`✅ Xóa ${selectedRows.size} kỳ thi thành công!`)
        setSelectedRows(new Set())
        handleSearch()
      } catch (error) {
        console.error("Lỗi khi xóa hàng loạt:", error.response || error);

        if (error.response?.status === 403) {
            toast.error(`⛔ ${error.response.data.message}`);
        } else if (error.response?.status === 401) {
            toast.error("🔒 Vui lòng đăng nhập lại để thực hiện!");
        } else if (error.response?.status === 500) {
            toast.error("❌ Lỗi Server (500): Có thể do ràng buộc dữ liệu hoặc lỗi code backend.");
        } else {
            toast.error("❌ Lỗi khi xóa hàng loạt!")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleRowSelection = (examSessionId) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(examSessionId)) {
      newSelected.delete(examSessionId)
    } else {
      newSelected.add(examSessionId)
    }
    setSelectedRows(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((item) => item.exam_session_id)))
    }
  }

  // ✅ Import Excel + Toastify
  const handleImport = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.warning("⚠️ Vui lòng chọn file trước khi import!")
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await axios.post("http://localhost:8000/api/exam-sessions/import", formData, {
        headers: { 
            "Content-Type": "multipart/form-data",
            ...getAuthHeaders() // Thêm Auth Header, giữ Content-Type multipart
        },
      })

      toast.success(`✅ Import thành công! (${res.data.success_rows} / ${res.data.total_rows})`)
      setFile(null)
      e.target.reset(); 
      handleSearch()
    } catch (error) {
      console.error("🔥 Chi tiết lỗi import:", error.response?.data || error)
      
      if (error.response?.status === 403) {
        toast.error(`⛔ ${error.response.data.message || "Bạn không có quyền thực hiện thao tác này!"}`);
      } else if (error.response?.status === 401) {
        toast.error("🔒 Vui lòng đăng nhập lại để Import!");
      } else {
        toast.error("❌ Import thất bại! Vui lòng kiểm tra file hoặc quyền hạn.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ Export Excel
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
      toast.info("📁 Đang tạo file Excel...", { autoClose: 2000 });
      setLoading(true);

      try {
        const response = await axios.get(`http://localhost:8000/api/exam-sessions/export`, {
            params: { from, to },
            responseType: 'blob',
            headers: getAuthHeaders() // Thêm Auth Header
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const filename = `Lich_thi_${new Date().toISOString().slice(0,10)}.xlsx`;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("✅ Xuất file Excel thành công!");

      } catch (error) {
         await handleDownloadError(error);
      } finally {
         setLoading(false);
      }
    }
  };

  // ✅ Xuất PDF
  const handleExportPDF = async (id) => {
    toast.info("📄 Đang tạo file PDF...", { autoClose: 2000 });
    setLoading(true);

    try {
        const response = await axios.get(`http://localhost:8000/api/exam-sessions/${id}/report`, {
            responseType: 'blob', 
            headers: getAuthHeaders() // Thêm Auth Header
        });

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bao_cao_ky_thi_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("✅ Tải PDF thành công!");

    } catch (error) {
        await handleDownloadError(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch()
  }, [])

  const toggleRowExpand = (examSessionId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(examSessionId)) {
      newExpanded.delete(examSessionId)
    } else {
      newExpanded.add(examSessionId)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
              <span className="text-white font-bold text-lg">📘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Quản lý Kỳ Thi</h1>
              <p className="text-xs text-slate-500">Hệ thống quản lý đào tạo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Tìm kiếm và Lọc
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mã lớp</label>
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
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Đang tải...' : 'Tìm kiếm'}
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

          <form onSubmit={handleImport} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-2">Chọn file Excel (.xlsx, .xls)</label>
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
              {loading ? 'Đang tải...' : 'Import File'}
            </button>
          </form>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Danh sách Kỳ Thi <span className="text-slate-500 text-sm font-normal">({data.length} bản ghi)</span></h2>
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
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedRows.size === data.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="w-10 px-2 py-3"></th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Mã ca thi</th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Mã lớp</th>
                  <th className="w-48 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Môn học</th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ngày thi</th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tình trạng</th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">GV 1</th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">GV 2</th>
                  <th className="w-28 px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Báo cáo</th>
                  <th className="w-24 px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {data.length > 0 ? (
                  data.map((item) => (
                    // SỬA LỖI KEY: Thay <> bằng <React.Fragment key={...}>
                    <React.Fragment key={item.exam_session_id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${selectedRows.has(item.exam_session_id) ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(item.exam_session_id)}
                            onChange={() => toggleRowSelection(item.exam_session_id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-2">
                          <button
                            onClick={() => toggleRowExpand(item.exam_session_id)}
                            className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100 transition-all"
                          >
                            {expandedRows.has(item.exam_session_id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.exam_code}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.class_code}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 truncate" title={item.subject_name}>{item.subject_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{item.exam_date}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === "Hoàn thành"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : item.status === "Đang diễn ra"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 truncate" title={item.teacher1_name}>{item.teacher1_name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 truncate" title={item.teacher2_name}>{item.teacher2_name || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleExportPDF(item.exam_session_id)}
                            className="text-slate-500 hover:text-blue-600 transition-colors"
                            title="Xuất PDF"
                          >
                            <FileText size={18} />
                          </button>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteSingle(item.exam_session_id)}
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
                          <td colSpan="11" className="px-4 py-4">
                            <div className="ml-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Phòng thi</p>
                                <p className="font-medium text-slate-800">{item.exam_room}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Tổng máy / Số SV</p>
                                <p className="font-medium text-slate-800">{item.total_computers || 'N/A'} / {item.student_count}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Thời gian</p>
                                <p className="font-medium text-slate-800">{item.exam_time} ({item.exam_duration} phút)</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Khoa coi thi</p>
                                <p className="font-medium text-slate-800">{item.exam_faculty}</p>
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
        </div>
      </div>
    </div>
  )
}