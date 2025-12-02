import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  ShieldCheck,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Hàm tiện ích thay thế cho import từ "../lib/utils"
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// 👇 1. CẤU HÌNH MENU & MÃ MÀN HÌNH (SCREEN CODE)
// Bạn nhớ kiểm tra mã này có khớp trong Database không nhé (VD: SCH_EXAM hay EXAM_SCHEDULE)
const menuItems = [
  { icon: Home, label: "Trang Chủ", path: "/Dashboard", public: true }, // public: true => Luôn hiện
  { icon: Calendar, label: "Lịch dạy/Lịch thi", path: "/exam-schedule", screenCode: "EXAM_SCHEDULE" },
  { icon: ShieldCheck, label: "Quản lý quyền", path: "/permission", screenCode: "PERMISSION_MGT" },
  { icon: UserCircle, label: "Hồ sơ cá nhân", path: "/UserProfile", public: true },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    // Kiểm tra an toàn khi render phía server (nếu có)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });
  const [user, setUser] = useState({ name: "Người dùng", email: "user@edu.com" });

  // 👇 2. STATE LƯU QUYỀN HẠN
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

  // 👇 3. LOGIC LẮNG NGHE SỰ KIỆN 'permissions_updated' (ĐÃ SỬA LỖI GIỐNG SIDEBAR PDT)
  useEffect(() => {
    const loadPermissions = () => {
      const stored = localStorage.getItem("user_permissions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          let validPermissions = [];

          // 🛡️ FIX LỖI: Xử lý linh hoạt cả Array và Object (giống SidebarPDT)
          if (Array.isArray(parsed)) {
            // Case 1: Mảng chuẩn
            validPermissions = parsed;
          } else if (parsed && typeof parsed === "object") {
            // Case 2: API trả về { data: [...] }
            if (Array.isArray(parsed.data)) {
                validPermissions = parsed.data;
            } 
            // Case 3: Object dạng Map { "EXAM_MGT": {...} }
            else {
                // Chuyển đổi Object thành Array, giữ key làm screen_code dự phòng
                validPermissions = Object.entries(parsed).map(([key, value]) => {
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
          
          console.log("🔍 Admin Sidebar Permissions:", validPermissions);
          setPermissions(validPermissions);

        } catch (e) {
          console.error("Lỗi đọc quyền trong Sidebar", e);
          setPermissions([]); // Reset về mảng rỗng để an toàn
        }
      }
    };

    // Load lần đầu
    loadPermissions();

    // Đăng ký lắng nghe sự kiện từ PermissionManager
    window.addEventListener("permissions_updated", loadPermissions);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("permissions_updated", loadPermissions);
    };
  }, []);

  // 👇 4. HÀM KIỂM TRA QUYỀN ĐỂ ẨN/HIỆN MENU (ĐÃ SỬA LỖI)
  const hasPermission = (item) => {
    // 1. Nếu là menu công khai -> Luôn hiện
    if (item.public) return true;

    // 2. Nếu không có screenCode -> Mặc định hiện (hoặc ẩn tùy bạn)
    if (!item.screenCode) return true;

    // 3. 🛡️ FIX LỖI: Kiểm tra chắc chắn permissions là Array
    if (!Array.isArray(permissions) || permissions.length === 0) return false;

    // 4. Tìm quyền trong danh sách
    const perm = permissions.find(
      (p) => (p.screen_code === item.screenCode) || (p.permission_name === item.screenCode)
    );

    // 5. Kiểm tra quyền Xem (is_view)
    if (perm) {
        // So sánh lỏng (==) để chấp nhận cả "1" và 1
        const canView = (perm.is_view == 1) || (perm.is_view === true);
        const isActive = (perm.permission_is_active == 1) || (perm.permission_is_active === true);

        // Ưu tiên check active nếu có field này
        if (perm.permission_is_active !== undefined) {
            return isActive;
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
              <p className="text-xs text-gray-500">Quản lý học tập</p>
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
          
        {/* Nếu không có mục nào được hiển thị (do chưa phân quyền), hiện thông báo nhỏ */}
        {menuItems.filter(hasPermission).length === 0 && !collapsed && (
            <div className="px-4 py-2 text-xs text-gray-400 text-center">
                Chưa có quyền truy cập chức năng nào.
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