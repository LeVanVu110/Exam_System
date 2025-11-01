<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $path = storage_path('app/mock/exams.json');
        if (!file_exists($path)) {
            return response()->json(['error' => 'Mock file not found', 'path' => $path], 404);
        };
        $exams = json_decode(file_get_contents($path), true);

        $room = $request->query('room');
        if ($room) {
            $exams = array_filter($exams, fn($exam) => strtolower($exam['room']) === strtolower($room));
        }
        $date = $request->query('date'); // Ví dụ: $date = "2025-10-25"
        if ($date) {

            // Chuyển ngày từ client (Y-m-d) thành đối tượng DateTime
            try {
                $clientDate = new \DateTime($date);
            } catch (\Exception $e) {
                // Xử lý nếu client gửi định dạng ngày bậy
                return response()->json(['error' => 'Invalid date format. Use YYYY-MM-DD.'], 400);
            }

            $exams = array_filter($exams, function ($exam) use ($clientDate) {
                // Giả sử ngày trong JSON của bạn là "d/m/Y" (ví dụ: 25/10/2025)
                // Nếu định dạng trong JSON khác, hãy đổi "d/m/Y" ở đây
                $examDate = \DateTime::createFromFormat('m/d/Y', $exam['Ngày thi']);

                // Nếu $examDate không hợp lệ (ví dụ: N/A), bỏ qua
                if (!$examDate) {
                    return false;
                }

                // So sánh 2 ngày sau khi đã chuẩn hóa
                return $examDate->format('Y-m-d') === $clientDate->format('Y-m-d');
            });
        }

        return response()->json([
            'message' => $room ? "Danh sách ca thi phòng ($room)" : "Tất cả các ca thi",
            'count' => count($exams),
            'data' => array_values($exams)
        ]);
    }
}
