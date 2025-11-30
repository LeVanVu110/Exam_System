"use client";

import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // ============================================================
      // 1. GỌI API ĐĂNG NHẬP
      // ============================================================
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // 👉 DEBUG: Xem Server trả về Role tên chính xác là gì
      console.log("👉 API Login Response:", data);

      if (!res.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại");
        setIsLoading(false);
        return;
      }

      // ✅ Lưu Token
      localStorage.setItem("ACCESS_TOKEN", data.token);

      // ============================================================
      // 2. GỌI API LẤY QUYỀN (Xử lý an toàn cho 204)
      // ============================================================
      try {
        const permRes = await fetch("http://localhost:8000/api/my-permissions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
        });

        // Chỉ parse JSON nếu status là 200. Nếu 204 (No Content) thì bỏ qua để tránh lỗi crash app
        if (permRes.ok && permRes.status !== 204) {
          const myPermissions = await permRes.json();
          localStorage.setItem("user_permissions", JSON.stringify(myPermissions));
          console.log("✅ Đã lưu quyền user:", myPermissions);
        } else {
          console.warn("⚠️ API quyền trả về 204 hoặc rỗng (User chưa có quyền nào).");
          localStorage.setItem("user_permissions", JSON.stringify({})); // Lưu rỗng để không lỗi app
        }
      } catch (permError) {
        console.error("❌ Lỗi khi gọi API quyền:", permError);
        // Không return ở đây, vẫn cho đăng nhập tiếp
      }

      // ============================================================
      // 3. CHUYỂN HƯỚNG (Cập nhật theo Database thực tế)
      // ============================================================
      
      // Lấy role, xóa khoảng trắng thừa
      const rawRole = data.role ? data.role.trim() : "";
      
      console.log(`🚀 Đang chuyển hướng cho role gốc: "${rawRole}"`);

      // Tắt loading trước khi chuyển
      setIsLoading(false);

      // Switch case dựa trên dữ liệu thật từ Database
      switch (rawRole) {
        // --- ID 1: ADMIN (DB: Admin) ---
        case "Admin":
        case "admin":
        case "Administrator":
        case "1": 
          console.log("-> Chuyển hướng Dashboard Admin");
          window.location.href = "/dashboard";
          break;

        // --- ID 4: PHÒNG ĐÀO TẠO (DB: Academic Affairs Office) ---
        case "Academic Affairs Office": // Khớp DB
        case "PDT": 
        case "4":
          console.log("-> Chuyển hướng PDT");
          window.location.href = "/PDT/ExamManagement";
          break;

        // --- ID 2: GIẢNG VIÊN (DB: teacher - viết thường) ---
        case "teacher": // Khớp DB (quan trọng)
        case "Teacher": // Dự phòng
        case "Lecturer":
        case "2":
          console.log("-> Chuyển hướng Teacher");
          window.location.href = "/documents";
          break;

        // --- ID 3: SINH VIÊN (DB: Student) ---
        case "Student": // Khớp DB
        case "student":
        case "3":
          console.log("-> Chuyển hướng Student");
          window.location.href = "/student-dashboard";
          break;

        // --- MẶC ĐỊNH (Không khớp role nào) ---
        default:
          console.warn(`⚠️ Role "${rawRole}" không khớp case nào. Chuyển về Home.`);
          window.location.href = "/"; 
      }

    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setErrorMessage("Có lỗi kết nối. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-8 pb-6 text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Đăng Nhập
            </h1>
            <p className="text-gray-500">
              Nhập thông tin tài khoản để truy cập hệ thống
            </p>
          </div>

          <div className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@edu.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng Nhập"
                )}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">© 2025 EduPortal. All rights reserved.</p>
      </div>
    </div>
  );
}