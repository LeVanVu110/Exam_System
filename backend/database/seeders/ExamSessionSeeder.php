<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExamSession;

class ExamSessionSeeder extends Seeder
{
    public function run(): void
    {
        ExamSession::create([
            'exam_code' => 'EXAM001',
            'exam_name' => 'Giữa kỳ Toán cao cấp',
            'course_id' => 1,
            'exam_date' => '2025-12-10',
            'exam_start_time' => '08:00:00',
            'exam_end_time' => '10:00:00',
            'assigned_teacher1_id' => 1,
            'assigned_teacher2_id' => 2,
            'exam_room' => 'A101',
            'status' => 'scheduled',
        ]);
    }
}
