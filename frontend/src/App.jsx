import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate } from 'react-router-dom';

// ==========================================
// 1. CÁC COMPONENT HỖ TRỢ (MOCK DATA)
// ==========================================

// --- Mock Styles (Thay cho index.css) ---
const styles = {
  container: "p-6",
  header: "bg-blue-600 text-white p-4 mb-4 shadow flex justify-between items-center",
  navLink: "mr-4 hover:underline text-white",
  card: "border rounded p-8 bg-white shadow text-center",
  btn: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
  input: "border p-2 rounded w-full mb-2",
  error: "text-red-500 text-xl font-bold"
};

// --- Mock ToastContainer (Để tránh lỗi import css) ---
const ToastContainer = () => <div className="fixed top-0 right-0 p-2"></div>;

// ==========================================
// 2. SECURITY COMPONENTS (QUAN TRỌNG)
// ==========================================

const ForbiddenPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <h1 className="text-6xl font-bold text-red-500">403</h1>
    <h2 className="text-2xl font-semibold mt-4">Truy cập bị từ chối</h2>
    <p className="mb-4">Bạn không có quyền truy cập màn hình này.</p>
    <Link to="/" className="text-blue-600 underline">Quay về trang chủ</Link>
  </div>
);

const ProtectedRoute = ({ screenCode }) => {
  const permissionsStr = localStorage.getItem('user_permissions');
  const token = localStorage.getItem('token');

  if (!token || !permissionsStr) {
    return <Navigate to="/login" replace />;
  }

  const permissions = JSON.parse(permissionsStr);
  const currentScreenPerm = permissions[screenCode];

  // Kiểm tra quyền: Có tồn tại quyền cho screenCode này VÀ is_view = 1
  const isAllowed = currentScreenPerm && (currentScreenPerm.is_view === 1 || currentScreenPerm.is_view === true);

  if (isAllowed) {
    return <Outlet />;
  } else {
    return <Navigate to="/403" replace />;
  }
};

// ==========================================
// 3. LAYOUTS & PAGES
// ==========================================

// --- Layout Chung (Cán bộ coi thi) ---
const Layout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={styles.header}>
        <div className="font-bold text-xl">Hệ Thống Thi (Cán Bộ)</div>
        <nav>
          <Link to="/Dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/exam-schedule" className={styles.navLink}>Lịch Thi</Link>
          <Link to="/documents" className={styles.navLink}>Tài Liệu</Link>
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded text-sm ml-4">Đăng xuất</button>
        </nav>
      </header>
      <main className={styles.container}>
        <Outlet />
      </main>
    </div>
  );
};

// --- Layout Phòng Đào Tạo ---
const LayoutPDT = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-indigo-700 text-white p-4 mb-4 flex justify-between">
        <div className="font-bold text-xl">Phòng Đào Tạo Admin</div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-400 px-3 py-1 rounded">Logout</button>
      </header>
      <main className={styles.container}>
        <Outlet />
      </main>
    </div>
  );
};

// --- Các trang nội dung (Giả lập) ---
const ExamDashboard = () => <div className={styles.card}><h1 className="text-2xl">Dashboard Cán Bộ</h1><p>Mã màn hình: DASHBOARD</p></div>;
const Schedule = () => <div className={styles.card}><h1 className="text-2xl">Lịch Coi Thi</h1><p>Mã màn hình: EXAM_SCHEDULE</p></div>;
const ClassSchedule = () => <div className={styles.card}><h1 className="text-2xl">Lịch Lớp Học</h1><p>Mã màn hình: CLASS_SCHEDULE</p></div>;
const Documents = () => <div className={styles.card}><h1 className="text-2xl">Tài Liệu</h1><p>Mã màn hình: DOCUMENTS</p></div>;
const Exams = () => <div className={styles.card}><h1 className="text-2xl">Danh Sách Kỳ Thi</h1><p>Mã màn hình: EXAMS</p></div>;
const QA = () => <div className={styles.card}><h1 className="text-2xl">Hỏi Đáp</h1><p>Mã màn hình: QA</p></div>;
const ExamManagement = () => <div className={styles.card}><h1 className="text-2xl text-indigo-700">Quản Lý Kỳ Thi (PDT)</h1><p>Mã màn hình: PDT_MGT</p></div>;
const PermissionPage = () => <div className={styles.card}><h1 className="text-2xl text-purple-700">Trang Phân Quyền (Admin)</h1><p>Mã màn hình: ADMIN_PERM</p></div>;

// --- Trang Login (Đã tích hợp Logic Fake API) ---
const LoginForm = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    // 1. Giả lập Token
    const fakeToken = "abc.123.xyz";
    localStorage.setItem('token', fakeToken);

    // 2. Giả lập Quyền trả về từ API dựa trên vai trò
    let permissions = {};

    if (role === 'cbct') {
      // Cán bộ coi thi: Xem được Dashboard, Lịch thi, Tài liệu
      permissions = {
        "DASHBOARD": { is_view: 1 },
        "EXAM_SCHEDULE": { is_view: 1 },
        "DOCUMENTS": { is_view: 1 },
        "EXAMS": { is_view: 0 }, // Không xem được
        // Không có quyền PDT
      };
      alert("Đăng nhập với vai trò: Cán Bộ Coi Thi");
    } else if (role === 'pdt') {
      // Phòng đào tạo: Xem được trang PDT
      permissions = {
        "PDT_MGT": { is_view: 1 },
        // Không có quyền Dashboard của CBCT
      };
      alert("Đăng nhập với vai trò: Phòng Đào Tạo");
    } else if (role === 'admin') {
      // Admin: Full quyền
      permissions = {
        "DASHBOARD": { is_view: 1 },
        "ADMIN_PERM": { is_view: 1 },
        "PDT_MGT": { is_view: 1 },
        "EXAM_SCHEDULE": { is_view: 1 },
        "CLASS_SCHEDULE": { is_view: 1 },
        "DOCUMENTS": { is_view: 1 },
        "EXAMS": { is_view: 1 },
        "QA": { is_view: 1 },
      };
      alert("Đăng nhập với vai trò: Admin");
    }

    // 3. Lưu vào LocalStorage
    localStorage.setItem('user_permissions', JSON.stringify(permissions));

    // 4. Chuyển hướng
    if (role === 'pdt') navigate('/PDT/ExamManagement');
    else if (role === 'admin') navigate('/permission');
    else navigate('/Dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng Nhập Demo</h2>
        <div className="space-y-4">
          <button onClick={() => handleLogin('cbct')} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Login as Cán Bộ Coi Thi
          </button>
          <button onClick={() => handleLogin('pdt')} className="w-full bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600">
            Login as Phòng Đào Tạo
          </button>
          <button onClick={() => handleLogin('admin')} className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900">
            Login as Admin
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          *Click nút để giả lập đăng nhập và lưu quyền
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 4. APP COMPONENT CHÍNH
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<LoginForm />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* --- PROTECTED ROUTES --- */}

        {/* 1. Nhóm Phòng Đào Tạo */}
        <Route element={<ProtectedRoute screenCode="PDT_MGT" />}>
            <Route element={<LayoutPDT />}>
              <Route path="/PDT/ExamManagement" element={<ExamManagement />} />
            </Route>
            <Route path="at" element={<ExamManagement />} />
        </Route>

        {/* 2. Nhóm Admin */}
        <Route element={<ProtectedRoute screenCode="ADMIN_PERM" />}>
            <Route path="/permission" element={<PermissionPage />} />
        </Route>

        {/* 3. Nhóm Cán Bộ Coi Thi */}
        <Route element={<Layout />}>
            
            <Route element={<ProtectedRoute screenCode="DASHBOARD" />}>
               <Route path="/Dashboard" element={<ExamDashboard />} />
            </Route>

            <Route element={<ProtectedRoute screenCode="EXAM_SCHEDULE" />}>
               <Route path="/exam-schedule" element={<Schedule />} />
            </Route>

            <Route element={<ProtectedRoute screenCode="CLASS_SCHEDULE" />}>
               <Route path="/class-schedule" element={<ClassSchedule />} />
            </Route>

            <Route element={<ProtectedRoute screenCode="DOCUMENTS" />}>
               <Route path="/documents" element={<Documents />} />
            </Route>

            <Route element={<ProtectedRoute screenCode="EXAMS" />}>
               <Route path="/exams" element={<Exams />} />
            </Route>

            <Route element={<ProtectedRoute screenCode="QA" />}>
               <Route path="/qa" element={<QA />} />
            </Route>

        </Route>

      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;