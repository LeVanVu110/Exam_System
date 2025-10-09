<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamAttendance;
use App\Models\ExamSession;

class ExamAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamAttendance::truncate();
        Schema::enableForeignKeyConstraints();

        $sessions = ExamSession::all();

        foreach ($sessions as $s) {
            ExamAttendance::create([
                'exam_session_id' => $s->exam_session_id,
                'teacher_id' => null,
                'total_students' => rand(20, 30),
                'present_count' => rand(15, 30),
                'total_computers' => rand(20, 30),
                'used_computers' => rand(10, 25),
            ]);
        }
    }
}
