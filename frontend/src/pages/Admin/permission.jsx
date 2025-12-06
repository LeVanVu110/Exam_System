import PermissionManager from "@/pages/Admin/permission-manager"
// 👇 1. Import Sidebar (Hãy kiểm tra lại đường dẫn import sidebarPDT cho đúng với cấu trúc thư mục của bạn)
// Ví dụ nếu file này nằm ở src/pages/Admin thì đường dẫn là: "../PDT/sidebarPDT"
// Hoặc nếu dùng alias @: "@/pages/PDT/sidebarPDT"
// import Sidebar from "@/pages/PDT/sidebarPDT"; 

export default function Page() {
  return (
    // 👇 2. Thêm class 'flex' vào thẻ cha để xếp Sidebar và Nội dung nằm ngang
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 👇 3. Hiển thị Sidebar ở bên trái */}
      {/* <Sidebar /> */}

      {/* 👇 4. Nội dung chính: Thêm 'flex-1' để nó chiếm hết khoảng trống còn lại bên phải */}
      <div className="flex-1 p-4 md:p-8 overflow-auto h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-900">Hệ Thống Phân Quyền</h1>
            <p className="text-blue-600">Quản lý quyền truy cập cho từng màn hình</p>
          </div>
          <PermissionManager />
        </div>
      </div>
    </div>
  )
}