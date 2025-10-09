<?php

namespace Database\Seeders;

use App\Models\ExamImportData;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamImportDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ExamImportData::create([
            'student_name' => 'Nguyễn Văn A',
            'course' => 'Lập trình Web',
            'score' => 8.5,
        ]);
    }
}
