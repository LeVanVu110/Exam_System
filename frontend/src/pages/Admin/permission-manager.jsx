import React, { useState, useEffect } from "react";
import { 
  Save, Check, Shield, Search, Layout, Loader2, Plus, X, Users
} from "lucide-react";

const API_URL = "http://localhost:8000/api"; 

export default function PermissionApp() {
  // --- STATE DỮ LIỆU ---
  const [roles, setRoles] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [matrix, setMatrix] = useState({});
  
  // --- STATE UI & USER ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 👉 1. State lưu Role của người đang đăng nhập
  const [currentUserRole, setCurrentUserRole] = useState("");

  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newScreenName, setNewScreenName] = useState("");
  const [newScreenCode, setNewScreenCode] = useState("");

  // ==================================================================================
  // 1. KHỞI TẠO: Tải data & Lấy Role từ LocalStorage
  // ==================================================================================
  useEffect(() => {
    // Lấy Role thật từ localStorage
    const storedRole = localStorage.getItem("USER_ROLE") || "";
    setCurrentUserRole(storedRole);

    const fetchInitialData = async () => {
      try {
        const [roleRes, screenRes] = await Promise.all([
          fetch(`${API_URL}/roles`),
          fetch(`${API_URL}/screens`)
        ]);

        if (!roleRes.ok || !screenRes.ok) throw new Error("Lỗi kết nối API");

        const roleData = await roleRes.json();
        const screenData = await screenRes.json();

        setRoles(roleData);
        setScreens(screenData);

        if (roleData.length > 0) {
          setSelectedRoleId(roleData[0].role_id);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
        alert("Không thể tải dữ liệu.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ==================================================================================
  // 2. LOGIC KIỂM TRA QUYỀN
  // ==================================================================================
  
  const normalizeRole = (roleName) => {
    if (!roleName) return "";
    const lower = roleName.toLowerCase().trim();
    if (["admin", "administrator", "1"].includes(lower)) return "ADMIN";
    if (["academic affairs office", "pdt", "4"].includes(lower)) return "PDT";
    return lower.toUpperCase();
  };

  const isEditable = () => {
    if (!selectedRoleId || roles.length === 0) return false;
    const targetRoleObj = roles.find(r => r.role_id === selectedRoleId);
    if (!targetRoleObj) return false;

    const myRole = normalizeRole(currentUserRole);
    const targetRoleName = normalizeRole(targetRoleObj.role_name);

    if (myRole === "ADMIN") return true;
    if (myRole === "PDT") {
        if (targetRoleName === "ADMIN") return false;
        return true; 
    }
    return false;
  };

  const canEdit = isEditable();

  // ==================================================================================
  // 🆕 HÀM REFRESH QUYỀN CỦA CHÍNH MÌNH (KEY FUNCTION)
  // ==================================================================================
  const refreshMyPermissions = async () => {
    try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) return;

        // Gọi API lấy quyền mới nhất từ Backend
        const res = await fetch(`${API_URL}/my-permissions`, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok && res.status !== 204) {
            const newPermissions = await res.json();
            
            // 1. Cập nhật LocalStorage
            localStorage.setItem("user_permissions", JSON.stringify(newPermissions));
            console.log("🔄 Đã tự động cập nhật quyền mới:", newPermissions);

            // 2. 🔥 PHÁT SỰ KIỆN ĐỂ CÁC COMPONENT KHÁC (SIDEBAR) BIẾT
            // Tạo một Custom Event tên là 'permissions_updated'
            const event = new Event('permissions_updated');
            window.dispatchEvent(event);
            
            // Nếu bạn dùng Context API, đây là lúc gọi hàm updateContext
        }
    } catch (error) {
        console.error("Lỗi khi refresh quyền:", error);
    }
  };

  // ==================================================================================
  // 3. XỬ LÝ API VÀ SAVE
  // ==================================================================================
  useEffect(() => {
    if (!selectedRoleId || screens.length === 0) return;
    const fetchMatrix = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/roles/${selectedRoleId}/screens`);
        const savedPermissions = await res.json(); 

        const newMatrix = {};
        screens.forEach(screen => {
          const saved = savedPermissions.find(p => p.screen_id === screen.screen_id);
          if (saved) {
            const isAll = saved.is_view === 1 && saved.is_add === 1 && saved.is_edit === 1 && saved.is_delete === 1 && saved.is_upload === 1 && saved.is_download === 1;
            newMatrix[screen.screen_id] = {
              screen_id: screen.screen_id,
              is_view: saved.is_view === 1, is_add: saved.is_add === 1, is_edit: saved.is_edit === 1,
              is_delete: saved.is_delete === 1, is_upload: saved.is_upload === 1, is_download: saved.is_download === 1,
              is_all: isAll
            };
          } else {
            newMatrix[screen.screen_id] = {
              screen_id: screen.screen_id,
              is_view: false, is_add: false, is_edit: false, is_delete: false, is_upload: false, is_download: false, is_all: false
            };
          }
        });
        setMatrix(newMatrix);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchMatrix();
  }, [selectedRoleId, screens]);

  const handleCheckboxChange = (screenId, field) => {
    if (!canEdit) return; 
    setMatrix((prev) => {
      const currentRow = { ...prev[screenId] };
      const newValue = !currentRow[field];
      if (field === "is_all") {
        return { ...prev, [screenId]: { ...currentRow, is_view: newValue, is_add: newValue, is_edit: newValue, is_delete: newValue, is_upload: newValue, is_download: newValue, is_all: newValue } };
      }
      currentRow[field] = newValue;
      if (!newValue) currentRow.is_all = false;
      else {
        const allChecked = currentRow.is_view && currentRow.is_add && currentRow.is_edit && currentRow.is_delete && currentRow.is_upload && currentRow.is_download;
        if (allChecked) currentRow.is_all = true;
      }
      return { ...prev, [screenId]: currentRow };
    });
  };

  const handleSave = async () => {
    if (!canEdit) return;

    setSaving(true);
    try {
      const payload = Object.values(matrix).map(row => ({
        screen_id: row.screen_id,
        is_view: row.is_view ? 1 : 0, is_add: row.is_add ? 1 : 0, is_edit: row.is_edit ? 1 : 0,
        is_delete: row.is_delete ? 1 : 0, is_upload: row.is_upload ? 1 : 0, is_download: row.is_download ? 1 : 0, is_all: row.is_all ? 1 : 0 
      }));
      
      // 1. Lưu xuống DB
      const response = await fetch(`${API_URL}/roles/${selectedRoleId}/update-matrix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: payload })
      });
      
      if (!response.ok) throw new Error("Lỗi Server");

      // 👉 2. LOGIC TỰ ĐỘNG CẬP NHẬT QUYỀN (Realtime Update)
      // Kiểm tra: Nếu Role đang sửa CHÍNH LÀ Role của user hiện tại
      const targetRoleObj = roles.find(r => r.role_id === selectedRoleId);
      if (targetRoleObj && normalizeRole(targetRoleObj.role_name) === normalizeRole(currentUserRole)) {
          // Gọi hàm refresh quyền
          await refreshMyPermissions();
          alert("✅ Cập nhật thành công! Các quyền hạn mới đã được áp dụng ngay lập tức.");
      } else {
          alert("✅ Cập nhật quyền cho vai trò thành công!");
      }

    } catch (error) { 
        console.error(error);
        alert("❌ Lỗi khi lưu!"); 
    } finally { 
        setSaving(false); 
    }
  };

  // --- RENDER (Không thay đổi nhiều) ---
  const filteredScreens = screens.filter(s => s.screen_name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.screen_code && s.screen_code.toLowerCase().includes(searchTerm.toLowerCase())));

  if (initialLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-6 pb-2">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 h-[calc(100vh-8rem)] max-w-7xl mx-auto w-full">
            
            {/* CỘT TRÁI: DANH SÁCH ROLE */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-1 flex flex-col h-full overflow-hidden">
                <div className="border-b border-blue-100 p-4 bg-blue-50/50 flex justify-between items-center">
                <h2 className="flex items-center gap-2 font-semibold text-blue-900">
                    <Users className="h-5 w-5 text-blue-600" /> Vai trò
                </h2>
                {normalizeRole(currentUserRole) === "ADMIN" && (
                    <button onClick={() => setShowAddRole(true)} className="p-1 hover:bg-white rounded-full text-blue-600"><Plus className="w-5 h-5" /></button>
                )}
                </div>

                <div className="p-2 overflow-y-auto flex-1 space-y-1">
                {roles.map((role) => (
                    <button
                    key={role.role_id}
                    onClick={() => setSelectedRoleId(role.role_id)}
                    className={`w-full text-left rounded-lg p-3 text-sm transition-all ${
                        selectedRoleId === role.role_id ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    >
                    <div className="font-medium">{role.role_name}</div>
                    </button>
                ))}
                </div>
            </div>

            {/* CỘT PHẢI: BẢNG MATRIX */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-3 overflow-hidden flex flex-col h-full">
                <div className="flex flex-col border-b border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-600" />
                    <h2 className="font-semibold text-blue-900">
                    Quyền hạn: <span className="text-blue-600">{roles.find((r) => r.role_id === selectedRoleId)?.role_name}</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Tìm màn hình..." className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {/* NÚT LƯU */}
                    <button
                    onClick={handleSave}
                    disabled={saving || !selectedRoleId || !canEdit}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm ${
                        saving || !canEdit 
                        ? "bg-gray-400 cursor-not-allowed opacity-70" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu
                    </button>
                </div>
                </div>
                
                {!canEdit && selectedRoleId && (
                    <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center gap-2 text-sm text-orange-800">
                        <Shield className="w-4 h-4" />
                        Bạn đang là <b>{currentUserRole}</b>. Bạn không có quyền chỉnh sửa vai trò này.
                    </div>
                )}

                <div className="overflow-auto flex-1 bg-white relative">
                {!loading && (
                    <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 shadow-sm">
                        <tr>
                        <th className="px-6 py-4 font-medium min-w-[200px]">Màn hình chức năng</th>
                        {["Xem", "Thêm", "Sửa", "Xóa", "Upload", "Download"].map(h => <th key={h} className="px-2 py-4 text-center font-medium w-20">{h}</th>)}
                        <th className="px-2 py-4 text-center font-medium w-20 bg-blue-50/50 text-blue-700">Tất cả</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredScreens.map((screen) => {
                        const data = matrix[screen.screen_id] || {};
                        return (
                            <tr key={screen.screen_id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900 group-hover:text-blue-700">{screen.screen_name}</div>
                                <div className="text-xs text-gray-400 font-mono">{screen.screen_code}</div>
                            </td>
                            {["is_view", "is_add", "is_edit", "is_delete", "is_upload", "is_download"].map(field => (
                                <CheckboxCell 
                                    key={field} 
                                    checked={data[field]} 
                                    onChange={() => handleCheckboxChange(screen.screen_id, field)} 
                                    disabled={!canEdit}
                                />
                            ))}
                            <td className="px-2 py-4 text-center bg-blue-50/20">
                                <div className="flex justify-center">
                                <label className={`relative flex items-center justify-center p-2 ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                    <input type="checkbox" className="peer sr-only" checked={!!data.is_all} onChange={() => handleCheckboxChange(screen.screen_id, "is_all")} disabled={!canEdit} />
                                    <div className={`h-5 w-5 rounded border transition-all ${data.is_all ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white hover:border-blue-400"}`}>
                                    {data.is_all && <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                    </div>
                                </label>
                                </div>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>
                )}
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function CheckboxCell({ checked, onChange, disabled }) {
  return (
    <td className="px-2 py-4 text-center">
      <div className="flex justify-center">
        <label className={`relative flex items-center justify-center p-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          <input type="checkbox" className="peer sr-only" checked={!!checked} onChange={onChange} disabled={disabled} />
          <div className={`h-5 w-5 rounded border transition-all ${checked ? (disabled ? "bg-gray-400 border-gray-400" : "bg-blue-500 border-blue-500") : "border-gray-300 bg-white"} ${!disabled && "hover:border-blue-400"}`}>
            {checked && <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
          </div>
        </label>
      </div>
    </td>
  );
}