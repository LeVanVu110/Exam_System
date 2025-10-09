<?php

namespace Database\Seeders;

use App\Models\ExamAttendance;
use App\Models\ExamStudent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamAttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $examStudents = ExamStudent::all();

        foreach ($examStudents as $examStudent) {
            ExamAttendance::create([
                'exam_student_id' => $examStudent->id,
                'status' => 'Present',
            ]);
        }
    }
}
