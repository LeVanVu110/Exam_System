"use client"

import { useState, useEffect } from "react"
import { Save, Check, Shield, Search, Layout, Loader2, Plus, X } from "lucide-react"

// --- Mock Data (Simulating API response) ---
const MOCK_SCREENS = [
  { screen_id: 1, screen_name: "Quản lý Người dùng", screen_code: "USER_MGT", category_screen_type_id: 1 },
  { screen_id: 2, screen_name: "Quản lý Sản phẩm", screen_code: "PROD_MGT", category_screen_type_id: 1 },
  { screen_id: 3, screen_name: "Báo cáo Doanh thu", screen_code: "RPT_REV", category_screen_type_id: 2 },
  { screen_id: 4, screen_name: "Cài đặt Hệ thống", screen_code: "SYS_SET", category_screen_type_id: 3 },
  { screen_id: 5, screen_name: "Quản lý Đơn hàng", screen_code: "ORD_MGT", category_screen_type_id: 1 },
]

const MOCK_PERMISSIONS = [
  { permission_id: 1, permission_name: "Quản trị viên (Admin)", permission_description: "Full access" },
  { permission_id: 2, permission_name: "Nhân viên Bán hàng", permission_description: "Sales staff" },
  { permission_id: 3, permission_name: "Kế toán", permission_description: "Accounting staff" },
  { permission_id: 4, permission_name: "Kho", permission_description: "Warehouse staff" },
]

export default function PermissionManager() {
  const [selectedPermissionId, setSelectedPermissionId] = useState(MOCK_PERMISSIONS[0].permission_id)
  const [matrix, setMatrix] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [permissions, setPermissions] = useState(MOCK_PERMISSIONS)
  const [screens, setScreens] = useState(MOCK_SCREENS)

  const [showAddPermission, setShowAddPermission] = useState(false)
  const [showAddScreen, setShowAddScreen] = useState(false)

  const [newPermissionName, setNewPermissionName] = useState("")
  const [newScreenName, setNewScreenName] = useState("")
  const [newScreenCode, setNewScreenCode] = useState("")

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const newMatrix = {}

      screens.forEach((screen) => {
        const isAll = selectedPermissionId === 1 // Admin gets all by default
        newMatrix[screen.screen_id] = {
          screen_id: screen.screen_id,
          is_view: isAll || Math.random() > 0.5,
          is_add: isAll || Math.random() > 0.7,
          is_edit: isAll || Math.random() > 0.7,
          is_delete: isAll || Math.random() > 0.9,
          is_upload: isAll || Math.random() > 0.6,
          is_download: isAll || Math.random() > 0.5,
          is_all: isAll,
        }
      })
      setMatrix(newMatrix)
      setLoading(false)
    }, 600)
  }, [selectedPermissionId, screens])

  const handleCheckboxChange = (screenId, field) => {
    setMatrix((prev) => {
      const currentRow = { ...prev[screenId] }
      const newValue = !currentRow[field]

      if (field === "is_all") {
        return {
          ...prev,
          [screenId]: {
            ...currentRow,
            is_view: newValue,
            is_add: newValue,
            is_edit: newValue,
            is_delete: newValue,
            is_upload: newValue,
            is_download: newValue,
            is_all: newValue,
          },
        }
      }

      currentRow[field] = newValue

      if (!newValue) {
        currentRow.is_all = false
      } else {
        const allChecked =
          currentRow.is_view &&
          currentRow.is_add &&
          currentRow.is_edit &&
          currentRow.is_delete &&
          currentRow.is_upload &&
          currentRow.is_download

        if (allChecked) currentRow.is_all = true
      }

      return {
        ...prev,
        [screenId]: currentRow,
      }
    })
  }

  const handleAddPermission = () => {
    if (!newPermissionName.trim()) return

    const newId = Math.max(...permissions.map((p) => p.permission_id)) + 1
    const newPermission = {
      permission_id: newId,
      permission_name: newPermissionName,
      permission_description: "Mới tạo",
    }

    setPermissions([...permissions, newPermission])
    setSelectedPermissionId(newId)

    setNewPermissionName("")
    setShowAddPermission(false)
  }

  const handleAddScreen = () => {
    if (!newScreenName.trim() || !newScreenCode.trim()) return

    const newId = Math.max(...screens.map((s) => s.screen_id)) + 1
    const newScreen = {
      screen_id: newId,
      screen_name: newScreenName,
      screen_code: newScreenCode,
      category_screen_type_id: 1,
    }

    setScreens([...screens, newScreen])

    setMatrix((prev) => ({
      ...prev,
      [newId]: {
        screen_id: newId,
        is_view: false,
        is_add: false,
        is_edit: false,
        is_delete: false,
        is_upload: false,
        is_download: false,
        is_all: false,
      },
    }))

    setNewScreenName("")
    setNewScreenCode("")
    setShowAddScreen(false)
  }

  const handleSave = async () => {
    setSaving(true)
    console.log("Saving data for permission:", selectedPermissionId, Object.values(matrix))

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    alert("Cập nhật quyền thành công!")
  }

  const filteredScreens = screens.filter(
    (s) =>
      s.screen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.screen_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-1 flex flex-col h-[calc(100vh-2rem)]">
        <div className="border-b border-blue-100 p-4 bg-blue-50/50 rounded-t-xl flex justify-between items-center">
          <h2 className="flex items-center gap-2 font-semibold text-blue-900">
            <Shield className="h-5 w-5 text-blue-600" />
            Nhóm Quyền
          </h2>
          <button
            onClick={() => setShowAddPermission(true)}
            className="p-1 hover:bg-white rounded-full text-blue-600 transition-colors shadow-sm"
            title="Thêm nhóm quyền"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showAddPermission && (
          <div className="p-3 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top-2">
            <input
              autoFocus
              type="text"
              placeholder="Tên nhóm quyền..."
              className="w-full px-3 py-2 text-sm border border-blue-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPermissionName}
              onChange={(e) => setNewPermissionName(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddPermission}
                className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 font-medium"
              >
                Thêm
              </button>
              <button
                onClick={() => setShowAddPermission(false)}
                className="flex-1 bg-white text-slate-600 border border-slate-200 text-xs py-1.5 rounded hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="p-2 overflow-y-auto flex-1">
          {permissions.map((perm) => (
            <button
              key={perm.permission_id}
              onClick={() => setSelectedPermissionId(perm.permission_id)}
              className={`w-full text-left rounded-lg p-3 text-sm transition-all duration-200 ${
                selectedPermissionId === perm.permission_id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <div className="font-medium">{perm.permission_name}</div>
              <div
                className={`text-xs mt-1 ${
                  selectedPermissionId === perm.permission_id ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {perm.permission_description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white shadow-sm lg:col-span-3 overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex flex-col border-b border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-blue-900">
              Phân Quyền:{" "}
              <span className="text-blue-600">
                {permissions.find((p) => p.permission_id === selectedPermissionId)?.permission_name}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddScreen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-xs font-medium shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Thêm Màn Hình
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
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-200"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu thay đổi
            </button>
          </div>
        </div>

        {showAddScreen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Thêm Màn Hình Mới</h3>
                <button onClick={() => setShowAddScreen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên màn hình</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ví dụ: Quản lý đơn hàng"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã màn hình (Code)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                    placeholder="Ví dụ: orders.manage"
                    value={newScreenCode}
                    onChange={(e) => setNewScreenCode(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">Dùng để định danh trong code (unique)</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddScreen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleAddScreen}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tạo màn hình
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto flex-1">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-blue-600">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Màn hình chức năng</th>
                  <th className="px-4 py-4 text-center font-medium w-24">Xem</th>
                  <th className="px-4 py-4 text-center font-medium w-24">Thêm</th>
                  <th className="px-4 py-4 text-center font-medium w-24">Sửa</th>
                  <th className="px-4 py-4 text-center font-medium w-24">Xóa</th>
                  <th className="px-4 py-4 text-center font-medium w-24">Upload</th>
                  <th className="px-4 py-4 text-center font-medium w-24">Download</th>
                  <th className="px-4 py-4 text-center font-medium w-24 bg-blue-50/50 text-blue-700">Tất cả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredScreens.map((screen) => {
                  const data = matrix[screen.screen_id] || {
                    is_view: false,
                    is_add: false,
                    is_edit: false,
                    is_delete: false,
                    is_upload: false,
                    is_download: false,
                    is_all: false,
                  }

                  return (
                    <tr key={screen.screen_id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{screen.screen_name}</div>
                        <div className="text-xs text-gray-400">{screen.screen_code}</div>
                      </td>
                      <CheckboxCell
                        checked={data.is_view}
                        onChange={() => handleCheckboxChange(screen.screen_id, "is_view")}
                      />
                      <CheckboxCell
                        checked={data.is_add}
                        onChange={() => handleCheckboxChange(screen.screen_id, "is_add")}
                      />
                      <CheckboxCell
                        checked={data.is_edit}
                        onChange={() => handleCheckboxChange(screen.screen_id, "is_edit")}
                      />
                      <CheckboxCell
                        checked={data.is_delete}
                        onChange={() => handleCheckboxChange(screen.screen_id, "is_delete")}
                      />
                      <CheckboxCell
                        checked={data.is_upload}
                        onChange={() => handleCheckboxChange(screen.screen_id, "is_upload")}
                      />
                      <CheckboxCell
                        checked={data.is_download}
                        onChange={() => handleCheckboxChange(screen.screen_id, "is_download")}
                      />
                      <td className="px-4 py-4 text-center bg-blue-50/20">
                        <div className="flex justify-center">
                          <label className="relative flex cursor-pointer items-center justify-center p-2">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={data.is_all}
                              onChange={() => handleCheckboxChange(screen.screen_id, "is_all")}
                            />
                            <div
                              className={`h-5 w-5 rounded border transition-all ${
                                data.is_all
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300 bg-white hover:border-blue-400"
                              }`}
                            >
                              {data.is_all && (
                                <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                          </label>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && filteredScreens.length === 0 && (
            <div className="py-12 text-center text-gray-400">Không tìm thấy màn hình nào phù hợp.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckboxCell({ checked, onChange }) {
  return (
    <td className="px-4 py-4 text-center">
      <div className="flex justify-center">
        <label className="relative flex cursor-pointer items-center justify-center p-2">
          <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
          <div
            className={`h-5 w-5 rounded border transition-all ${
              checked ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white hover:border-blue-400"
            }`}
          >
            {checked && (
              <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
        </label>
      </div>
    </td>
  )
}
