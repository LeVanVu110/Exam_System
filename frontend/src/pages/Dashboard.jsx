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

const USER_NAME = "Nguyễn Ngọc Ánh Mỹ";

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

const ExamDashboard = () => {
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2023-06-14");
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [showWarningDetail, setShowWarningDetail] = useState(false);

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

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy token từ localStorage
        const token = localStorage.getItem("ACCESS_TOKEN");

        // 2. Gửi request kèm Header
        const res = await fetch("http://localhost:8000/api/exam-schedule", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // 👉 QUAN TRỌNG: Gửi token ở đây
          },
        });

        // 3. Xử lý trường hợp hết hạn token (Lỗi 401)
        if (res.status === 401) {
          console.error("Phiên đăng nhập hết hạn");
          // Tùy chọn: Chuyển hướng về trang login
          // window.location.href = "/login"; 
          return;
        }

        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        setExamSessions(json.data || []);
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu API:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  //1. --- Tổng hợp dữ liệu (useMemo để cache) Lọc 1 Giảng Viên CHỉ Định
  // const { summary, chartData, todaysSchedule, emptyReportsSessions } = useMemo(() => {
//   const teacherSessions = examSessions.filter(

  //     (s) => s.exam_teacher && s.exam_teacher.includes(USER_NAME)
  //   );
  //   const today = new Date(selectedDate);
  //   let completedCount = 0,
  //     upcomingCount = 0;
  //   const warningSessions = [];

  //   teacherSessions.forEach((session) => {
  //     const date = new Date(session.exam_date);
  //     if (date < today) completedCount++;
  //     else upcomingCount++;
  //     if (!session.actual_teacher1_id && !session.actual_teacher2_id)
  //       warningSessions.push(session);
  //   });

  //   const monthlyCounts = {};
  //   teacherSessions.forEach((s) => {
  //     if (s.exam_date) {
  //       const m = s.exam_date.substring(5, 7);
  //       monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;
  //     }
  //   });

  //   return {
  //     summary: {
  //       userName: USER_NAME,
  //       totalAssigned: teacherSessions.length,
  //       totalCompleted: completedCount,
  //       totalUpcoming: upcomingCount,
  //       emptyReports: warningSessions.length,
  //     },
  //     chartData: {
  //       barChartData: Object.keys(monthlyCounts).map((m) => ({
  //         name: `T${parseInt(m)}`,
  //         "Số ca thi": monthlyCounts[m],
  //       })),
  //       pieChartData: [
  //         { name: "Hoàn thành", value: completedCount, fill: "#28a745" },
  //         { name: "Sắp tới", value: upcomingCount, fill: "#ffc107" },
  //       ],
  //     },
  //     todaysSchedule: teacherSessions.filter(
  //       (i) => i.exam_date === selectedDate
  //     ),
  //     emptyReportsSessions: warningSessions,
  //   };
  // }, [examSessions, selectedDate]);
  // end 1. --- Tổng hợp dữ liệu (useMemo để cache) Lọc 1 Giảng Viên CHỉ Định
  // 2. --- Tổng hợp dữ liệu (useMemo để cache) Lọc tất Giảng Viên CHỉ Định
  const { summary, chartData, todaysSchedule, emptyReportsSessions } = useMemo(() => {
  // ❌ Không lọc theo USER_NAME nữa — thống kê toàn bộ dữ liệu
  const allSessions = examSessions;

  const today = new Date(selectedDate);
  let completedCount = 0,
    upcomingCount = 0;
  const warningSessions = [];

  allSessions.forEach((session) => {
    const date = new Date(session.exam_date);
    if (date < today) completedCount++;
    else upcomingCount++;
    if (!session.actual_teacher1_id && !session.actual_teacher2_id)
      warningSessions.push(session);
  });

  const monthlyCounts = {};
  allSessions.forEach((s) => {
    if (s.exam_date) {
      const m = s.exam_date.substring(5, 7);
      monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;
    }
  });

  return {
    summary: {
      userName: "Toàn hệ thống",
      totalAssigned: allSessions.length,
      totalCompleted: completedCount,
      totalUpcoming: upcomingCount,
      emptyReports: warningSessions.length,
    },
    chartData: {
      barChartData: Object.keys(monthlyCounts).map((m) => ({
        name: `T${parseInt(m)}`,
        "Số ca thi": monthlyCounts[m],
      })),
      pieChartData: [
        { name: "Hoàn thành", value: completedCount, fill: "#28a745" },
        { name: "Sắp tới", value: upcomingCount, fill: "#ffc107" },
      ],
    },
    todaysSchedule: allSessions.filter((i) => i.exam_date === selectedDate),
    emptyReportsSessions: warningSessions,
  };
}, [examSessions, selectedDate]);
//end 2

  if (loading)
    return (
      <div className="loading-skeleton">
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
        <div className="skeleton-box wide"></div>
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-box">
        <p className="greeting">👋 Xin chào, Thầy/Cô {summary.userName}</p>
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
                      {calculateEndTime(session.exam_time, session.exam_duration)}
                    </td>
                    <td>{session.exam_teacher}</td>
                  </tr>
                  {expandedSessionId === session.exam_session_id && (
                    <tr className="detail-row open">
                      <td colSpan="6">
                        <div className="detail-content">
                          <p>
                            <b>Phòng:</b> {session.exam_room} |{" "}
                            <b>Số lượng SV:</b> {session.student_count || "N/A"} |{" "}
                            <b>Khoa:</b> {session.exam_faculty || "N/A"} |{" "}
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
<div className="warnings-container">
          <h2>⚠️ Cảnh báo</h2>
          {summary.emptyReports > 0 ? (
            <div className="warning-box">
              <p>{summary.emptyReports} ca thi có bài rỗng cần kiểm tra!</p>
              <button
                className="btn-warning"
                onClick={() => setShowWarningDetail(true)}
              >
                Xem chi tiết
              </button>
            </div>
          ) : (
            <p>Không có cảnh báo nào hiện tại.</p>
          )}
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