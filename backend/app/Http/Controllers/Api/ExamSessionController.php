<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamSession;
use App\Models\ExamImportLog;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ExamScheduleExport;
use App\Imports\ExamScheduleImport;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ExamSessionController extends Controller
{
    // 📄 Import file Excel
    public function importExcel(Request $request)
    {
        // (Tùy chọn) Kiểm tra quyền Upload
        if (!$request->user()->hasAccess('EXAM_SCHEDULE', 'is_upload')) {
            return response()->json(['message' => 'Bạn không có quyền tải lên dữ liệu!'], 403);
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();

            $importLog = ExamImportLog::create([
                'file_name' => $fileName,
                'imported_by' => Auth::id(),
                'total_rows' => 0,
                'success_rows' => 0,
                'import_status' => 'processing',
            ]);

            $import = new ExamScheduleImport($importLog->id);
            Excel::import($import, $file);

            $importLog->update([
                'total_rows' => $import->getTotalRows(),
                'success_rows' => $import->getSuccessRows(),
                'import_status' => 'completed'
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Import thành công',
                'total_rows' => $import->getTotalRows(),
                'success_rows' => $import->getSuccessRows(),
                'new_teachers' => $import->getNewTeachers(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 📅 Danh sách kỳ thi
    public function index(Request $request)
    {
        // (Tùy chọn) Kiểm tra quyền Xem
        // if (!$request->user()->hasAccess('EXAM_SCHEDULE', 'is_view')) {
        //     return response()->json(['message' => 'Bạn không có quyền xem danh sách này!'], 403);
        // }

        $query = ExamSession::query()
            ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
            ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
            ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
            ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
            ->select(
                'exam_sessions.*',
                DB::raw("CONCAT(up1.user_lastname, ' ', up1.user_firstname) as teacher1_name"),
                DB::raw("CONCAT(up2.user_lastname, ' ', up2.user_firstname) as teacher2_name")
            );

        // ✅ Lọc theo khoảng ngày
        if ($request->from) {
            $query->whereDate('exam_date', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('exam_date', '<=', $request->to);
        }

        // ✅ Lọc theo mã lớp (cho phép tìm gần đúng)
        if ($request->class_code) {
            $query->where('class_code', 'LIKE', '%' . $request->class_code . '%');
        }

        $sessions = $query->orderBy('exam_date', 'desc')->get();

        return response()->json(['data' => $sessions]);
    }

    public function todayExams()
    {
        try {
            // 🗓️ Lấy ngày hôm nay (dạng YYYY-MM-DD)
            $today = now()->toDateString();

            // 🔍 Lấy danh sách ca thi của ngày hôm nay
            $sessions = \App\Models\ExamSession::query()
                ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
                ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
                ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
                ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
                ->select(
                    'exam_sessions.*',
                    DB::raw("CONCAT(up1.user_lastname, ' ', up1.user_firstname) as teacher1_name"),
                    DB::raw("CONCAT(up2.user_lastname, ' ', up2.user_firstname) as teacher2_name")
                )
                ->whereDate('exam_date', $today)
                ->orderBy('exam_time', 'asc')
                ->get();

            $count = $sessions->count();

            return response()->json([
                'success' => true,
                'message' => "Danh sách ca thi trong ngày {$today}",
                'date' => $today,
                'count' => $count,
                'data' => $sessions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách ca thi hôm nay.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function searchByRoom(Request $request)
    {
        try {

            $room = $request->query('room');

            $today = now()->toDateString(); // 🗓️ Ngày hiện tại (vd: 2025-11-12)

            $sessions = \App\Models\ExamSession::query()
                ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
                ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
                ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
                ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
                ->select(
                    'exam_sessions.*',
                    DB::raw("CONCAT(up1.user_lastname, ' ', up1.user_firstname) as teacher1_name"),
                    DB::raw("CONCAT(up2.user_lastname, ' ', up2.user_firstname) as teacher2_name")
                )
                ->whereDate('exam_date', $today) // ✅ Chỉ lấy các ca thi của hôm nay
                ->when($room, function ($query, $room) {
                    $query->where('exam_room', 'LIKE', '%' . $room . '%');
                })
                ->orderBy('exam_time', 'asc')
                ->get();

            $count = $sessions->count();

            return response()->json([
                'success' => true,
                'message' => "Kết quả tìm kiếm phòng thi '{$room}' trong ngày {$today}",
                'date' => $today,
                'count' => $count,
                'data' => $sessions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm phòng thi trong ngày hôm nay.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function show($id)
    {
        try {
            $session = \App\Models\ExamSession::query()
                ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
                ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
                ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
                ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
                ->select(
                    'exam_sessions.*',
                    DB::raw("CONCAT(up1.user_lastname, ' ', up1.user_firstname) as teacher1_name"),
                    DB::raw("CONCAT(up2.user_lastname, ' ', up2.user_firstname) as teacher2_name")
                )
                ->where('exam_sessions.exam_session_id', $id)
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy ca thi.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Chi tiết ca thi.',
                'data' => $session
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy chi tiết ca thi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 📤 Xuất file Excel (ĐÃ THÊM CHẶN QUYỀN)
    public function exportExcel(Request $request)
    {
        // 🔒 CHECK QUYỀN DOWNLOAD
        // 'EXAM_SCHEDULE': Mã màn hình trong DB (hãy đảm bảo nó khớp với bảng permissions)
        if (!$request->user()->hasAccess('EXAM_SCHEDULE', 'is_download')) {
            return response()->json(['message' => 'Bạn không có quyền tải xuống dữ liệu này!'], 403);
        }

        // Kiểm tra ngày nhập hợp lệ
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from = $request->query('from');
        $to = $request->query('to');

        // Tạo tên file có ngày giờ xuất cho dễ quản lý
        $filename = 'lich_thi_' . now()->format('Ymd_His') . '.xlsx';

        // Xuất file Excel
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ExamScheduleExport($from, $to),
            $filename
        );
    }


    // 🧾 Xuất báo cáo PDF (ĐÃ THÊM CHẶN QUYỀN)
    public function exportReport($exam_session_id)
    {
        // 🔒 CHECK QUYỀN DOWNLOAD
        // Vì hàm này không có Request $request được inject, ta dùng helper request() hoặc Auth::user()
        $user = request()->user() ?? Auth::user();

        if (!$user || !$user->hasAccess('EXAM_SCHEDULE', 'is_download')) {
            return response()->json(['message' => 'Bạn không có quyền tải xuống báo cáo này!'], 403);
        }

        $exam = ExamSession::with(['course', 'assignedTeacher1', 'assignedTeacher2'])->findOrFail($exam_session_id);
        $pdf = Pdf::loadView('reports.exam_result', compact('exam'));
        return $pdf->download('bao_cao_ky_thi_' . $exam->exam_code . '.pdf');
    }

    // 🗑️ Xóa 1 kỳ thi
    public function destroy($id)
    {
        // (Tùy chọn) Kiểm tra quyền Xóa
        if (!request()->user()->hasAccess('EXAM_SCHEDULE', 'is_delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa dữ liệu này!'], 403);
        }

        try {
            $exam = ExamSession::find($id);

            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy kỳ thi cần xóa.'
                ], 404);
            }

            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa kỳ thi thành công.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa kỳ thi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🧹 Xóa hàng loạt kỳ thi
    public function deleteBulk(Request $request)
    {
        // (Tùy chọn) Kiểm tra quyền Xóa
        if (!$request->user()->hasAccess('EXAM_SCHEDULE', 'is_delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa dữ liệu này!'], 403);
        }

        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có ID nào được gửi lên.'
                ], 400);
            }

            DB::beginTransaction();
            $deleted = ExamSession::whereIn('exam_session_id', $ids)->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$deleted} kỳ thi thành công.",
                'deleted_count' => $deleted
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa hàng loạt kỳ thi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // vu_one_test

    public function saveImported(Request $request)
    {
        $data = $request->all();

        ExamSession::truncate();

        // Lưu dữ liệu mới
        foreach ($data as $item) {
            // 1. Lấy ID trực tiếp (từ cột ẩn khi Export, nếu có)
            $teacher1Id = $item['assigned_teacher1_id'] ?? null;
            $teacher2Id = $item['assigned_teacher2_id'] ?? null;

            // 2. Nếu ID bị null, tìm kiếm bằng tên (dùng hàm đã tạo)
            if (is_null($teacher1Id) || empty($teacher1Id)) {
                $teacher1Name = $item['teacher1_name'] ?? null;
                $teacher1Id = $this->findTeacherIdByName($teacher1Name);
            }

            if (is_null($teacher2Id) || empty($teacher2Id)) {
                $teacher2Name = $item['teacher2_name'] ?? null;
                $teacher2Id = $this->findTeacherIdByName($teacher2Name);
            }

            // Ánh xạ các trường
            $courseCode = $item['course']['course_code'] ?? ($item['exam_code'] ?? null);
            $subjectName = $item['course']['course_name'] ?? ($item['subject_name'] ?? null);

            ExamSession::create([
                'exam_session_id' => $item['exam_session_id'] ?? null,
                'exam_code' => $courseCode,
                'exam_name' => $item['exam_name'] ?? $subjectName,
                'subject_name' => $subjectName,
                'exam_date' => $item['exam_date'],
                'exam_start_time' => $item['exam_start_time'],
                'exam_end_time' => $item['exam_end_time'],
                'exam_room' => $item['exam_room'],

                // 🔥 LƯU ID GIẢNG VIÊN ĐÃ XỬ LÝ (Có thể là ID cũ hoặc ID mới tìm được)
                'assigned_teacher1_id' => $teacher1Id,
                'assigned_teacher2_id' => $teacher2Id,

                'status' => $item['status'] ?? 'Scheduled',

                // Các trường khác
                'class_code' => $item['class_code'] ?? null,
                'credits' => $item['credits'] ?? null,
                // ...
            ]);
        }

        return response()->json(['message' => 'Data saved successfully']);
    }
    private function findTeacherIdByName($fullName)
    {
        if (empty($fullName)) {
            return null;
        }

        // Bước 1: Phân tích Tên và Họ
        // Giả định format tên trong file Excel là: [Họ] [Tên] (Ví dụ: Rosenbaum Raphaelle)
        $parts = explode(' ', trim($fullName));

        // Lấy tên (phần tử cuối cùng)
        $firstName = array_pop($parts);

        // Lấy họ (các phần còn lại)
        $lastName = implode(' ', $parts);

        // Bước 2: Tìm kiếm trong DB bằng cách JOIN UserProfile và Teacher
        $teacher = DB::table('user_profiles as up')
            ->join('teachers as t', 'up.user_profile_id', '=', 't.user_profile_id')
            ->where('up.user_firstname', $firstName)
            ->where('up.user_lastname', $lastName)
            ->select('t.teacher_id')
            ->first();

        return $teacher->teacher_id ?? null;
    }
}
