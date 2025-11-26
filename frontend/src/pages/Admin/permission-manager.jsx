import React, { useState, useEffect } from "react";
import { 
  Save, Check, Shield, Search, Layout, Loader2, Plus, X
} from "lucide-react";

// --- 1. MOCK DATA (Dữ liệu mẫu ban đầu) ---
const MOCK_SCREENS = [
  { screen_id: 1, screen_name: "Quản lý Người dùng", screen_code: "USER_MGT" },
  { screen_id: 2, screen_name: "Quản lý Sản phẩm", screen_code: "PROD_MGT" },
  { screen_id: 3, screen_name: "Báo cáo Doanh thu", screen_code: "RPT_REV" },
  { screen_id: 4, screen_name: "Cài đặt Hệ thống", screen_code: "SYS_SET" },
  { screen_id: 5, screen_name: "Quản lý Đơn hàng", screen_code: "ORD_MGT" },
];

const MOCK_PERMISSIONS = [
  { permission_id: 1, permission_name: "Quản trị viên (Admin)", permission_description: "Toàn quyền hệ thống" },
  { permission_id: 2, permission_name: "Nhân viên Bán hàng", permission_description: "Quản lý đơn hàng & sản phẩm" },
  { permission_id: 3, permission_name: "Kế toán", permission_description: "Xem báo cáo & tài chính" },
  { permission_id: 4, permission_name: "Kho", permission_description: "Quản lý nhập xuất tồn" },
];

// Hàm tạo quyền mặc định (tất cả false)
const createDefaultMatrix = (screens) => {
  const matrix = {};
  screens.forEach(s => {
    matrix[s.screen_id] = {
      screen_id: s.screen_id,
      is_view: false, is_add: false, is_edit: false, 
      is_delete: false, is_upload: false, is_download: false, is_all: false
    };
  });
  return matrix;
};

// --- 2. MAIN LOGIC COMPONENT ---
export default function PermissionApp() {
  const [selectedPermissionId, setSelectedPermissionId] = useState(MOCK_PERMISSIONS[0].permission_id);
  const [matrix, setMatrix] = useState({}); // Dữ liệu hiển thị trên bảng
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [permissions, setPermissions] = useState(MOCK_PERMISSIONS);
  const [screens, setScreens] = useState(MOCK_SCREENS);

  const [showAddPermission, setShowAddPermission] = useState(false);
  const [showAddScreen, setShowAddScreen] = useState(false);

  // Form states
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newScreenName, setNewScreenName] = useState("");
  const [newScreenCode, setNewScreenCode] = useState("");

  // --- DATABASE GIẢ LẬP (Load/Save LocalStorage) ---
  
  // Load dữ liệu khi đổi Nhóm quyền
  useEffect(() => {
    setLoading(true);
    // Giả lập độ trễ mạng
    const timer = setTimeout(() => {
      // 1. Thử lấy từ LocalStorage (Giả lập DB)
      const storedData = localStorage.getItem(`perm_matrix_${selectedPermissionId}`);
      
      if (storedData) {
        setMatrix(JSON.parse(storedData));
      } else {
        // 2. Nếu chưa có, tạo dữ liệu mẫu
        const initialMatrix = createDefaultMatrix(screens);
        // Nếu là Admin (id=1), tick full quyền demo
        if (selectedPermissionId === 1) {
             Object.keys(initialMatrix).forEach(key => {
                 const row = initialMatrix[key];
                 ['is_view', 'is_add', 'is_edit', 'is_delete', 'is_upload', 'is_download', 'is_all'].forEach(k => row[k] = true);
             });
        }
        setMatrix(initialMatrix);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedPermissionId, screens]); // Thêm screens vào dep để khi thêm màn hình mới nó cập nhật matrix

  // Xử lý tick checkbox
  const handleCheckboxChange = (screenId, field) => {
    setMatrix((prev) => {
      const currentRow = { ...prev[screenId] };
      const newValue = !currentRow[field];

      // Nếu tick "Tất cả"
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

      // Nếu tick từng cái lẻ
      currentRow[field] = newValue;

      // Logic kiểm tra nút "Tất cả"
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

  // Lưu dữ liệu
  const handleSave = async () => {
    setSaving(true);
    // Giả lập gọi API
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Lưu vào LocalStorage
    localStorage.setItem(`perm_matrix_${selectedPermissionId}`, JSON.stringify(matrix));
    
    setSaving(false);
    // Thay vì alert, có thể dùng Toast (nhưng dùng alert cho đơn giản code)
    alert(`Đã lưu phân quyền cho nhóm: ${permissions.find(p => p.permission_id === selectedPermissionId)?.permission_name}`);
  };

  // Thêm nhóm quyền mới
  const handleAddPermission = () => {
    if (!newPermissionName.trim()) return;
    const newId = Math.max(...permissions.map(p => p.permission_id)) + 1;
    const newPerm = { 
        permission_id: newId, 
        permission_name: newPermissionName, 
        permission_description: "Nhóm quyền mới tạo" 
    };
    setPermissions([...permissions, newPerm]);
    setSelectedPermissionId(newId); // Chuyển sang nhóm mới tạo
    setNewPermissionName("");
    setShowAddPermission(false);
  };

  // Thêm màn hình mới
  const handleAddScreen = () => {
    if (!newScreenName.trim() || !newScreenCode.trim()) return;
    const newId = Math.max(...screens.map(s => s.screen_id)) + 1;
    const newScreen = { screen_id: newId, screen_name: newScreenName, screen_code: newScreenCode };
    
    // Cập nhật danh sách màn hình
    const updatedScreens = [...screens, newScreen];
    setScreens(updatedScreens);

    // Cập nhật matrix hiện tại để có dòng mới
    setMatrix(prev => ({
        ...prev,
        [newId]: {
            screen_id: newId,
            is_view: false, is_add: false, is_edit: false, 
            is_delete: false, is_upload: false, is_download: false, is_all: false
        }
    }));

    setNewScreenName("");
    setNewScreenCode("");
    setShowAddScreen(false);
  };

  const filteredScreens = screens.filter(
    (s) =>
      s.screen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.screen_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col h-screen overflow-hidden">
      {/* 2. Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Content */}
        <div className="p-6 pb-2">
            <div className="mb-4 text-center">
                <h1 className="text-2xl font-bold text-blue-900">Hệ Thống Phân Quyền</h1>
                <p className="text-blue-600 text-sm">Quản lý quyền truy cập chi tiết cho từng vai trò</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 h-[calc(100vh-8rem)] max-w-7xl mx-auto w-full">
            
            {/* Cột trái: Danh sách nhóm quyền */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-1 flex flex-col h-full overflow-hidden">
                <div className="border-b border-blue-100 p-4 bg-blue-50/50 flex justify-between items-center">
                <h2 className="flex items-center gap-2 font-semibold text-blue-900">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Nhóm Quyền
                </h2>
                <button
                    onClick={() => setShowAddPermission(true)}
                    className="p-1 hover:bg-white rounded-full text-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
                </div>

                {showAddPermission && (
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                    <input
                    autoFocus
                    type="text"
                    placeholder="Tên nhóm quyền..."
                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPermissionName}
                    onChange={(e) => setNewPermissionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPermission()}
                    />
                    <div className="flex gap-2">
                    <button onClick={handleAddPermission} className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700">Lưu</button>
                    <button onClick={() => setShowAddPermission(false)} className="flex-1 bg-white border border-gray-300 text-xs py-1.5 rounded">Hủy</button>
                    </div>
                </div>
                )}

                <div className="p-2 overflow-y-auto flex-1 space-y-1">
                {permissions.map((perm) => (
                    <button
                    key={perm.permission_id}
                    onClick={() => setSelectedPermissionId(perm.permission_id)}
                    className={`w-full text-left rounded-lg p-3 text-sm transition-all ${
                        selectedPermissionId === perm.permission_id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    >
                    <div className="font-medium">{perm.permission_name}</div>
                    <div className={`text-xs mt-0.5 ${selectedPermissionId === perm.permission_id ? "text-blue-100" : "text-gray-400"}`}>
                        {perm.permission_description}
                    </div>
                    </button>
                ))}
                </div>
            </div>

            {/* Cột phải: Bảng phân quyền */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-3 overflow-hidden flex flex-col h-full">
                <div className="flex flex-col border-b border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-600" />
                    <h2 className="font-semibold text-blue-900">
                    Phân Quyền: <span className="text-blue-600">{permissions.find((p) => p.permission_id === selectedPermissionId)?.permission_name}</span>
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
                    disabled={saving}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                    >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu
                    </button>
                </div>
                </div>

                {/* Table Content */}
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