<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamSubmissionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('exam_submissions')->insert([
            [
                'exam_session_id' => 1,
                'room_name' => 'A101',
                'exam_time' => '07:30',
                'student_count' => 45,
                'collected_by_1' => 'Nguyễn Văn A',
                'collected_by_2' => 'Trần Thị B',
                'notes' => 'Đủ bài, không có sự cố.',
                'file_name' => 'A101_07h30_45.zip',
                'file_path' => 'exam_collections/a101_07h30_45.zip',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'exam_session_id' => 1,
                'room_name' => 'B202',
                'exam_time' => '09:45',
                'student_count' => 40,
                'collected_by_1' => 'Lê Văn C',
                'collected_by_2' => 'Phạm Thị D',
                'notes' => '2 sinh viên vắng.',
                'file_name' => 'B202_09h45_40.zip',
                'file_path' => 'exam_collections/b202_09h45_40.zip',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'exam_session_id' => 2,
                'room_name' => 'C303',
                'exam_time' => '13:00',
                'student_count' => 50,
                'collected_by_1' => 'Ngô Văn E',
                'collected_by_2' => 'Đỗ Thị F',
                'notes' => 'Thi cuối kỳ môn Toán cao cấp.',
                'file_name' => 'C303_13h00_50.zip',
                'file_path' => 'exam_collections/c303_13h00_50.zip',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
