import React, { useState, useEffect } from "react";
import { 
  Save, Check, Shield, Search, Layout, Loader2, Plus, X, Users
} from "lucide-react";

// ⚠️ QUAN TRỌNG: Đổi URL này nếu backend của bạn chạy ở port khác
// Mặc định Laravel serve chạy ở port 8000
const API_URL = "http://localhost:8000/api"; 

export default function PermissionApp() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  // Đổi permissions -> roles để đúng nghiệp vụ
  const [roles, setRoles] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  const [matrix, setMatrix] = useState({}); // Dữ liệu hiển thị trên bảng
  
  // --- STATE UI & LOADING ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddScreen, setShowAddScreen] = useState(false);

  // --- STATE FORM ---
  const [newRoleName, setNewRoleName] = useState("");
  const [newScreenName, setNewScreenName] = useState("");
  const [newScreenCode, setNewScreenCode] = useState("");

  // ==================================================================================
  // 1. KHỞI TẠO: Tải danh sách Vai trò (Roles) & Màn hình khi vào trang
  // ==================================================================================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Gọi song song 2 API: Lấy Roles và Screens
        const [roleRes, screenRes] = await Promise.all([
          fetch(`${API_URL}/roles`),   // Đổi từ /permissions sang /roles
          fetch(`${API_URL}/screens`)
        ]);

        if (!roleRes.ok || !screenRes.ok) throw new Error("Lỗi kết nối API");

        const roleData = await roleRes.json();
        const screenData = await screenRes.json();

        setRoles(roleData);
        setScreens(screenData);

        // Mặc định chọn vai trò đầu tiên nếu danh sách không rỗng
        if (roleData.length > 0) {
          setSelectedRoleId(roleData[0].role_id);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
        alert("Không thể tải dữ liệu. Hãy kiểm tra Backend (php artisan serve).");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ==================================================================================
  // 2. LOAD MATRIX: Khi người dùng chọn một Vai trò khác
  // ==================================================================================
  useEffect(() => {
    if (!selectedRoleId || screens.length === 0) return;

    const fetchMatrix = async () => {
      setLoading(true);
      try {
        // Gọi API lấy ma trận quyền của Role này
        // Backend cần route: GET /api/roles/{id}/screens
        const res = await fetch(`${API_URL}/roles/${selectedRoleId}/screens`);
        const savedPermissions = await res.json(); 

        // TRỘN DỮ LIỆU: Danh sách Màn hình gốc + Quyền đã lưu từ DB
        const newMatrix = {};
        
        screens.forEach(screen => {
          // Tìm xem màn hình này đã được cấu hình cho Role này chưa
          const saved = savedPermissions.find(p => p.screen_id === screen.screen_id);

          if (saved) {
            // Có rồi -> Convert 1/0 từ DB sang true/false cho React
            const isAll = 
              saved.is_view === 1 && saved.is_add === 1 && saved.is_edit === 1 &&
              saved.is_delete === 1 && saved.is_upload === 1 && saved.is_download === 1;

            newMatrix[screen.screen_id] = {
              screen_id: screen.screen_id,
              is_view: saved.is_view === 1,
              is_add: saved.is_add === 1,
              is_edit: saved.is_edit === 1,
              is_delete: saved.is_delete === 1,
              is_upload: saved.is_upload === 1,
              is_download: saved.is_download === 1,
              is_all: isAll
            };
          } else {
            // Chưa có trong DB -> Mặc định là false hết
            newMatrix[screen.screen_id] = {
              screen_id: screen.screen_id,
              is_view: false, is_add: false, is_edit: false, 
              is_delete: false, is_upload: false, is_download: false, is_all: false
            };
          }
        });

        setMatrix(newMatrix);
      } catch (error) {
        console.error("Lỗi tải matrix:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();
  }, [selectedRoleId, screens]);

  // ==================================================================================
  // 3. XỬ LÝ LOGIC CHECKBOX (Client Side) - Giữ nguyên logic
  // ==================================================================================
  const handleCheckboxChange = (screenId, field) => {
    setMatrix((prev) => {
      const currentRow = { ...prev[screenId] };
      const newValue = !currentRow[field];

      if (field === "is_all") {
        return {
          ...prev,
          [screenId]: {
            ...currentRow,
            is_view: newValue, is_add: newValue, is_edit: newValue,
            is_delete: newValue, is_upload: newValue, is_download: newValue,
            is_all: newValue,
          },
        };
      }

      currentRow[field] = newValue;

      if (!newValue) {
        currentRow.is_all = false;
      } else {
        const allChecked =
          currentRow.is_view && currentRow.is_add && currentRow.is_edit &&
          currentRow.is_delete && currentRow.is_upload && currentRow.is_download;
        if (allChecked) currentRow.is_all = true;
      }

      return { ...prev, [screenId]: currentRow };
    });
  };

  // ==================================================================================
  // 4. LƯU DỮ LIỆU (Gọi API Update Matrix cho Role)
  // ==================================================================================
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Chuẩn bị dữ liệu: Convert true/false về 1/0
      const payload = Object.values(matrix).map(row => ({
        screen_id: row.screen_id,
        is_view: row.is_view ? 1 : 0,
        is_add: row.is_add ? 1 : 0,
        is_edit: row.is_edit ? 1 : 0,
        is_delete: row.is_delete ? 1 : 0,
        is_upload: row.is_upload ? 1 : 0,
        is_download: row.is_download ? 1 : 0,
        is_all: row.is_all ? 1 : 0 
      }));

      // 2. Gửi lên Server: POST /api/roles/{id}/update-matrix
      const response = await fetch(`${API_URL}/roles/${selectedRoleId}/update-matrix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: payload }) // Backend nhận key 'permissions' chứa mảng
      });

      if (!response.ok) throw new Error("Lỗi Server");

      alert("✅ Cập nhật quyền cho Vai trò thành công!");
    } catch (error) {
      console.error("Lỗi save:", error);
      alert("❌ Lỗi khi lưu dữ liệu!");
    } finally {
      setSaving(false);
    }
  };

  // ==================================================================================
  // 5. THÊM VAI TRÒ MỚI (ROLE)
  // ==================================================================================
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role_name: newRoleName,
          role_description: "Tạo từ giao diện Admin"
        })
      });
      
      if (response.ok) {
        const newRole = await response.json();
        setRoles([...roles, newRole]);
        setSelectedRoleId(newRole.role_id); // Chuyển ngay sang role mới
        setNewRoleName("");
        setShowAddRole(false);
      }
    } catch (error) {
      alert("Lỗi khi tạo vai trò");
    }
  };

  // ==================================================================================
  // 6. THÊM MÀN HÌNH MỚI
  // ==================================================================================
  const handleAddScreen = async () => {
    if (!newScreenName.trim() || !newScreenCode.trim()) return;
    try {
      const response = await fetch(`${API_URL}/screens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          screen_name: newScreenName, 
          screen_code: newScreenCode 
        })
      });

      if (response.ok) {
        const newScreen = await response.json();
        setScreens([...screens, newScreen]);
        
        setMatrix(prev => ({
            ...prev,
            [newScreen.screen_id]: {
                screen_id: newScreen.screen_id,
                is_view: false, is_add: false, is_edit: false, 
                is_delete: false, is_upload: false, is_download: false, is_all: false
            }
        }));

        setNewScreenName("");
        setNewScreenCode("");
        setShowAddScreen(false);
      }
    } catch (error) {
      alert("Lỗi khi tạo màn hình");
    }
  };

  // Lọc màn hình
  const filteredScreens = screens.filter(
    (s) =>
      s.screen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.screen_code && s.screen_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- RENDER GIAO DIỆN ---
  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Content */}
        <div className="p-6 pb-2">
            {/* <div className="mb-4 text-center">
                <h1 className="text-2xl font-bold text-blue-900">Hệ Thống Phân Quyền</h1>
                <p className="text-blue-600 text-sm">Quản lý quyền truy cập chi tiết cho từng Vai trò (Role)</p>
            </div> */}
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 h-[calc(100vh-8rem)] max-w-7xl mx-auto w-full">
            
            {/* CỘT TRÁI: DANH SÁCH VAI TRÒ (ROLES) */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-1 flex flex-col h-full overflow-hidden">
                <div className="border-b border-blue-100 p-4 bg-blue-50/50 flex justify-between items-center">
                <h2 className="flex items-center gap-2 font-semibold text-blue-900">
                    <Users className="h-5 w-5 text-blue-600" />
                    Danh sách Vai trò
                </h2>
                <button
                    onClick={() => setShowAddRole(true)}
                    className="p-1 hover:bg-white rounded-full text-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
                </div>

                {/* Form thêm role (ẩn/hiện) */}
                {showAddRole && (
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                    <input
                    autoFocus
                    type="text"
                    placeholder="Tên vai trò (VD: Admin)..."
                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                    />
                    <div className="flex gap-2">
                    <button onClick={handleAddRole} className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700">Lưu</button>
                    <button onClick={() => setShowAddRole(false)} className="flex-1 bg-white border border-gray-300 text-xs py-1.5 rounded">Hủy</button>
                    </div>
                </div>
                )}

                {/* Danh sách roles */}
                <div className="p-2 overflow-y-auto flex-1 space-y-1">
                {roles.map((role) => (
                    <button
                    key={role.role_id}
                    onClick={() => setSelectedRoleId(role.role_id)}
                    className={`w-full text-left rounded-lg p-3 text-sm transition-all ${
                        selectedRoleId === role.role_id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    >
                    <div className="font-medium">{role.role_name}</div>
                    <div className={`text-xs mt-0.5 ${selectedRoleId === role.role_id ? "text-blue-100" : "text-gray-400"}`}>
                        {role.role_description || "..."}
                    </div>
                    </button>
                ))}
                </div>
            </div>

            {/* CỘT PHẢI: BẢNG MATRIX PHÂN QUYỀN */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-3 overflow-hidden flex flex-col h-full">
                <div className="flex flex-col border-b border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-600" />
                    <h2 className="font-semibold text-blue-900">
                    Phân Quyền: <span className="text-blue-600">
                        {roles.find((r) => r.role_id === selectedRoleId)?.role_name}
                    </span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowAddScreen(true)} className="hidden sm:flex items-center gap-1 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium">
                        <Plus className="w-4 h-4" /> Thêm Màn Hình
                    </button>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm màn hình..."
                            className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                    onClick={handleSave}
                    disabled={saving || !selectedRoleId}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                    >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu
                    </button>
                </div>
                </div>

                {/* Bảng dữ liệu */}
                <div className="overflow-auto flex-1 bg-white relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 shadow-sm">
                        <tr>
                        <th className="px-6 py-4 font-medium min-w-[200px]">Màn hình chức năng</th>
                        {["Xem", "Thêm", "Sửa", "Xóa", "Upload", "Download"].map(h => (
                            <th key={h} className="px-2 py-4 text-center font-medium w-20">{h}</th>
                        ))}
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
                                <CheckboxCell key={field} checked={data[field]} onChange={() => handleCheckboxChange(screen.screen_id, field)} />
                            ))}
                            <td className="px-2 py-4 text-center bg-blue-50/20">
                                <div className="flex justify-center">
                                <label className="relative flex cursor-pointer items-center justify-center p-2">
                                    <input type="checkbox" className="peer sr-only" checked={!!data.is_all} onChange={() => handleCheckboxChange(screen.screen_id, "is_all")} />
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
                {!loading && filteredScreens.length === 0 && (
                    <div className="py-12 text-center text-gray-400">Không tìm thấy màn hình nào.</div>
                )}
                </div>
            </div>
            </div>
        </div>
      </div>

      {/* Modal Thêm Màn Hình */}
      {showAddScreen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Thêm Màn Hình Mới</h3>
              <button onClick={() => setShowAddScreen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên màn hình</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ví dụ: Quản lý kho" value={newScreenName} onChange={(e) => setNewScreenName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã màn hình (Code)</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="Ví dụ: WH_MGT" value={newScreenCode} onChange={(e) => setNewScreenCode(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowAddScreen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Hủy bỏ</button>
              <button onClick={handleAddScreen} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200">Thêm mới</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component ô checkbox nhỏ
function CheckboxCell({ checked, onChange }) {
  return (
    <td className="px-2 py-4 text-center">
      <div className="flex justify-center">
        <label className="relative flex cursor-pointer items-center justify-center p-2">
          <input type="checkbox" className="peer sr-only" checked={!!checked} onChange={onChange} />
          <div className={`h-5 w-5 rounded border transition-all ${checked ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white hover:border-blue-400"}`}>
            {checked && <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
          </div>
        </label>
      </div>
    </td>
  );
}