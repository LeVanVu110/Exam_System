<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamSessionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('exam_sessions')->truncate();
        DB::table('exam_sessions')->insert([
            [
                'exam_session_id' => 1,
                'exam_code' => 'CS101-01',
                'exam_name' => 'Nhập môn Lập trình',
                'course_id' => 1,
                'exam_date' => '2025-01-15',
                'exam_start_time' => '08:00',
                'exam_end_time' => '10:00',
                'assigned_teacher1_id' => 1,
                'assigned_teacher2_id' => 2,
                'exam_room' => 'P101',
                'status' => 'Sắp tới',
            ],
            [
                'exam_session_id' => 2,
                'exam_code' => 'CS102-01',
                'exam_name' => 'Cấu trúc Dữ liệu',
                'course_id' => 2,
                'exam_date' => '2025-01-16',
                'exam_start_time' => '09:00',
                'exam_end_time' => '11:00',
                'assigned_teacher1_id' => 3,
                'assigned_teacher2_id' => 4,
                'exam_room' => 'P102',
                'status' => 'Sắp tới',
            ],
            [
                'exam_session_id' => 3,
                'exam_code' => 'CS103-02',
                'exam_name' => 'Giải tích 1',
                'course_id' => 3,
                'exam_date' => '2025-01-17',
                'exam_start_time' => '13:00',
                'exam_end_time' => '15:00',
                'assigned_teacher1_id' => 5,
                'assigned_teacher2_id' => 6,
                'exam_room' => 'P103',
                'status' => 'Sắp tới',
            ],
            [
                'exam_session_id' => 4,
                'exam_code' => 'CS104-01',
                'exam_name' => 'Cơ sở dữ liệu',
                'course_id' => 4,
                'exam_date' => '2025-01-18',
                'exam_start_time' => '14:00',
                'exam_end_time' => '16:00',
                'assigned_teacher1_id' => 2,
                'assigned_teacher2_id' => 3,
                'exam_room' => 'P104',
                'status' => 'Sắp tới',
            ],
            [
                'exam_session_id' => 5,
                'exam_code' => 'CS105-01',
                'exam_name' => 'Lập trình hướng đối tượng',
                'course_id' => 5,
                'exam_date' => '2025-01-19',
                'exam_start_time' => '08:00',
                'exam_end_time' => '10:00',
                'assigned_teacher1_id' => 1,
                'assigned_teacher2_id' => 5,
                'exam_room' => 'P105',
                'status' => 'Đã lên lịch',
            ],
            [
                'exam_session_id' => 6,
                'exam_code' => 'CS106-01',
                'exam_name' => 'Mạng máy tính',
                'course_id' => 6,
                'exam_date' => '2025-01-20',
                'exam_start_time' => '09:00',
                'exam_end_time' => '11:00',
                'assigned_teacher1_id' => 4,
                'assigned_teacher2_id' => 6,
                'exam_room' => 'P106',
                'status' => 'Đang diễn ra',
            ],
            [
                'exam_session_id' => 7,
                'exam_code' => 'CS107-01',
                'exam_name' => 'Trí tuệ nhân tạo cơ bản',
                'course_id' => 7,
                'exam_date' => '2025-01-22',
                'exam_start_time' => '10:00',
                'exam_end_time' => '12:00',
                'assigned_teacher1_id' => 7,
                'assigned_teacher2_id' => 3,
                'exam_room' => 'P107',
                'status' => 'Sắp tới',
            ],
        ]);
    }
}
