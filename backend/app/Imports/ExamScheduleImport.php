<?php

namespace App\Imports;

use App\Models\ExamSession;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;
use App\Models\Teacher;


class ExamScheduleImport implements ToModel, WithHeadingRow
{
    private $totalRows = 0;
    private $successRows = 0;

    public function __construct(private $importLogId = null) {}

    public function model(array $row)
    {
        $this->totalRows++;

        try {
            // ✅ Xử lý định dạng ngày
            $examDate = null;
            if (!empty($row['ngay_thi'])) {
                if (is_numeric($row['ngay_thi'])) {
                    // Nếu là dạng số Excel
                    $examDate = Date::excelToDateTimeObject($row['ngay_thi'])->format('Y-m-d');
                } else {
                    // Nếu là chuỗi (vd: 15/5/2023)
                    $examDate = date('Y-m-d', strtotime(str_replace('/', '-', $row['ngay_thi'])));
                }
            }

            // ✅ Xử lý định dạng giờ
            $examTime = null;
            if (!empty($row['gio_thi'])) {
                $examTime = str_replace(['h', 'H', '.', ' '], ':', $row['gio_thi']);
                // thêm :00 nếu thiếu giây
                if (preg_match('/^\d{1,2}:\d{2}$/', $examTime)) {
                    $examTime .= ':00';
                }
            }

            // Lấy tên giáo viên và tách theo dấu phẩy
            $teacherNames = explode(',', $row['exam_teacher']);
            $teacher1 = isset($teacherNames[0]) ? trim($teacherNames[0]) : null;
            $teacher2 = isset($teacherNames[1]) ? trim($teacherNames[1]) : null;

            // Tìm ID giáo viên trong bảng teachers
            $teacher1Id = Teacher::where('teacher_name', $teacher1)->value('teacher_id');
            $teacher2Id = Teacher::where('teacher_name', $teacher2)->value('teacher_id');

            $session = new ExamSession([
                'exam_code'       => $row['ma_lt'] ?? null,
                'class_code'      => $row['lop_hp'] ?? null,
                'subject_name'    => $row['ten_hp'] ?? null,
                'credits'         => $row['so_tc'] ?? null,
                'student_class'   => $row['lop_sv'] ?? null,
                'exam_time'       => $examTime,
                'exam_date'       => $examDate,
                'exam_room'       => $row['phong_thi'] ?? null,
                'student_count'   => $row['so_sv'] ?? null,
                'exam_duration'   => $row['tg_thi'] ?? null,
                'exam_method'     => $row['ht_thi'] ?? null,
                'exam_faculty'    => $row['khoa_coi_thi'] ?? null,
                'education_level' => $row['bac_dt'] ?? null,
                'training_system' => $row['he_dt'] ?? null,
                'exam_batch'      => $row['dot_thi'] ?? null,
                'exam_teacher'    => $row['cbct'] ?? null,
                'assigned_teacher1_id' => $teacher1Id,
                'assigned_teacher2_id' => $teacher2Id,
            ]);

            $this->successRows++;
            return $session;
        } catch (\Exception $e) {
            // 👉 Ghi log chi tiết nếu muốn debug
            Log::error('Import error row: ' . $e->getMessage());
            return null; // bỏ qua dòng lỗi
        }
    }

    public function getTotalRows()
    {
        return $this->totalRows;
    }
    public function getSuccessRows()
    {
        return $this->successRows;
    }
}
