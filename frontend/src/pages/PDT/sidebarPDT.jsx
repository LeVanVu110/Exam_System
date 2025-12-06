import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

// Hàm tiện ích thay thế cho import từ "../../lib/utils"
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// 👇 CẤU HÌNH MENU & SCREEN CODE
// Đã cập nhật về EXAM_MGT và PERMISSION_MGT để khớp với Database và Log của bạn
const menuItems = [
  { icon: Calendar, label: "Quản lý kỳ thi", path: "/PDT/ExamManagement", screenCode: "EXAM_MGT" }, 
  { icon: ShieldCheck, label: "Quản lý quyền", path: "/permission", screenCode: "PERMISSION_MGT" }, 
];

export default function SidebarPDT() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sidebar-collapsed");
        return saved === "true";
    }
    return false;
  });
  const [user, setUser] = useState({ name: "Cán bộ Đào tạo", email: "pdt@edu.com" });
  
  // 👇 STATE QUYỀN
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    const storedUser = localStorage.getItem("USER_INFO");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi parse USER_INFO", e);
      }
    }
  }, []);

  // 👇 LẮNG NGHE SỰ KIỆN CẬP NHẬT QUYỀN
  useEffect(() => {
    const loadPermissions = () => {
      const stored = localStorage.getItem("user_permissions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          let validPermissions = [];

          // 🛡️ FIX LỖI 2: Xử lý linh hoạt các cấu trúc dữ liệu khác nhau
          if (Array.isArray(parsed)) {
            // Case 1: Mảng chuẩn [ {screen_code: 'A', ...} ]
            validPermissions = parsed;
          } else if (parsed && typeof parsed === "object") {
            // Case 2: API trả về { data: [...] }
            if (Array.isArray(parsed.data)) {
                validPermissions = parsed.data;
            } 
            // Case 3: Object dạng Map { "EXAM_MGT": { is_view: 1 } } hoặc { "0": {...} }
            else {
                // Chuyển đổi Object thành Array nhưng GIỮ LẠI KEY làm screen_code nếu thiếu
                validPermissions = Object.entries(parsed).map(([key, value]) => {
                    // Nếu value là object, ta merge thêm key vào làm screen_code (phòng hờ key là mã màn hình)
                    if (typeof value === 'object' && value !== null) {
                        return { 
                            ...value, 
                            screen_code: value.screen_code || value.permission_name || key 
                        };
                    }
                    return value;
                });
            }
          }
          
          console.log("🔍 SidebarPDT Permissions Loaded:", validPermissions);
          setPermissions(validPermissions);

        } catch (e) {
          console.error("Lỗi load quyền SidebarPDT", e);
          setPermissions([]);
        }
      }
    };
    loadPermissions();
    window.addEventListener("permissions_updated", loadPermissions);
    return () => window.removeEventListener("permissions_updated", loadPermissions);
  }, []);

  // 👇 HÀM CHECK QUYỀN
  const hasPermission = (item) => {
    if (item.public) return true;
    if (!item.screenCode) return true; 
    
    if (!Array.isArray(permissions) || permissions.length === 0) {
        return false;
    }

    // Tìm quyền trong mảng permissions
    const p = permissions.find(x => 
      (x.screen_code === item.screenCode) || 
      (x.permission_name === item.screenCode)
    );
    
    // 🛡️ FIX LỖI: So sánh lỏng (==) để '1' và 1 đều được chấp nhận
    // Kiểm tra cả permission_is_active nếu có
    if (p) {
        const canView = (p.is_view == 1) || (p.is_view === true);
        const isActive = (p.permission_is_active == 1) || (p.permission_is_active === true);
        
        // Nếu object chỉ có { is_view: 1 } mà không có permission_is_active thì ta chỉ check is_view
        if (p.permission_is_active !== undefined) {
             return isActive; // Hoặc logic kết hợp tùy bạn: return canView && isActive;
        }
        return canView;
    }
    
    return false;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside
      className={cn(
        "relative h-screen border-r border-border bg-white transition-all duration-300 flex flex-col justify-between",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="relative p-6 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-gray-900">EduPortal</h1>
              <p className="text-xs text-gray-500">Phòng Đào Tạo</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-50 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100 transition"
          style={{ width: "24px", height: "24px" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems
          .filter(hasPermission) // 👈 LỌC MENU DỰA TRÊN QUYỀN
          .map((item) => {
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
        
        {/* Nếu không có mục nào được hiển thị */}
        {menuItems.filter(hasPermission).length === 0 && !collapsed && (
            <div className="px-4 py-2 text-xs text-gray-400 text-center">
                Chưa có quyền truy cập chức năng nào.
                <br/>(Kiểm tra console để debug quyền)
            </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-300">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs font-bold">{getInitials(user.name)}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={user.name}>
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}