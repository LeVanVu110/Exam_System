<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamSubmission;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExamSubmissionController extends Controller
{
    /**
     * POST /api/exam-collections/upload
     * (Đã sửa tên trường để khớp với JavaFX)
     */
    public function upload(Request $request)
    {
        // 1. Validate chính xác các trường JavaFX sẽ gửi (dùng camelCase)
        $request->validate([
            'examSessionId' => 'required|integer',
            'roomName'      => 'required|string|max:50',
            'examTime'      => 'required|string|max:20',
            'studentCount'  => 'required|integer|min:0',
            'cbct1'         => 'nullable|string|max:100',
            'cbct2'         => 'nullable|string|max:100',
            'notes'         => 'nullable|string',
            'examFile'      => 'required|file|mimes:zip|max:102400', // Tăng lên 100MB
        ]);

        // 2. Xử lý lưu file
        $file = $request->file('examFile');

        // Lấy tên file gốc từ client (vd: "A101_07h30_45.zip")
        $originalFileName = $file->getClientOriginalName();

        // Tạo tên file mới (đã-hash) để lưu trên server, tránh trùng lặp
        // Tên file trên server sẽ là: "exam_collections/Abc123XyZ_A101_07h30_45.zip"
        $hashedName = Str::random(10) . '_' . $originalFileName;
        $filePath = $file->storeAs('exam_collections', $hashedName);

        // 3. Ghi vào database
        // Map từ tên request (camelCase) sang tên cột DB (snake_case)
        $submission = ExamSubmission::create([
            'exam_session_id' => $request->examSessionId,
            'room_name'       => $request->roomName,
            'exam_time'       => $request->examTime,
            'student_count'   => $request->studentCount,
            'collected_by_1'  => $request->cbct1,
            'collected_by_2'  => $request->cbct2,
            'notes'           => $request->notes,
            'file_name'       => $originalFileName, // Lưu tên file gốc
            'file_path'       => $filePath,         // Lưu đường dẫn file đã hash
        ]);

        return response()->json([
            'message' => 'Upload thành công!',
            'data'    => $submission
        ], 201);
    }

    // GET /api/exam/submissions (Hàm này vẫn ổn)
    public function index()
    {
        return response()->json(ExamSubmission::latest()->get());
    }

    // GET /api/exam/download/{id} (Hàm này vẫn ổn)
    public function download($id)
    {
        $submission = ExamSubmission::findOrFail($id);
        $path = $submission->file_path; // ví dụ: 'exam_collections/abc12345_file.zip'

        if (!Storage::exists($path)) {
            return response()->json(['message' => 'File không tồn tại!'], 404);
        }

        // Tự động trả về file download với tên gốc
        return Storage::download($path, $submission->file_name);
    }
}
