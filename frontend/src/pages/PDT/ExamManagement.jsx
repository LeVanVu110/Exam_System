import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ExamManagement() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]); // luôn khởi tạo là []
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    // 🔍 Hàm tìm kiếm
    const handleSearch = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/exam-sessions", { params: { from, to } });
            console.log("Dữ liệu nhận được:", res.data);

            // kiểm tra dữ liệu trả về có đúng định dạng không
            const fetchedData = Array.isArray(res.data.data) ? res.data.data : [];
            setData(fetchedData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            setData([]);
        }
    };

    // 📤 Import file Excel
    const handleImport = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Vui lòng chọn file trước khi import!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            await axios.post("http://localhost:8000/api/exam-sessions/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Import thành công!");
            handleSearch(); // load lại dữ liệu
        } catch (error) {
            console.error("🔥 Chi tiết lỗi import:", error.response?.data || error.message || error);
            alert("Import thất bại! Xem console để biết chi tiết.");
        }
    };

    // 📦 Xuất file Excel
    const handleExport = () => {
        window.location.href = `/api/exam-sessions/export?from=${from}&to=${to}`;
    };

    // 🔁 Gọi khi component mount
    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">📘 Quản lý kỳ thi (Phòng Đào Tạo)</h1>

            {/* 🔎 Bộ lọc tìm kiếm */}
            <div className="flex gap-4 mb-4">
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Tìm kiếm
                </button>
                <button
                    onClick={handleExport}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Xuất Excel
                </button>
            </div>

            {/* 📂 Import Excel */}
            <form onSubmit={handleImport} className="flex items-center gap-3 mb-6">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button
                    type="submit"
                    className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                    Import Excel
                </button>
            </form>

            {/* 📋 Bảng dữ liệu */}
            <table className="min-w-full border border-gray-300 shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 border text-left">Mã ca thi</th>
                        <th className="p-3 border text-left">Tên kỳ thi</th>
                        <th className="p-3 border text-left">Mã lớp</th>
                        <th className="p-3 border text-left">Môn học</th>
                        <th className="p-3 border text-left">Ngày thi</th>
                        <th className="p-3 border text-left">Giờ bắt đầu</th>
                        <th className="p-3 border text-left">Giờ kết thúc</th>
                        <th className="p-3 border text-left">Phòng thi</th>
                        <th className="p-3 border text-left">Tổng SV</th>
                        <th className="p-3 border text-left">Tổng máy</th>
                        <th className="p-3 border text-left">GV phân công 1</th>
                        <th className="p-3 border text-left">GV phân công 2</th>
                        <th className="p-3 border text-left">GV thực tế 1</th>
                        <th className="p-3 border text-left">GV thực tế 2</th>
                        <th className="p-3 border text-left">Tình trạng</th>
                        <th className="p-3 border text-left">Số tín chỉ</th>
                        <th className="p-3 border text-left">Lớp sinh viên</th>
                        <th className="p-3 border text-left">Ca thi</th>
                        <th className="p-3 border text-left">Số lượng SV</th>
                        <th className="p-3 border text-left">Thời lượng (phút)</th>
                        <th className="p-3 border text-left">Hình thức thi</th>
                        <th className="p-3 border text-left">Khoa</th>
                        <th className="p-3 border text-left">Bậc đào tạo</th>
                        <th className="p-3 border text-left">Hệ đào tạo</th>
                        <th className="p-3 border text-left">Đợt thi</th>
                        <th className="p-3 border text-left">Giảng viên</th>
                        <th className="p-3 border text-left">Ngày tạo</th>
                        <th className="p-3 border text-left">Kết quả</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(data) && data.length > 0 ? (
                        data.map((item) => (
                            <tr key={item.exam_session_id} className="hover:bg-gray-50">
                                <td className="border p-2">{item.exam_code}</td>
                                <td className="border p-2">{item.exam_name}</td>
                                <td className="border p-2">{item.class_code}</td>
                                <td className="border p-2">{item.subject_name}</td>
                                <td className="border p-2">{item.exam_date}</td>
                                <td className="border p-2">{item.exam_start_time}</td>
                                <td className="border p-2">{item.exam_end_time}</td>
                                <td className="border p-2">{item.exam_room}</td>
                                <td className="border p-2 text-center">{item.total_students}</td>
                                <td className="border p-2 text-center">{item.total_computers}</td>
                                <td className="border p-2">{item.teacher1_name}</td>
                                <td className="border p-2">{item.teacher2_name}</td>
                                <td className="border p-2">{item.actual_teacher1_id}</td>
                                <td className="border p-2">{item.actual_teacher2_id}</td>
                                <td className="border p-2">{item.status}</td>
                                <td className="border p-2">{item.credits}</td>
                                <td className="border p-2">{item.student_class}</td>
                                <td className="border p-2">{item.exam_time}</td>
                                <td className="border p-2 text-center">{item.student_count}</td>
                                <td className="border p-2 text-center">{item.exam_duration}</td>
                                <td className="border p-2">{item.exam_method}</td>
                                <td className="border p-2">{item.exam_faculty}</td>
                                <td className="border p-2">{item.education_level}</td>
                                <td className="border p-2">{item.training_system}</td>
                                <td className="border p-2">{item.exam_batch}</td>
                                <td className="border p-2">
                                    {item.exam_teacher
                                        ? item.exam_teacher.split(",")[0]?.trim()
                                        : item.assigned_teacher1_id || ""}
                                </td>
                                <td className="border p-2">
                                    {item.exam_teacher
                                        ? item.exam_teacher.split(",")[1]?.trim()
                                        : item.assigned_teacher2_id || ""}
                                </td>

                                <td className="border p-2">{item.created_at}</td>
                                <td className="border p-2">
                                    <a
                                        href={`/api/exam-sessions/${item.exam_session_id}/report`}
                                        className="text-blue-600 underline"
                                    >
                                        Xuất PDF
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="28" className="text-center p-4 text-gray-500">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
