import PermissionManager from "@/pages/Admin/permission-manager"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Hệ Thống Phân Quyền</h1>
          <p className="text-blue-600">Quản lý quyền truy cập cho từng màn hình</p>
        </div>
        <PermissionManager />
      </div>
    </div>
  )
}
