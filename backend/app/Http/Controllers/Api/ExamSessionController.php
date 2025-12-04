<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamSession;
use App\Models\ExamImportLog;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ExamScheduleExport;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\Teacher;
use App\Imports\ExamScheduleImport;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ExamSessionController extends Controller
{
    // ✅ 1. IMPORT EXCEL
    public function importExcel(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        if (!$request->user()->hasAccess('EXAM_MGT', 'is_upload')) {
            return response()->json(['message' => 'Bạn không có quyền tải lên dữ liệu!'], 403);
        }

        $request->validate(['file' => 'required|mimes:xlsx,xls']);

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

            $data = Excel::toArray(new ExamScheduleImport($importLog->id), $file);
            $rows = $data[0] ?? [];

            $successCount = 0;
            $newTeachers = 0;

            if (count($rows) > 0) {
                // Cache Giáo viên
                $existingTeachersMap = DB::table('user_profiles')
                    ->join('teachers', 'user_profiles.user_profile_id', '=', 'teachers.user_profile_id')
                    ->select(DB::raw("LOWER(TRIM(CONCAT(COALESCE(user_lastname, ''), ' ', COALESCE(user_firstname, '')))) as full_name"), 'teachers.teacher_id')
                    ->get()
                    ->pluck('teacher_id', 'full_name')
                    ->toArray();

                // Chuẩn bị mã User
                $lastUser = User::select('user_code')
                    ->where('user_code', 'LIKE', 'U%')
                    ->orderByRaw('CAST(SUBSTRING(user_code, 2) AS UNSIGNED) DESC')
                    ->first();
                $nextUserCodeInt = $lastUser ? (int)substr($lastUser->user_code, 1) + 1 : 1;

                foreach ($rows as $index => $row) {
                    try {
                        if (empty($row['lop_hp']) && empty($row['ma_hp']) && empty($row['ma_mon']) && empty($row['exam_code'])) continue;

                        // --- XỬ LÝ GIẢNG VIÊN ---
                        $rawTeachers = $row['cbct'] ?? ($row['can_bo_coi_thi_1'] ?? ($row['giam_thi_1'] ?? ''));
                        $teacherNames = [];

                        if (!empty($rawTeachers)) {
                            $teacherNames = array_map('trim', explode(',', $rawTeachers));
                        }
                        if (empty($teacherNames)) {
                            if (!empty($row['can_bo_coi_thi_1'])) $teacherNames[] = trim($row['can_bo_coi_thi_1']);
                            if (!empty($row['can_bo_coi_thi_2'])) $teacherNames[] = trim($row['can_bo_coi_thi_2']);
                        }

                        $t1Name = $teacherNames[0] ?? null;
                        $teacher1Id = $this->resolveTeacherId($t1Name, $existingTeachersMap, $nextUserCodeInt, $newTeachers);

                        $t2Name = $teacherNames[1] ?? null;
                        $teacher2Id = $this->resolveTeacherId($t2Name, $existingTeachersMap, $nextUserCodeInt, $newTeachers);

                        // --- XỬ LÝ THỜI GIAN ---
                        $startTimeValue = $row['gio_thi'] ?? ($row['bat_dau'] ?? ($row['gio'] ?? null));
                        $duration = (int)($row['tg_thi'] ?? ($row['thoi_luong'] ?? 90));
                        $startTimeFormatted = $this->transformTime($startTimeValue);

                        try {
                            $startTimeObj = Carbon::createFromFormat('H:i:s', $startTimeFormatted);
                            $endTimeObj = $startTimeObj->copy()->addMinutes($duration);
                            $endTimeFormatted = $endTimeObj->format('H:i:s');
                        } catch (\Exception $e) {
                            $endTimeFormatted = '00:00:00';
                        }

                        // --- XỬ LÝ TRÙNG MÃ ---
                        $baseExamCode = substr(trim($row['lop_hp'] ?? ($row['ma_hp'] ?? $row['ma_mon'])), 0, 40);
                        $finalExamCode = $baseExamCode;

                        $counter = 1;
                        while (ExamSession::where('exam_code', $finalExamCode)->exists()) {
                            $counter++;
                            $suffix = '-' . $counter;
                            if (strlen($baseExamCode) + strlen($suffix) > 50) {
                                $baseExamCode = substr($baseExamCode, 0, 50 - strlen($suffix));
                            }
                            $finalExamCode = $baseExamCode . $suffix;
                        }

                        // 👉 INSERT
                        ExamSession::create([
                            'exam_code'       => $finalExamCode,
                            'exam_name'       => $this->safeSubstr($row['ten_hp'] ?? ($row['ten_mon'] ?? 'Chưa có tên'), 255),
                            'subject_name'    => $this->safeSubstr($row['ten_hp'] ?? ($row['ten_mon'] ?? 'Chưa có tên'), 255),
                            'exam_date'       => $this->transformDate($row['ngay_thi'] ?? ($row['ngay'] ?? null)),

                            // Lưu giờ chuẩn xác
                            'exam_time'       => $startTimeFormatted,
                            'exam_start_time' => $startTimeFormatted,
                            'exam_end_time'   => $endTimeFormatted,

                            'exam_duration'   => $duration,
                            'exam_room'       => $this->safeSubstr($row['phong_thi'] ?? ($row['phong'] ?? null), 50),
                            'class_code'      => $this->safeSubstr($row['lop_hp'] ?? ($row['ma_lop'] ?? null), 50),
                            'student_count'   => $row['so_sv'] ?? ($row['sl_sv'] ?? 0),
                            'exam_faculty'    => $this->safeSubstr($row['khoa_coi_thi'] ?? null, 100),
                            'assigned_teacher1_id' => $teacher1Id,
                            'assigned_teacher2_id' => $teacher2Id,
                            'status'               => 'Đã lên lịch',
                        ]);

                        $successCount++;
                    } catch (\Exception $e) {
                        throw new \Exception("Lỗi tại dòng số " . ($index + 2) . ": " . $e->getMessage());
                    }
                }
            }

            $importLog->update([
                'total_rows' => count($rows),
                'success_rows' => $successCount,
                'import_status' => 'completed'
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Import thành công',
                'total_rows' => count($rows),
                'success_rows' => $successCount,
                'new_teachers_created' => $newTeachers,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // 🛠️ Helper MỚI: Xử lý giờ thông minh
    private function transformTime($value)
    {
        if (empty($value)) return '07:00:00';
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('H:i:s');
            }
            $value = trim($value);
            $value = preg_replace('/[hgp]/i', ':', $value);
            $value = preg_replace('/[^0-9:]/', '', $value);
            if (is_numeric($value)) {
                $value .= ':00';
            }
            return Carbon::parse($value)->format('H:i:s');
        } catch (\Exception $e) {
            return '07:00:00';
        }
    }

    private function safeSubstr($string, $length) {
        if (empty($string)) return '';
        return mb_substr($string, 0, $length, 'UTF-8');
    }

    private function resolveTeacherId($fullName, &$map, &$nextCodeInt, &$newCount)
    {
        if (empty($fullName)) return null;
        $key = mb_strtolower(trim($fullName), 'UTF-8');
        if (isset($map[$key])) return $map[$key];

        $parts = explode(' ', trim($fullName));
        if (count($parts) < 2) {
             $firstName = $fullName;
             $lastName = '';
        } else {
            $firstName = array_pop($parts);
            $lastName = implode(' ', $parts);
        }

        $newUserCode = 'U' . str_pad($nextCodeInt++, 4, '0', STR_PAD_LEFT);
        $nameSlug = Str::slug($firstName . $lastName);
        $usernameStub = substr($nameSlug, 0, 15);
        $finalUsername = $usernameStub . rand(100, 999);
        $emailSlug = substr($nameSlug, 0, 30) . rand(100, 999) . '@fe.edu.vn';

        $user = User::forceCreate([
            'user_code' => $newUserCode,
            'user_name' => $finalUsername,
            'user_email' => $emailSlug,
            'user_password' => Hash::make('123456'),
            'user_is_activated' => 1,
        ]);

        $userProfile = UserProfile::forceCreate([
            'user_id' => $user->user_id,
            'user_firstname' => $this->safeSubstr($firstName, 50),
            'user_lastname' => $this->safeSubstr($lastName, 50),
        ]);

        $teacher = Teacher::forceCreate([
            'user_profile_id' => $userProfile->user_profile_id,
        ]);

        $map[$key] = $teacher->teacher_id;
        $newCount++;
        return $teacher->teacher_id;
    }

    private function transformDate($value, $format = 'Y-m-d')
    {
        if (empty($value)) return null;
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format($format);
            }
            return date($format, strtotime(str_replace('/', '-', $value)));
        } catch (\Exception $e) {
            return null;
        }
    }

    // --- CÁC HÀM CƠ BẢN KHÁC ---

    public function index(Request $request)
    {
        $query = ExamSession::query()
            ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
            ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
            ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
            ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
            ->select(
                'exam_sessions.*',
                DB::raw("TRIM(CONCAT(COALESCE(up1.user_lastname, ''), ' ', COALESCE(up1.user_firstname, ''))) as teacher1_name"),
                DB::raw("TRIM(CONCAT(COALESCE(up2.user_lastname, ''), ' ', COALESCE(up2.user_firstname, ''))) as teacher2_name")
            );

        if ($request->from) $query->whereDate('exam_date', '>=', $request->from);
        if ($request->to) $query->whereDate('exam_date', '<=', $request->to);
        if ($request->class_code) $query->where('class_code', 'LIKE', '%' . $request->class_code . '%');

        return response()->json(['data' => $query->orderBy('exam_date', 'desc')->get()]);
    }

    public function todayExams()
    {
        try {
            $today = now()->toDateString();
            $sessions = ExamSession::query()
                ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
                ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
                ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
                ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
                ->select(
                    'exam_sessions.*',
                    DB::raw("TRIM(CONCAT(COALESCE(up1.user_lastname, ''), ' ', COALESCE(up1.user_firstname, ''))) as teacher1_name"),
                    DB::raw("TRIM(CONCAT(COALESCE(up2.user_lastname, ''), ' ', COALESCE(up2.user_firstname, ''))) as teacher2_name")
                )
                ->whereDate('exam_date', $today)
                ->orderBy('exam_time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => "Danh sách ca thi hôm nay {$today}",
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function searchByRoom(Request $request)
    {
        try {
            $room = $request->query('room');
            $today = now()->toDateString();
            $sessions = ExamSession::query()
                ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
                ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
                ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
                ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
                ->select(
                    'exam_sessions.*',
                    DB::raw("TRIM(CONCAT(COALESCE(up1.user_lastname, ''), ' ', COALESCE(up1.user_firstname, ''))) as teacher1_name"),
                    DB::raw("TRIM(CONCAT(COALESCE(up2.user_lastname, ''), ' ', COALESCE(up2.user_firstname, ''))) as teacher2_name")
                )
                ->whereDate('exam_date', $today)
                ->when($room, function ($query, $room) {
                    $query->where('exam_room', 'LIKE', '%' . $room . '%');
                })
                ->orderBy('exam_time', 'asc')
                ->get();

            return response()->json(['success' => true, 'data' => $sessions]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $session = ExamSession::find($id);
        if (!$session) return response()->json(['success' => false, 'message' => 'Không tìm thấy'], 404);
        return response()->json(['success' => true, 'data' => $session]);
    }

    public function destroy($id)
    {
        if (!request()->user()->hasAccess('EXAM_MGT', 'is_delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa!'], 403);
        }
        $exam = ExamSession::find($id);
        if ($exam) {
            $exam->delete();
            return response()->json(['success' => true, 'message' => 'Đã xóa thành công']);
        }
        return response()->json(['success' => false, 'message' => 'Không tìm thấy'], 404);
    }

    public function deleteBulk(Request $request)
    {
        if (!$request->user()->hasAccess('EXAM_MGT', 'is_delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa!'], 403);
        }
        $ids = $request->input('ids', []);
        ExamSession::whereIn('exam_session_id', $ids)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa hàng loạt thành công']);
    }

    public function exportExcel(Request $request)
    {
        if (!$request->user()->hasAccess('EXAM_MGT', 'is_download')) return response()->json(['message' => 'Không có quyền!'], 403);
        return Excel::download(new ExamScheduleExport($request->from, $request->to), 'lich_thi.xlsx');
    }

    // ✅ CẬP NHẬT: Hàm Xuất PDF sử dụng Query Builder và Object Casting
    public function exportReport($id)
    {
        $user = request()->user() ?? Auth::user();
        if (!$user || !$user->hasAccess('EXAM_MGT', 'is_download')) return response()->json(['message' => 'Không có quyền!'], 403);

        $exam = ExamSession::find($id);
        if (!$exam) return response()->json(['message' => 'Không tìm thấy ca thi!'], 404);

        // 1. Lấy tên GV thủ công để chắc chắn có dữ liệu
        // Lộ trình: assigned_teacher_id -> teachers table -> user_profiles table
        $t1 = $this->getTeacherName($exam->assigned_teacher1_id);
        $t2 = $this->getTeacherName($exam->assigned_teacher2_id);

        // 2. Chuyển đổi Model thành Array/Object để dễ dàng thêm thuộc tính
        $examData = $exam->toArray();

        // Thêm các trường tên giáo viên vào
        $examData['teacher1_name'] = $t1;
        $examData['teacher2_name'] = $t2;

        // Tạo chuỗi danh sách giáo viên
        $teachersArr = array_filter([$t1, $t2]);
        $teacherStr = !empty($teachersArr) ? implode(', ', $teachersArr) : "---";

        $examData['teacher_names'] = $teacherStr;
        $examData['teachers']      = $teacherStr; // Alias cho view
        $examData['invigilators']  = $teacherStr; // Alias cho view

        // 3. Format Thời gian
        try {
            $start = $exam->exam_start_time ? Carbon::parse($exam->exam_start_time)->format('H:i') : '';
            $end   = $exam->exam_end_time ? Carbon::parse($exam->exam_end_time)->format('H:i') : '';
            $date  = $exam->exam_date ? Carbon::parse($exam->exam_date)->format('d/m/Y') : '';
            $timeStr = $start . ($end ? ' - ' . $end : '');
        } catch (\Exception $e) {
            $timeStr = $exam->exam_start_time;
            $date = $exam->exam_date;
        }

        $examData['formatted_time'] = $timeStr;
        $examData['formatted_date'] = $date;
        $examData['exam_time']      = $timeStr; // Alias cho view

        // 4. Truyền object (cast từ array) sang View PDF
        $pdf = Pdf::loadView('reports.exam_result', ['exam' => (object)$examData]);
        return $pdf->download('bao_cao_ky_thi_' . $exam->exam_code . '.pdf');
    }

    // 🛠️ Helper: Truy vấn tên giáo viên thủ công (Query Builder)
    private function getTeacherName($teacherId)
    {
        if (!$teacherId) return '';

        $profile = DB::table('teachers')
            ->join('user_profiles', 'teachers.user_profile_id', '=', 'user_profiles.user_profile_id')
            ->where('teachers.teacher_id', $teacherId)
            ->select(DB::raw("TRIM(CONCAT(COALESCE(user_lastname,''), ' ', COALESCE(user_firstname,''))) as full_name"))
            ->first();

        return $profile ? $profile->full_name : '';
    }

    public function saveImported(Request $request) {
        return response()->json(['message' => 'Logic đã được chuyển sang importExcel']);
    }
}
