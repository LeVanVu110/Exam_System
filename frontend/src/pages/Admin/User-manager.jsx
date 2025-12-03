"use client"

import React, { useState, useEffect } from "react" 
import axios from "axios"
import { 
  Search, Plus, Edit, Trash2, X, Check, Loader2, 
  User, Shield, Mail, AlertTriangle, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Info
} from "lucide-react"

const API_URL = "http://localhost:8000/api"; 

export default function UserManagement() {
  // --- STATE DỮ LIỆU ---
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // Danh sách role cho dropdown
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // --- STATE UI ---
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // --- STATE FORM ---
  const [formData, setFormData] = useState({
    user_id: null,
    user_code: "",
    user_name: "",
    user_email: "",
    password: "",
    role_id: "",
    user_is_activated: 1
  });

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE CUSTOM UI (TOAST & MODAL) ---
  const [toast, setToast] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null); 

  // --- HELPER ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
  };

  // ==================================================================================
  // 1. KHỞI TẠO & FETCH DATA
  // ==================================================================================
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Lọc dữ liệu khi search thay đổi
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = users.filter(u => 
        u.user_name?.toLowerCase().includes(lower) || 
        u.user_email?.toLowerCase().includes(lower) ||
        (u.user_code && u.user_code.toLowerCase().includes(lower))
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, { headers: getAuthHeaders() });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
          showToast("Phiên đăng nhập hết hạn", "error");
      } else {
          showToast("Lỗi tải danh sách người dùng", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/roles`, { headers: getAuthHeaders() });
      setRoles(res.data);
    } catch (error) {
      console.error("Lỗi tải roles:", error);
    }
  };

  // ==================================================================================
  // 2. XỬ LÝ FORM (THÊM / SỬA)
  // ==================================================================================
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      user_id: null, user_code: "", user_name: "", user_email: "", password: "", role_id: roles.length > 0 ? roles[0].role_id : "", user_is_activated: 1
    });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      user_id: user.user_id,
      user_code: user.user_code || "",
      user_name: user.user_name,
      user_email: user.user_email,
      password: "", // Không điền password cũ để bảo mật
      role_id: user.role_id || "",
      user_is_activated: user.user_is_activated
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.user_name || !formData.user_email || !formData.role_id) {
        showToast("Vui lòng điền đầy đủ thông tin!", "warning");
        return;
    }
    if (!isEditing && !formData.password) {
        showToast("Vui lòng nhập mật khẩu cho người dùng mới!", "warning");
        return;
    }

    setLoading(true);
    try {
        if (isEditing) {
            // Update
            await axios.put(`${API_URL}/users/${formData.user_id}`, formData, { headers: getAuthHeaders() });
            showToast("Cập nhật người dùng thành công!");
        } else {
            // Create
            await axios.post(`${API_URL}/users`, formData, { headers: getAuthHeaders() });
            showToast("Thêm người dùng mới thành công!");
        }
        setModalOpen(false);
        fetchUsers(); // Reload danh sách
    } catch (error) {
        const msg = error.response?.data?.message || "Có lỗi xảy ra!";
        showToast(msg, "error");
    } finally {
        setLoading(false);
    }
  };

  // ==================================================================================
  // 3. XỬ LÝ XÓA
  // ==================================================================================
  const handleDelete = (user) => {
    setConfirmModal({
        title: "Xóa người dùng?",
        message: `Bạn có chắc muốn xóa tài khoản "${user.user_name}"? Hành động này không thể hoàn tác.`,
        onConfirm: async () => {
            try {
                await axios.delete(`${API_URL}/users/${user.user_id}`, { headers: getAuthHeaders() });
                showToast("Đã xóa người dùng thành công!");
                fetchUsers();
            } catch (error) {
                const msg = error.response?.data?.message || "Lỗi khi xóa!";
                showToast(msg, "error");
            } finally {
                setConfirmModal(null);
            }
        }
    });
  };

  // ==================================================================================
  // 4. PHÂN TRANG
  // ==================================================================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const goToPage = (page) => setCurrentPage(page);

  // Helper để tạo Avatar chữ cái đầu
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-10 relative">
      
      {/* --- TOAST --- */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-[slideIn_0.3s_ease-out] 
            ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-green-600'}`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5"/> : toast.type === 'warning' ? <Info className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 rounded-full p-1"><X className="w-4 h-4"/></button>
        </div>
      )}

      {/* --- CONFIRM MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 p-6 text-center animate-[zoomIn_0.2s_ease-out]">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmModal.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setConfirmModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                    <button onClick={confirmModal.onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">Xóa ngay</button>
                </div>
            </div>
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-[zoomIn_0.2s_ease-out]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <h3 className="font-semibold text-lg text-gray-800">{isEditing ? "Cập nhật Người dùng" : "Thêm Người dùng Mới"}</h3>
                    <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên *</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                                value={formData.user_code} onChange={e => setFormData({...formData, user_code: e.target.value})} disabled={isEditing} placeholder="NV001" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                                value={formData.user_name} onChange={e => setFormData({...formData, user_name: e.target.value})} placeholder="Nguyễn Văn A" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                            value={formData.user_email} onChange={e => setFormData({...formData, user_email: e.target.value})} placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{isEditing ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu *"}</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                                value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})}>
                                <option value="">-- Chọn vai trò --</option>
                                {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                                value={formData.user_is_activated} onChange={e => setFormData({...formData, user_is_activated: parseInt(e.target.value)})}>
                                <option value={1}>Hoạt động</option>
                                <option value={0}>Vô hiệu hóa</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors">
                            {loading && <Loader2 className="w-4 h-4 animate-spin"/>} {isEditing ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200"><User className="w-6 h-6"/></div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h1>
                    <p className="text-xs text-slate-500">Danh sách nhân viên và phân quyền</p>
                </div>
            </div>
            <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                <Plus className="w-5 h-5"/> Thêm mới
            </button>
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên, email hoặc mã nhân viên..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="text-sm text-gray-500">
                Hiển thị <b>{currentItems.length}</b> / <b>{filteredUsers.length}</b> kết quả
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Nhân viên</th>
                            <th className="px-6 py-4 font-semibold">Mã NV</th>
                            <th className="px-6 py-4 font-semibold">Vai trò</th>
                            <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                            <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="py-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Đang tải dữ liệu...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="5" className="py-12 text-center text-gray-400">Không tìm thấy người dùng nào.</td></tr>
                        ) : (
                            currentItems.map(user => (
                                <tr key={user.user_id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {getInitials(user.user_name)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.user_name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3"/> {user.user_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{user.user_code || "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                            <Shield className="w-3 h-3"/> {user.role_name || "Chưa phân quyền"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${user.user_is_activated ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {user.user_is_activated ? "Hoạt động" : "Vô hiệu hóa"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chỉnh sửa">
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => handleDelete(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <span className="text-sm text-slate-500">Trang {currentPage} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1)
                            .map((page, index, array) => (
                                <React.Fragment key={page}>
                                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-slate-400">...</span>}
                                    <button onClick={() => goToPage(page)} 
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all shadow-sm ${currentPage === page ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                        {page}
                                    </button>
                                </React.Fragment>
                        ))}
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4"/></button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}