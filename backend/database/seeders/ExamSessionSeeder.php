<?php

namespace Database\Seeders;

use App\Models\ExamSession;
use App\Models\Course;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $course = Course::first();

        ExamSession::insert([
            [
                'course_id' => $course->id ?? 1,
                'name' => 'Giữa kỳ',
                'exam_date' => now()->addDays(10),
            ],
            [
                'course_id' => $course->id ?? 1,
                'name' => 'Cuối kỳ',
                'exam_date' => now()->addDays(30),
            ],
        ]);
    }
}
