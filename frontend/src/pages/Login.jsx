"use client";

import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. GỌI API ĐĂNG NHẬP
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại");
      } else {
        // ✅ Lưu Token
        localStorage.setItem("ACCESS_TOKEN", data.token);

        // ============================================================
        // 2. GỌI API LẤY QUYỀN
        // ============================================================
        try {
          const permRes = await fetch(
            "http://localhost:8000/api/my-permissions",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${data.token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (permRes.ok) {
            const myPermissions = await permRes.json();
            localStorage.setItem(
              "user_permissions",
              JSON.stringify(myPermissions)
            );
            console.log("✅ Đã lưu quyền user:", myPermissions);
          } else {
            console.warn("⚠️ Không thể lấy danh sách quyền từ server");
          }
        } catch (permError) {
          console.error("❌ Lỗi khi gọi API quyền:", permError);
        }
        // ============================================================

        // 3. CHUYỂN HƯỚNG VỚI DEBUG
        console.log("🔍 Role nhận được từ Backend:", data.role); // Kiểm tra log này!

        // Chuẩn hóa role (loại bỏ khoảng trắng thừa nếu có)
        const roleName = data.role ? data.role.trim() : "";

        switch (roleName) {
          case "Admin":
            console.log("➡️ Chuyển hướng đến Dashboard (Admin)");
            navigate("/dashboard", {
              state: { message: "Đăng nhập thành công với quyền Admin!" },
            });
            break;

          case "Academic Affairs Office": // Phải khớp 100% với DB
            console.log("➡️ Chuyển hướng đến ExamManagement (PDT)");
            navigate("/PDT/ExamManagement", {
              state: { message: "Chào Phòng Đào Tạo!" },
            });
            break;

          case "Teacher":
            console.log("➡️ Chuyển hướng đến Documents (Teacher)");
            navigate("/documents", {
              state: { message: "Đăng nhập thành công. Xin chào Thầy/Cô!" },
            });
            break;

          case "Student": // Thêm case Student nếu cần
             console.log("➡️ Chuyển hướng đến Student (Student)");
             navigate("/student-dashboard", {
               state: { message: "Chào mừng sinh viên!" }
             });
             break;

          default:
            console.warn("⚠️ Role không được nhận diện:", roleName);
            // Thay vì chuyển đến /a, hãy thông báo lỗi hoặc chuyển về trang chủ chung
            setErrorMessage(`Đăng nhập thành công nhưng Vai trò "${roleName}" chưa được cấu hình trang đích.`);
            // navigate("/dashboard"); // Hoặc chuyển về dashboard mặc định để test
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
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
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@edu.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mật khẩu
                    </label>
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
                      className="w-full pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
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
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
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

        <p className="mt-8 text-center text-sm text-gray-500">
          © 2025 EduPortal. All rights reserved.
        </p>
      </div>
    </div>
  );
}