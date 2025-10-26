import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, FileText, Calendar, HelpCircle, BarChart3 } from "lucide-react";
import { cn } from "../lib/utils"; // import từ file utils.js vừa tạo

const menuItems = [
  { icon: Home, label: "Trang Chủ", path: "/" },
  { icon: BookOpen, label: "Môi học phần trình", path: "/class-schedule" },
  { icon: BarChart3, label: "Bài thi", path: "/exams" },
  { icon: FileText, label: "Tài liệu/Giáo án", path: "/documents" },
  { icon: Calendar, label: "Lịch dạy/Lịch thi", path: "/exam-schedule" },
  { icon: HelpCircle, label: "Hỏi đáp cộng đồng", path: "/qa" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">EduPortal</h1>
            <p className="text-xs text-sidebar-foreground/60">Quản lý học tập</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">NA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Nguyễn Văn Admin</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">admin@edu.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
