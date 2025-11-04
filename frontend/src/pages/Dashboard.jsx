import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import './ExamDashboard.css'; 

// Tên người dùng cần được lấy từ Context/Auth API, tạm thời hardcode
const USER_NAME = "Nguyễn Ngọc Ánh Mỹ"; 
const WarningDetailModal = ({ onClose, emptyReportsSessions }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Danh sách Ca thi có cảnh báo</h3>
                <p>Tìm thấy {emptyReportsSessions.length} ca thi chưa xác nhận hoặc thiếu giám thị.</p>
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
                                <td>{session.exam_code}</td>
                                <td>{session.subject_name}</td>
                                <td>{session.exam_room}</td>
                                <td>{session.exam_date}</td>
                                <td>{session.exam_teacher}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="btn-primary" onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
};

// Component chính
const ExamDashboard = () => {
    
    // Hàm lấy ngày hôm nay (dùng '2023-06-14' để khớp với dữ liệu mẫu)
    const getTodayDateString = () => {
        // Trong môi trường thực tế: 
        // const date = new Date();
        // const year = date.getFullYear();
        // const month = String(date.getMonth() + 1).padStart(2, '0');
        // const day = String(date.getDate()).padStart(2, '0');
        // return `${year}-${month}-${day}`;
        return "2023-06-14"; 
    };
    
    const todayDate = getTodayDateString();

    const initialSummary = {
        userName: USER_NAME,
        totalAssigned: 0,
        totalCompleted: 0,
        totalUpcoming: 0,
        emptyReports: 0, 
    };

    const [loading, setLoading] = useState(true); 
    const [examSessions, setExamSessions] = useState([]);
    const [summary, setSummary] = useState(initialSummary);
    const [chartData, setChartData] = useState({ barChartData: [], pieChartData: [] });
    const [showWarningDetail, setShowWarningDetail] = useState(false);
    const [emptyReportsSessions, setEmptyReportsSessions] = useState([]);
    // Hàm mở/đóng modal
    const handleViewDetail = () => {
        // Chỉ mở modal nếu có cảnh báo để xem
        if (summary.emptyReports > 0) {
            setShowWarningDetail(true);
        }
    };
    
    // Hàm đóng modal
    const handleCloseDetail = () => {
        setShowWarningDetail(false);
    };

    // --- LOGIC TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ ---
const transformChartData = (sessions) => {
    if (!sessions || sessions.length === 0) {
        return { barChartData: [], pieChartData: [] };
    }

    // === BIỂU ĐỒ CỘT: số ca thi theo tháng ===
    const monthlyCounts = {};
    sessions.forEach(session => {
        if (session.exam_date) {
            const month = session.exam_date.substring(5, 7);
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
        }
    });

    const barChartData = Object.keys(monthlyCounts)
        .sort()
        .map(monthKey => ({
            name: `T${parseInt(monthKey)}`,
            'Số ca thi': monthlyCounts[monthKey],
        }));

    // === BIỂU ĐỒ TRÒN: hoàn thành / chưa hoàn thành ===
    // Dựa trên field "status"
    let completed = 0;
    let pending = 0;
    sessions.forEach(session => {
        if (session.status && session.status.toLowerCase() === 'completed') completed++;
        else pending++;
    });

    const pieChartData = [
        { name: 'Hoàn thành', value: completed, fill: '#28a745' },
        { name: 'Chưa hoàn thành', value: pending, fill: '#ffc107' },
    ];

    return { barChartData, pieChartData };
};


    /**
     * Hàm tính toán các chỉ số tổng quan từ dữ liệu ca thi
     * @param {Array} sessions - Mảng dữ liệu ca thi từ API
     */
const calculateSummary = (sessions) => {
    // Chỉ lấy các ca thi có giáo viên là "Phan Thị Trinh"
    const teacherSessions = sessions.filter(s => 
        s.exam_teacher && s.exam_teacher.includes(USER_NAME)
    );

    const today = new Date(todayDate);
    let completedCount = 0;
    let upcomingCount = 0;
    const warningSessions = [];

    teacherSessions.forEach(session => {
        const examDate = new Date(session.exam_date);
        if (examDate < today) completedCount++;
        else upcomingCount++;

        // Cảnh báo: nếu chưa có actual_teacher => có thể bị rỗng / thiếu
        if (!session.actual_teacher1_id && !session.actual_teacher2_id) {
            warningSessions.push(session);
        }
    });

    setSummary({
        userName: USER_NAME,
        totalAssigned: teacherSessions.length,
        totalCompleted: completedCount,
        totalUpcoming: upcomingCount,
        emptyReports: warningSessions.length,
    });

    setEmptyReportsSessions(warningSessions);
    setChartData(transformChartData(teacherSessions));
};

    // --- GỌI API VÀ XỬ LÝ DỮ LIỆU ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/exam-schedule');
                
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }

                const result = await response.json();
                
                if (result && result.data) {
                    const sessions = result.data;
                    setExamSessions(sessions);
                    calculateSummary(sessions); 
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu API:", error);
                setExamSessions([]); 
                setSummary({...initialSummary, userName: USER_NAME}); 
            } finally {
                setLoading(false);
            }
        };
        
        fetchData(); 
    }, []); 

    // Hàm tính giờ kết thúc
    const calculateEndTime = (startTimeStr, durationMinutes) => {
        if (!startTimeStr || !durationMinutes) return "N/A";
        const [h, m, s] = startTimeStr.split(':').map(Number);
        const startDate = new Date(2000, 0, 1, h, m, s);
        startDate.setMinutes(startDate.getMinutes() + durationMinutes);
        const endHour = startDate.getHours().toString().padStart(2, '0');
        const endMinute = startDate.getMinutes().toString().padStart(2, '0');
        return `${endHour}:${endMinute}`;
    };

    // Lọc lịch thi hôm nay
    const todaysSchedule = examSessions.filter(item => item.exam_date === todayDate);

    // --- RENDER ---
    if (loading) {
        return <div className="loading-message">Đang tải dữ liệu...</div>;
    }

    if (examSessions.length === 0 && !loading) {
        return <div className="no-data-message">Không có dữ liệu ca thi nào được tìm thấy.</div>;
    }

    return (
        <div className="dashboard-container">
            {/* HEADER */}
            <div className="header-box">
                <p className="greeting">
                    👋 Xin chào, Thầy/Cô **{summary.userName}**
                </p>
            </div>
            <hr />

            {/* TỔNG QUAN */}
            <section className="summary-section">
                <h2>📊 Tổng quan</h2>
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

            {/* LỊCH THI HÔM NAY */}
            <section className="schedule-section">
                <h2>📅 Lịch thi hôm nay ({todayDate})</h2>
                {todaysSchedule.length === 0 ? (
                    <p>Hôm nay không có ca thi nào được phân công.</p>
                ) : (
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Mã ca</th>
                                <th>Môn học</th>
                                <th>Phòng</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todaysSchedule.map((session) => (
                                <tr key={session.exam_session_id}>
                                    <td>{session.exam_session_id}</td>
                                    <td>{session.subject_name}</td>
                                    <td>**{session.exam_room}**</td>
                                    <td>{session.exam_time ? session.exam_time.substring(0, 5) : 'N/A'}</td>
                                    <td>
                                        {calculateEndTime(session.exam_time, session.exam_duration)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <hr />

            {/* BIỂU ĐỒ VÀ CẢNH BÁO */}
            <h2>📈 Biểu đồ</h2>
            <section className="charts-warnings-section">
                <div className="charts-container">
                    
                    
                    {/* BIỂU ĐỒ 1: Cột (Số ca thi theo tháng) */}
                    <div className="chart-item">
                        <h3 style={{fontSize: '1em'}}>Số ca thi theo tháng</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData.barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Số ca thi" fill="#007bff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* BIỂU ĐỒ 2: Tròn (Tỷ lệ nộp bài / chưa nộp) */}
                    <div className="chart-item">
                        <h3 style={{fontSize: '1em'}}>Tỷ lệ nộp bài / chưa nộp</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartData.pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {chartData.pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CẢNH BÁO */}
                <div className="warnings-container">
                    <h2>⚠️ Cảnh báo</h2>
                    {summary.emptyReports > 0 ? (
                        <div className="warning-box">
                            <p>
                                **{summary.emptyReports}** ca thi có bài rỗng cần kiểm tra lại!
                            </p>
                            {/* Nút bấm đã kết nối với hàm handleViewDetail */}
                            <button className="btn-warning" onClick={handleViewDetail}>
                                Xem chi tiết
                            </button>
                        </div>
                    ) : (
                        <p>Không có cảnh báo nào hiện tại.</p>
                    )}
                </div>
            </section>
            
            {/* PHẦN QUAN TRỌNG NHẤT: RENDER MODAL CÓ ĐIỀU KIỆN */}
           {showWarningDetail && (
  <WarningDetailModal 
      onClose={handleCloseDetail} 
      emptyReportsSessions={emptyReportsSessions} 
  />
)}

            
        </div>
    );
};

export default ExamDashboard;