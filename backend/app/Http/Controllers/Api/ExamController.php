<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * Lấy danh sách ca thi (có lọc)
     */
    public function index(Request $request)
    {
        $path = storage_path('app/mock/exams.json');
        if (!file_exists($path)) {
            return response()->json(['error' => 'Mock file not found', 'path' => $path], 404);
        };
        $exams = json_decode(file_get_contents($path), true);

        // Lọc theo phòng
        $room = $request->query('room');
        if ($room) {
            $exams = array_filter($exams, fn($exam) => strtolower($exam['room']) === strtolower($room));
        }

        // Lọc theo ngày
        $date = $request->query('date'); // Ví dụ: $date = "2023-10-06"
        if ($date) {

            try {
                $clientDate = new \DateTime($date);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Invalid date format. Use YYYY-MM-DD.'], 400);
            }

            $exams = array_filter($exams, function ($exam) use ($clientDate) {
                // *** SỬA LỖI Ở ĐÂY ***
                // Đổi từ 'm/d/Y' (Tháng/Ngày/Năm) -> 'd/m/Y' (Ngày/Tháng/Năm)
                // để khớp với file exams.json ("6/10/2023")
                $examDate = \DateTime::createFromFormat('d/m/Y', $exam['Ngày thi']);

                if (!$examDate) {
                    return false;
                }
                return $examDate->format('Y-m-d') === $clientDate->format('Y-m-d');
            });
        }

        return response()->json([
            'message' => $room ? "Danh sách ca thi phòng ($room)" : "Tất cả các ca thi",
            'count' => count($exams),
            'data' => array_values($exams)
        ]);
    }

    /**
     * === HÀM MỚI ĐỂ CẬP NHẬT CBCT ===
     * Xử lý request: PUT /api/exams/{id}
     *
     * @param Request $request
     * @param string $id (Đây là STT từ URL)
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // 1. Validate dữ liệu JavaFX gửi lên (đảm bảo cbct1, cbct2 là chuỗi)
        $validated = $request->validate([
            'cbct1' => 'nullable|string|max:255',
            'cbct2' => 'nullable|string|max:255',
        ]);

        $path = storage_path('app/mock/exams.json');
        if (!file_exists($path)) {
            return response()->json(['error' => 'Mock file not found'], 404);
        }

        $exams = json_decode(file_get_contents($path), true);

        // 2. Ghép 2 tên CBCT lại thành 1 chuỗi để lưu vào JSON
        $newCbct1 = $validated['cbct1'] ?? '';
        $newCbct2 = $validated['cbct2'] ?? '';

        $newCbctString = trim($newCbct1);
        if (!empty($newCbct2)) {
            $newCbctString .= ', ' . trim($newCbct2);
        }

        // 3. Tìm ca thi có STT khớp với $id và cập nhật
        $foundIndex = -1;
        foreach ($exams as $index => &$exam) { // Dùng '&' để tham chiếu (sửa trực tiếp)
            // So sánh STT (là số) với $id (là chuỗi từ URL)
            if ((string)$exam['STT'] === (string)$id) {

                // Cập nhật lại trường "CBCT"
                $exam['CBCT'] = $newCbctString;

                $foundIndex = $index;
                break; // Dừng vòng lặp khi đã tìm thấy
            }
        }
        unset($exam); // Hủy tham chiếu

        // 4. Báo lỗi nếu không tìm thấy
        if ($foundIndex === -1) {
            return response()->json(['error' => "Không tìm thấy ca thi có STT: $id"], 404);
        }

        // 5. Lưu toàn bộ mảng $exams (đã được cập nhật) trở lại file JSON
        // JSON_UNESCAPED_UNICODE rất quan trọng để không mã hóa tên Tiếng Việt
        file_put_contents($path, json_encode($exams, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // 6. Trả về thông báo thành công và ca thi vừa được cập nhật
        return response()->json([
            'message' => "Cập nhật CBCT thành công cho ca thi STT: $id",
            'data' => $exams[$foundIndex] // Trả về đối tượng ca thi đã sửa
        ], 200);
    }
}
