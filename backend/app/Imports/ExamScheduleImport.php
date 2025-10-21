<?php

namespace App\Imports;

use App\Models\ExamSession;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterImport;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;
use App\Models\Teacher;
use App\Models\UserProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ExamScheduleImport implements ToModel, WithHeadingRow, WithEvents
{
    private $totalRows = 0;
    private $successRows = 0;
    private $newTeachers = 0;

    public function __construct(private $importLogId = null) {}

    public function model(array $row)
    {
        $this->totalRows++;

        try {
            // ✅ Ngày thi
            $examDate = null;
            if (!empty($row['ngay_thi'])) {
                if (is_numeric($row['ngay_thi'])) {
                    $examDate = Date::excelToDateTimeObject($row['ngay_thi'])->format('Y-m-d');
                } else {
                    $examDate = date('Y-m-d', strtotime(str_replace('/', '-', $row['ngay_thi'])));
                }
            }

            if (empty($examDate)) {
                Log::warning("❌ Bỏ qua dòng vì thiếu exam_date", $row);
                return null;
            }

            // ✅ Exam code: nếu trống, tự sinh Lớp HP: 22211CNC12128001
            // Ngày thi: 6/10/2023 → 231006
            // STT: 1
            // => exam_code: 22211CNC12128001-231006-01
            $examCode = $row['ma_lt'] ?? null;
            if (empty($examCode)) {
                $stt = str_pad($row['stt'] ?? 1, 2, '0', STR_PAD_LEFT);
                $classCode = strtoupper($row['lop_hp'] ?? 'XXX');
                $dateCode = !empty($examDate) ? date('ymd', strtotime($examDate)) : '000000';
                $examCode = "{$classCode}-{$dateCode}-{$stt}";
                Log::info("⚡ Tự tạo exam_code: $examCode", $row);
            }


            // ✅ Giờ thi
            $examTime = null;
            if (!empty($row['gio_thi'])) {
                $examTime = str_replace(['h', 'H', '.', ' '], ':', $row['gio_thi']);
                if (preg_match('/^\d{1,2}:\d{2}$/', $examTime)) {
                    $examTime .= ':00';
                }
            }

            // ✅ Giáo viên coi thi
            $teacherNames = [];
            if (!empty($row['cbct'])) {
                $teacherNames = array_map('trim', explode(',', $row['cbct']));
            }

            $teacher1 = $teacherNames[0] ?? null;
            $teacher2 = $teacherNames[1] ?? null;

            // ✅ Tìm hoặc tạo giáo viên
            $teacher1Id = $this->findTeacherIdByFullName($teacher1);
            $teacher2Id = $this->findTeacherIdByFullName($teacher2);

            // ✅ Tạo bản ghi exam session
            $session = new ExamSession([
                'exam_code' => $examCode,
                'class_code'      => $row['lop_hp'] ?? null,
                'subject_name'    => $row['ten_hp'] ?? null,
                'credits'         => $row['so_tc'] ?? null,
                'exam_time'       => $examTime,
                'exam_date'       => $examDate,
                'exam_room'       => $row['phong_thi'] ?? null,
                'student_count'   => $row['so_sv'] ?? null,
                'exam_duration'   => $row['tg_thi'] ?? null,
                'exam_faculty'    => $row['khoa_coi_thi'] ?? null,
                'exam_teacher'    => $row['cbct'] ?? null,
                'assigned_teacher1_id' => $teacher1Id,
                'assigned_teacher2_id' => $teacher2Id,
                'status' => 'Scheduled',
            ]);

            $this->successRows++;
            return $session;
        } catch (\Exception $e) {
            Log::error("❌ Lỗi dòng import: " . json_encode($row) . " - " . $e->getMessage());
            return null;
        }
    }

    private function findTeacherIdByFullName($fullName)
    {
        if (empty($fullName)) return null;

        $teacher = Teacher::whereHas('userProfile', function ($query) use ($fullName) {
            $query->whereRaw("TRIM(CONCAT(user_lastname, ' ', user_firstname)) = ?", [trim($fullName)]);
        })->first();

        if ($teacher) return $teacher->teacher_id;

        return DB::transaction(function () use ($fullName) {
            $nameParts = explode(' ', $fullName);
            $firstName = array_pop($nameParts);
            $lastName = implode(' ', $nameParts);

            $emailSlug = strtolower(str_replace(' ', '.', $fullName)) . '.' . uniqid() . '@tdc.edu.vn';

            $user = User::create([
                'user_name' => $fullName,
                'user_email' => $emailSlug,
                'user_password' => bcrypt('12345678'),
                'user_is_activated' => 1,
            ]);

            $profile = UserProfile::create([
                'user_id' => $user->user_id,
                'user_firstname' => $firstName,
                'user_lastname' => $lastName,
            ]);

            $teacher = Teacher::create([
                'user_profile_id' => $profile->user_profile_id,
            ]);

            $this->newTeachers++;
            Log::info("Tạo giáo viên mới: $fullName");
            return $teacher->teacher_id;
        });
    }

    public function registerEvents(): array
    {
        return [
            AfterImport::class => function () {
                Log::info('✅ Import hoàn tất.', [
                    'Tổng số dòng' => $this->totalRows,
                    'Dòng thành công' => $this->successRows,
                    'Giáo viên mới tạo' => $this->newTeachers,
                ]);
            },
        ];
    }

    public function getTotalRows()
    {
        return $this->totalRows;
    }
    public function getSuccessRows()
    {
        return $this->successRows;
    }
    public function getNewTeachers()
    {
        return $this->newTeachers;
    }
}
