"use client"

import React, { useState, useEffect } from "react" 
import axios from "axios"
import { 
  Search, Plus, Edit, Trash2, X, Check, Loader2, 
  User, Shield, Mail, AlertTriangle, CheckCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Info, Eye, EyeOff, Lock
} from "lucide-react"

const API_URL = "http://localhost:8000/api"; 
// 👇 QUAN TRỌNG: Mã màn hình phải khớp với DB (bảng screens)
const SCREEN_CODE = "USER_MAN"; 

export default function UserManagement() {
  // --- STATE DỮ LIỆU ---
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // 👉 STATE QUYỀN HẠN (Mặc định là false hết)
  const [permissions, setPermissions] = useState({
      is_view: false,
      is_add: false,
      is_edit: false,
      is_delete: false
  });

  // --- STATE UI ---
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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

  // --- STATE LỖI FORM ---
  const [formErrors, setFormErrors] = useState({});

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE CUSTOM UI ---
  const [toast, setToast] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null); 
  const [editLoadingId, setEditLoadingId] = useState(null);

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

  const getRoleStyle = (roleName) => {
    const role = roleName ? roleName.toLowerCase() : "student";
    
    if (role === "admin" || role === "administrator" || role === "quản trị viên") {
        return "bg-red-100 text-red-700 border-red-200";
    }
    if (role === "teacher" || role === "giảng viên" || role === "giáo viên") {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (role.includes("academic") || role.includes("đào tạo") || role.includes("pdt")) {
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (role === "student" || role === "sinh viên") {
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // ==================================================================================
  // 1. KHỞI TẠO & FETCH DATA
  // ==================================================================================
  useEffect(() => {
    // 👉 1.1 Lấy quyền từ localStorage khi trang load
    const storedPerms = localStorage.getItem("user_permissions");
    if (storedPerms) {
        try {
            const parsedPerms = JSON.parse(storedPerms);
            
            // Tìm quyền của màn hình USER_MAN
            // Logic này xử lý cả 2 trường hợp backend trả về Array hoặc Object
            let myPerm = {};
            if (Array.isArray(parsedPerms)) {
                myPerm = parsedPerms.find(p => p.screen_code === SCREEN_CODE) || {};
            } else {
                myPerm = parsedPerms[SCREEN_CODE] || {};
            }

            // Cập nhật state (chuyển đổi 1/0 sang true/false)
            setPermissions({
                is_view: !!myPerm.is_view,
                is_add: !!myPerm.is_add,
                is_edit: !!myPerm.is_edit,
                is_delete: !!myPerm.is_delete
            });

            // 👉 Chỉ gọi API lấy dữ liệu nếu có quyền View
            if (!!myPerm.is_view) {
                fetchUsers();
                fetchRoles();
            }
        } catch (e) {
            console.error("Lỗi đọc quyền:", e);
        }
    }
  }, []);

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
    setCurrentPage(1); 
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, { headers: getAuthHeaders() });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
          showToast("⛔ Bạn không có quyền xem danh sách!", "error");
      } else if (error.response?.status === 401) {
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
  // 2. XỬ LÝ FORM & VALIDATION
  // ==================================================================================
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let errorMsg = "";
    if (name === "user_code") {
        if (value.length > 25) errorMsg = `Đã nhập quá giới hạn (${value.length}/25 ký tự)`;
        else if (value.trim()) {
            const isDuplicate = users.some(u => 
                u.user_code && 
                u.user_code.toLowerCase() === value.trim().toLowerCase() && 
                (!isEditing || u.user_id !== formData.user_id)
            );
            if (isDuplicate) errorMsg = "Mã nhân viên này đã tồn tại!";
        }
    }
    if (name === "user_name" && value.length > 25) errorMsg = `Tên quá dài (${value.length}/25 ký tự)`;
    if (name === "user_email" && value.length > 255) errorMsg = "Email quá dài (tối đa 255 ký tự)";
    if (name === "password") {
        if (value && value.length > 255) errorMsg = "Mật khẩu quá dài";
        else if (value && value.length < 8) errorMsg = "Mật khẩu phải có ít nhất 8 ký tự";
        else if (value && (!/\d/.test(value) || !/[\W_]/.test(value))) errorMsg = "Mật khẩu phải chứa ít nhất một số và một ký tự đặc biệt";
    }
    setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const openAddModal = () => {
    // 👉 Check quyền ADD trước khi mở form
    if (!permissions.is_add) {
        showToast("⛔ Bạn không có quyền thêm mới!", "error");
        return;
    }

    setIsEditing(false);
    setShowPassword(false); 
    const defaultRoleId = roles.length > 0 ? roles[0].role_id : "";
    setFormData({
      user_id: null, user_code: "", user_name: "", user_email: "", password: "", 
      role_id: defaultRoleId, user_is_activated: 1
    });
    setFormErrors({}); 
    setModalOpen(true);
  };

  const handleEditClick = async (user) => {
    // 👉 Check quyền EDIT trước khi mở form
    if (!permissions.is_edit) {
        showToast("⛔ Bạn không có quyền chỉnh sửa!", "error");
        return;
    }

    setEditLoadingId(user.user_id);
    try {
        const res = await axios.get(`${API_URL}/users/${user.user_id}`, { headers: getAuthHeaders() });
        setIsEditing(true);
        setShowPassword(false);
        setFormData({
            user_id: user.user_id,
            user_code: user.user_code || "",
            user_name: user.user_name,
            user_email: user.user_email,
            password: "", 
            role_id: user.role_id || "",
            user_is_activated: user.user_is_activated
        });
        setFormErrors({});
        setModalOpen(true);
    } catch (error) {
        showToast("Lỗi tải dữ liệu người dùng", "error");
    } finally {
        setEditLoadingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // 👉 Check quyền lần cuối khi submit (Security Check)
    if (isEditing && !permissions.is_edit) {
        showToast("⛔ Bạn không có quyền sửa!", "error");
        return;
    }
    if (!isEditing && !permissions.is_add) {
        showToast("⛔ Bạn không có quyền thêm!", "error");
        return;
    }

    const hasErrors = Object.values(formErrors).some(err => err !== "");
    if (hasErrors) {
        showToast("Vui lòng sửa các lỗi trước khi lưu!", "warning");
        return;
    }

    setLoading(true);
    try {
        if (isEditing) {
            await axios.put(`${API_URL}/users/${formData.user_id}`, formData, { headers: getAuthHeaders() });
            showToast("Cập nhật người dùng thành công!");
        } else {
            await axios.post(`${API_URL}/users`, formData, { headers: getAuthHeaders() });
            showToast("Thêm người dùng mới thành công!");
        }
        setModalOpen(false);
        fetchUsers(); 
    } catch (error) {
        const msg = error.response?.data?.message || "Có lỗi xảy ra!";
        if (error.response?.data?.errors) {
            showToast("Vui lòng kiểm tra lại thông tin nhập!", "error");
        } else {
            showToast(msg, "error");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = (user) => {
    // 👉 Check quyền DELETE
    if (!permissions.is_delete) {
        showToast("⛔ Bạn không có quyền xóa!", "error");
        return;
    }

    setConfirmModal({
        title: "Xóa người dùng?",
        message: `Bạn có chắc muốn xóa tài khoản "${user.user_name}"? Hành động này không thể hoàn tác.`,
        onConfirm: async () => {
            setLoading(true); 
            try {
                await axios.delete(`${API_URL}/users/${user.user_id}`, { headers: getAuthHeaders() });
                showToast("Đã xóa người dùng thành công!");
                fetchUsers();
            } catch (error) {
                console.error("Delete Error:", error);
                const msg = error.response?.data?.message || "Lỗi khi xóa!";
                showToast(msg, "error");
            } finally {
                setLoading(false);
                setConfirmModal(null);
            }
        }
    });
  };

  // ==================================================================================
  // 4. RENDER
  // ==================================================================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const goToPage = (page) => setCurrentPage(page);
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";

  // 👉 4.1 VIEW GUARD: Nếu không có quyền VIEW, chặn hiển thị toàn bộ trang
  if (!permissions.is_view) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                  <p className="text-gray-500">
                      Tài khoản của bạn không có quyền xem danh sách người dùng. Vui lòng liên hệ quản trị viên.
                  </p>
              </div>
          </div>
      );
  }

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
                    <button onClick={confirmModal.onConfirm} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Xóa ngay
                    </button>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên * <span className="text-xs text-gray-400 font-normal">(Max 25)</span></label>
                            <input type="text" name="user_code" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all shadow-sm ${formErrors.user_code ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                                value={formData.user_code} onChange={handleInputChange} disabled={isEditing} placeholder="NV001" 
                            />
                            {formErrors.user_code && <p className="text-red-500 text-xs mt-1">{formErrors.user_code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                            <input type="text" name="user_name" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all shadow-sm ${formErrors.user_name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                                value={formData.user_name} onChange={handleInputChange} placeholder="Nguyễn Văn A" 
                            />
                            {formErrors.user_name && <p className="text-red-500 text-xs mt-1">{formErrors.user_name}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" name="user_email" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all shadow-sm ${formErrors.user_email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                            value={formData.user_email} onChange={handleInputChange} placeholder="email@example.com" 
                        />
                        {formErrors.user_email && <p className="text-red-500 text-xs mt-1">{formErrors.user_email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{isEditing ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu *"}</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all shadow-sm pr-10 ${formErrors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                                value={formData.password} onChange={handleInputChange} placeholder="••••••" 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                            <select name="role_id" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                                value={formData.role_id} onChange={handleInputChange}
                            >
                                <option value="">-- Chọn vai trò --</option>
                                {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select name="user_is_activated" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                                value={formData.user_is_activated} onChange={handleInputChange}
                            >
                                <option value={1}>Hoạt động</option>
                                <option value={0}>Vô hiệu hóa</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Hủy</button>
                        <button type="submit" disabled={loading || Object.values(formErrors).some(err => err !== "")} className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 shadow-sm transition-colors ${loading || Object.values(formErrors).some(err => err !== "") ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
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
            
            {/* 👉 4.2 ẨN NÚT THÊM NẾU KHÔNG CÓ QUYỀN ADD */}
            {permissions.is_add && (
                <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                    <Plus className="w-5 h-5"/> Thêm mới
                </button>
            )}
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Tìm kiếm theo tên, email hoặc mã nhân viên..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="text-sm text-gray-500">Hiển thị <b>{currentItems.length}</b> / <b>{filteredUsers.length}</b> kết quả</div>
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
                        {loading && !editLoadingId ? (
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
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleStyle(user.role_name || "Student")}`}>
                                            <Shield className="w-3 h-3"/> {user.role_name || "Student"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${user.user_is_activated ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {user.user_is_activated ? "Hoạt động" : "Vô hiệu hóa"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            
                                            {/* 👉 4.3 ẨN NÚT SỬA NẾU KHÔNG CÓ QUYỀN EDIT */}
                                            {permissions.is_edit && (
                                                <button 
                                                    onClick={() => handleEditClick(user)} 
                                                    disabled={editLoadingId === user.user_id}
                                                    className={`p-2 rounded-lg transition-all ${editLoadingId === user.user_id ? "text-blue-400 cursor-not-allowed" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`} 
                                                    title="Chỉnh sửa"
                                                >
                                                    {editLoadingId === user.user_id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Edit className="w-4 h-4"/>}
                                                </button>
                                            )}

                                            {/* 👉 4.4 ẨN NÚT XÓA NẾU KHÔNG CÓ QUYỀN DELETE */}
                                            {permissions.is_delete && (
                                                <button onClick={() => handleDelete(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            )}

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