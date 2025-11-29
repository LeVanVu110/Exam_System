import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  Calendar,
  HelpCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCircle

} from "lucide-react";
import { cn } from "../lib/utils";

const menuItems = [
  { icon: Home, label: "Trang Chủ", path: "/Dashboard" },
  { icon: Calendar, label: "Lịch dạy/Lịch thi", path: "/exam-schedule" },
  { icon: ShieldCheck, label: "Quản lý quyền", path: "/permission" },
  { icon: UserCircle, label: "UserProfile", path: "/UserProfile" },
];

export default function Sidebar() {
  const location = useLocation();

  // ✅ Lấy trạng thái đã lưu trong localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true"; // nếu null → false
  });

  // ✅ Mỗi khi collapsed thay đổi → lưu lại
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed);
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "relative h-screen border-r border-border bg-white transition-all duration-300 flex flex-col justify-between",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* --- Logo Header --- */}
      <div className="relative p-6 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-gray-900">EduPortal</h1>
              <p className="text-xs text-gray-500">Quản lý học tập</p>
            </div>
          )}
        </div>

        {/* --- Nút thu gọn --- */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-50 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100 transition"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
          style={{ width: "24px", height: "24px" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* --- Menu Items --- */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-800 hover:bg-gray-100",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- User Profile --- */}
      <div className="p-4 border-t border-gray-300">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">NA</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Nguyễn Văn Admin
              </p>
              <p className="text-xs text-gray-500 truncate">admin@edu.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
