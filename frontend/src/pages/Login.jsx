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
      // 1. GỌI API ĐĂNG NHẬP
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("👉 API Login Response:", data);

      if (!res.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại");
        setIsLoading(false);
        return;
      }

      // ✅ Lưu Token
      localStorage.setItem("ACCESS_TOKEN", data.token);

      // 2. GỌI API LẤY QUYỀN
      try {
        const permRes = await fetch("http://localhost:8000/api/my-permissions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
        });

        if (permRes.ok && permRes.status !== 204) {
          const myPermissions = await permRes.json();
          localStorage.setItem("user_permissions", JSON.stringify(myPermissions));
        } else {
          localStorage.setItem("user_permissions", JSON.stringify({}));
        }
      } catch (permError) {
        console.error("❌ Lỗi API quyền:", permError);
      }

      // 3. CHUYỂN HƯỚNG & LƯU ROLE (QUAN TRỌNG NHẤT)
      const rawRole = data.role ? data.role.trim() : "";
      
      // ✅ [FIX LỖI] Lưu Role vào localStorage để Layout.jsx đọc được
      localStorage.setItem("USER_ROLE", rawRole);

      console.log(`🚀 Đang chuyển hướng cho role: "${rawRole}"`);
      setIsLoading(false);

      switch (rawRole) {
        case "Admin":
        case "admin":
        case "Administrator":
        case "1": 
          window.location.href = "/dashboard";
          break;

        case "Academic Affairs Office":
        case "PDT": 
        case "4":
          window.location.href = "/PDT/ExamManagement";
          break;

        case "teacher": 
        case "Teacher": 
        case "2":
          window.location.href = "/documents";
          break;

        case "Student":
        case "student":
        case "3":
          window.location.href = "/student-dashboard";
          break;

        default:
          console.warn(`⚠️ Role "${rawRole}" không khớp.`);
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Đăng Nhập</h1>
            <p className="text-gray-500">Nhập thông tin tài khoản để truy cập hệ thống</p>
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
                    <input id="email" type="email" placeholder="name@edu.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">Ghi nhớ đăng nhập</label>
                </div>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Quên mật khẩu?</a>
              </div>
              <button type="submit" disabled={isLoading} className="w-full h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg disabled:opacity-70">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Đăng Nhập"}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">© 2025 EduPortal. All rights reserved.</p>
      </div>
    </div>
  );
}