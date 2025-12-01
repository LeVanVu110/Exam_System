import React from 'react';
import { Outlet } from "react-router-dom";

// 1. Import cả 2 loại Sidebar
import Sidebar from "./Sidebar"; // Sidebar mặc định (Admin/Giảng viên/Sinh viên)
import SidebarPDT from "../pages/PDT/SidebarPDT"; // Sidebar riêng cho PDT
import Header from "./Header";

export default function Layout() {
  // 2. Lấy role từ LocalStorage (đã lưu ở bước Login)
  const role = localStorage.getItem('USER_ROLE');
  
  // 3. Kiểm tra xem có phải là PDT không
  // (Khớp với các case trong Login.jsx và Database)
  const isPDT = role === 'Academic Affairs Office' || role === 'PDT' || role === '4';

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* 4. Sidebar bên trái: Tự động chọn dựa trên Role */}
      {isPDT ? (
        <SidebarPDT />
      ) : (
        <Sidebar />
      )}

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}