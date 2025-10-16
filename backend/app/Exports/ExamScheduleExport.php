<?php

namespace App\Exports;

use App\Models\ExamSession;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExamScheduleExport implements FromCollection, WithHeadings, WithMapping
{
    protected $from;
    protected $to;

    public function __construct($from = null, $to = null)
    {
        $this->from = $from;
        $this->to = $to;
    }

    /**
     * Dữ liệu xuất ra Excel
     */
    public function collection()
    {
        $query = ExamSession::query();

        if ($this->from && $this->to) {
            $query->whereBetween('exam_date', [$this->from, $this->to]);
        }

        return $query->get();
    }

    /**
     * Mapping cột dữ liệu cho từng hàng
     */
    public function map($exam): array
    {
        return [
            $exam->exam_code,
            $exam->subject_name,
            $exam->class_code,
            $exam->exam_date,
            $exam->exam_start_time,
            $exam->exam_end_time,
            $exam->exam_room,
            $exam->total_students,
            $exam->assigned_teacher1_id,
            $exam->assigned_teacher2_id,
        ];
    }

    /**
     * Tiêu đề các cột Excel
     */
    public function headings(): array
    {
        return [
            'Mã ca thi',
            'Môn học',
            'Lớp HP',
            'Ngày thi',
            'Giờ bắt đầu',
            'Giờ kết thúc',
            'Phòng thi',
            'Số SV',
            'GV1',
            'GV2',
        ];
    }
}
