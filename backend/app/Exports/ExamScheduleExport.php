<?php

namespace App\Exports;

use App\Models\ExamSession;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExamScheduleExport implements FromCollection, WithHeadings, WithMapping, WithColumnWidths, WithStyles
{
    protected $from;
    protected $to;

    public function __construct($from = null, $to = null)
    {
        $this->from = $from;
        $this->to = $to;
    }

    /**
     * Lấy dữ liệu kỳ thi trong khoảng thời gian
     */
    public function collection()
    {
        $query = ExamSession::with(['teacher1Profile', 'teacher2Profile']);

        if ($this->from && $this->to) {
            $query->whereBetween('exam_date', [$this->from, $this->to]);
        } elseif ($this->from) {
            $query->whereDate('exam_date', '>=', $this->from);
        } elseif ($this->to) {
            $query->whereDate('exam_date', '<=', $this->to);
        }

        return $query->orderBy('exam_date', 'asc')->get();
    }

    /**
     * Mapping từng dòng dữ liệu
     */
    public function map($exam): array
    {
        $teacher1 = $exam->teacher1Profile
            ? trim(($exam->teacher1Profile->user_firstname ?? '') . ' ' . ($exam->teacher1Profile->user_lastname ?? ''))
            : '';

        $teacher2 = $exam->teacher2Profile
            ? trim(($exam->teacher2Profile->user_firstname ?? '') . ' ' . ($exam->teacher2Profile->user_lastname ?? ''))
            : '';

        return [
            $exam->exam_code,
            $exam->subject_name,
            $exam->class_code,
            $exam->exam_date,
            $exam->exam_time,
            $exam->exam_room,
            $exam->student_count,
            $exam->exam_duration,
            $exam->exam_faculty,
            $teacher1,
            $teacher2,
        ];
    }


    /**
     * Tiêu đề cột
     */
    public function headings(): array
    {
        return [
            'Mã kỳ thi',
            'Tên học phần',
            'Mã lớp HP',
            'Ngày thi',
            'Giờ thi',
            'Phòng thi',
            'Số SV',
            'Thời gian thi (phút)',
            'Khoa coi thi',
            'Giảng viên 1',
            'Giảng viên 2',
        ];
    }

    /**
     * Đặt độ rộng cột
     */
    public function columnWidths(): array
    {
        return [
            'A' => 45,
            'B' => 30,
            'C' => 20,
            'D' => 15,
            'E' => 15,
            'F' => 15,
            'G' => 10,
            'H' => 25,
            'I' => 25,
            'J' => 25,
            'K' => 25,
        ];
    }

    /**
     * Style cho Excel
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]], // Dòng tiêu đề in đậm
        ];
    }
}
