import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./ExamDashboard.css";

// === Modal cảnh báo chi tiết ===
const WarningDetailModal = ({ onClose, emptyReportsSessions }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Danh sách Ca thi có cảnh báo</h3>
      <p>
        Tìm thấy {emptyReportsSessions.length} ca thi chưa xác nhận hoặc thiếu
        giám thị.
      </p>
      <table className="schedule-table detail-table">
        <thead>
          <tr>
            <th>Mã ca</th>
            <th>Môn học</th>
            <th>Phòng</th>
            <th>Ngày thi</th>
            <th>Giáo viên</th>
          </tr>
        </thead>
        <tbody>
          {emptyReportsSessions.map((session) => (
            <tr key={session.exam_session_id}>
              <td>{session.exam_session_id}</td>
              <td>{session.subject_name}</td>
              <td>{session.exam_room}</td>
              <td>{session.exam_date}</td>
              <td>{session.exam_teacher}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-primary" onClick={onClose}>
        Đóng
      </button>
    </div>
  </div>
);

// ⭐️ HÀM TIỆN ÍCH CHUẨN HÓA TÊN (KEY: Xử lý khoảng trắng thừa)
const normalizeName = (name) => {
    if (!name) return "";
    // Loại bỏ khoảng trắng ở đầu/cuối và thay thế nhiều khoảng trắng thành 1
    return name.trim().replace(/\s+/g, ' ');
};

const ExamDashboard = () => {
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2026-01-13"); 
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [showWarningDetail, setShowWarningDetail] = useState(false);
  
  // ⭐️ STATE LƯU THÔNG TIN NGƯỜI DÙNG TỪ localStorage
  const [currentUser, setCurrentUser] = useState(null);
  
  const toggleDetails = useCallback(
    (id) => setExpandedSessionId((prev) => (prev === id ? null : id)),
    []
  );

  const calculateEndTime = (startTimeStr, durationMinutes) => {
    if (!startTimeStr || !durationMinutes) return "N/A";
    const [h, m, s] = startTimeStr.split(":").map(Number);
    const temp = new Date(2000, 0, 1, h, m, s);
    temp.setMinutes(temp.getMinutes() + durationMinutes);
    return `${temp.getHours().toString().padStart(2, "0")}:${temp
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const userInfoStr = localStorage.getItem("USER_INFO");
    // Lấy Role từ localStorage
    const userRole = localStorage.getItem("USER_ROLE"); 
    let token = localStorage.getItem("ACCESS_TOKEN");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    if (userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr);
            // Gộp thông tin Role vào currentUser
            setCurrentUser({ ...userInfo, role: userRole }); 
        } catch (error) {
            console.error("Lỗi phân tích cú pháp USER_INFO:", error);
        }
    }
    
    const fetchSchedules = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/exam-schedules", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          alert("Phiên đăng nhập hết hạn!");
          localStorage.clear();
          window.location.href = "/";
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          console.error("API Error:", text);
          return;
        }

        const json = await res.json();
        setExamSessions(json.data || []);
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu API:", e);
      } finally {
        // Chỉ đặt loading = false sau lần tải đầu tiên
        // Nếu đã tải xong, không cần đặt lại ở mỗi lần polling
        if (loading) setLoading(false);
      }
    };
    
    // ⭐️ THÊM LOGIC REAL-TIME POLLING
    
    // Tải dữ liệu lần đầu
    fetchSchedules();
    
    // Thiết lập interval để tải lại dữ liệu mỗi 15 giây (15000ms)
    const intervalId = setInterval(fetchSchedules, 15000); 

    // Hàm cleanup: Xóa interval khi component unmount
    return () => clearInterval(intervalId);
    
  }, []); // Chỉ chạy 1 lần khi mount component

  // ⭐️ Logic tính toán và lọc dữ liệu (Áp dụng phân quyền và chuẩn hóa tên)
  const { summary, chartData, todaysSchedule, emptyReportsSessions } =
    useMemo(() => {
      // Xác định vai trò quản trị viên
      const isAdministrator = currentUser?.role === "Admin" || currentUser?.role === "Academic Affairs Office";
      
      const nameForFiltering = currentUser?.full_name_profile;
      const normalizedCurrentUser = normalizeName(nameForFiltering);
      
      if (!currentUser || (!isAdministrator && !normalizedCurrentUser)) {
          return {
              summary: {
                  full_name_profile: currentUser?.name || "Đang tải...",
                  totalAssigned: 0, totalCompleted: 0, totalUpcoming: 0, emptyReports: 0,
              },
              chartData: { barChartData: [], pieChartData: [] },
              todaysSchedule: [],
              emptyReportsSessions: [],
          };
      }

      let teacherSessions = examSessions;

      // ÁP DỤNG LỌC DỮ LIỆU DỰA TRÊN VAI TRÒ
      if (!isAdministrator) {
          // Nếu là Teacher, chỉ lấy ca thi của mình
          teacherSessions = examSessions.filter(
              (s) => 
                  normalizedCurrentUser === normalizeName(s.teacher1_name) ||
                  normalizedCurrentUser === normalizeName(s.teacher2_name)
          );
      } else {
          // Nếu là Admin/Academic Affairs Office, lấy TẤT CẢ ca thi
          teacherSessions = examSessions; 
      }
      
      let completedCount = 0,
        upcomingCount = 0;
      const warningSessions = [];

      teacherSessions.forEach((session) => {
        const dateOnly = session.exam_date;
        if (dateOnly < selectedDate) completedCount++;
        else if (dateOnly >= selectedDate) upcomingCount++; 
        
        if (!session.actual_teacher1_id && !session.actual_teacher2_id)
          warningSessions.push(session);
      });

      const monthlyCounts = {};
      teacherSessions.forEach((s) => {
        if (s.exam_date) {
          const m = s.exam_date.substring(5, 7);
          monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;
        }
      });

      const sortedBarChartData = Object.keys(monthlyCounts)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((m) => ({
          name: `T${parseInt(m)}`,
          "Số ca thi": monthlyCounts[m],
        }));

      return {
        summary: {
          full_name_profile: nameForFiltering || currentUser?.name, 
          totalAssigned: teacherSessions.length,
          totalCompleted: completedCount,
          totalUpcoming: upcomingCount,
          emptyReports: warningSessions.length,
          
        },
        chartData: {
          barChartData: sortedBarChartData,
          pieChartData: [
            { name: "Hoàn thành", value: completedCount, fill: "#28a745" },
            { name: "Sắp tới", value: upcomingCount, fill: "#ffc107" },
          ],
        },
        todaysSchedule: teacherSessions.filter(
          (i) => i.exam_date === selectedDate
        ),
        emptyReportsSessions: warningSessions,
      };
    }, [examSessions, selectedDate, currentUser]); 

  if (loading || !currentUser)
    return (
      <div className="loading-skeleton">
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
        <div className="skeleton-box wide"></div>
        <p style={{textAlign: 'center'}}>Đang tải dữ liệu ca thi...</p>
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-box">
        <p className="greeting">👋 Xin chào, Thầy/Cô {summary.full_name_profile}</p>
      </div>
      <hr />

      {/* Tổng quan */}
      <section className="summary-section">
        <h2>📊 Tổng quan</h2>
        <div className="flex items-center gap-2 mb-4">
          <label className="font-medium">📅 Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            className="border rounded-lg px-3 py-2 cursor-pointer"
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-value">{summary.totalAssigned}</span>
            <span className="summary-label">Ca thi được phân công</span>
          </div>
          <div className="summary-item completed">
            <span className="summary-value">{summary.totalCompleted}</span>
            <span className="summary-label">Ca thi hoàn thành</span>
          </div>
          <div className="summary-item upcoming">
            <span className="summary-value">{summary.totalUpcoming}</span>
            <span className="summary-label">Ca thi sắp tới</span>
          </div>
        </div>
      </section>
      <hr />

      {/* Lịch thi hôm nay */}
      <section className="schedule-section">
        <h2>📅 Lịch thi hôm nay ({selectedDate})</h2>
        {todaysSchedule.length === 0 ? (
          <p>Không có ca thi nào hôm nay.</p>
        ) : (
          <table className="schedule-table schedule-toggle">
            <thead>
              <tr>
                <th></th>
                <th>Mã lớp</th>
                <th>Môn học</th>
                <th>Phòng</th>
                <th>Bắt đầu</th>
                <th>Giáo viên</th>
              </tr>
            </thead>
            <tbody>
              {todaysSchedule.map((session) => (
                <React.Fragment key={session.exam_session_id}>
                  <tr
                    className="main-row"
                    onClick={() => toggleDetails(session.exam_session_id)}
                  >
                    <td className="toggle-icon">
                      <i
                        className={`fas fa-chevron-${
                          expandedSessionId === session.exam_session_id
                            ? "up"
                            : "down"
                        }`}
                      ></i>
                    </td>
                    <td>{session.class_code}</td>
                    <td>{session.subject_name}</td>
                    <td>{session.exam_room}</td>
                    <td>
                      {session.exam_time?.substring(0, 5)} -{" "}
                      {calculateEndTime(
                        session.exam_time,
                        session.exam_duration
                      )}
                    </td>
                    <td>{summary.full_name_profile}</td>
                  </tr>
                  {expandedSessionId === session.exam_session_id && (
                    <tr className="detail-row open">
                      <td colSpan="6">
                        <div className="detail-content">
                          <p>
                            <b>Phòng:</b> {session.exam_room} |{" "}
                            <b>Số lượng SV:</b> {session.student_count || "N/A"}{" "}
                            | <b>Khoa:</b> {session.exam_faculty || "N/A"} |{" "}
                            <b>Thời lượng:</b> {session.exam_duration} phút
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <hr />

      {/* Biểu đồ */}
      <section className="charts-warnings-section">
        <div className="charts-container">
          <div className="chart-item">
            <h3>Số ca thi theo tháng</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Số ca thi" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-item">
            <h3>Tỷ lệ hoàn thành / Sắp tới</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.pieChartData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </section>

      {showWarningDetail && (
        <WarningDetailModal
          onClose={() => setShowWarningDetail(false)}
          emptyReportsSessions={emptyReportsSessions}
        />
      )}
    </div>
  );
};

export default ExamDashboard;