"use client"

import { Search, Bell, Settings, LogOut } from "lucide-react"
import Button from "./ui/Button"

export default function Header() {

  const handleLogout = () => {
    // 1. Xóa token và quyền khỏi bộ nhớ trình duyệt
    localStorage.removeItem("token")
    localStorage.removeItem("user_permissions")
    sessionStorage.removeItem("token")
    
    // 2. Chuyển hướng về trang đăng nhập
    window.location.href = "/login"
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm học phần, lớp, thi..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          /> */}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <Button variant="ghost" size="icon" title="Thông báo">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon" title="Cài đặt">
          <Settings size={20} />
        </Button>
        
        {/* Nút Đăng xuất mới */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div> {/* Divider */}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          title="Đăng xuất"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  )
}