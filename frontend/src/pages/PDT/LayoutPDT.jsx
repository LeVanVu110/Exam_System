import { Outlet } from "react-router-dom";
import Sidebar from "./sidebarPDT";
import Header from "./HeaderPDT";

export default function Layout() {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar bên trái */}
      <Sidebar />

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
