<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\NetworkDriveConfig;

class NetworkDriveConfigSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        NetworkDriveConfig::truncate();
        Schema::enableForeignKeyConstraints();

        NetworkDriveConfig::create([
            'drive_letter' => 'Z:',
            'base_path' => '\\\\Server\\ExamData',
            'exam_path_template' => '\\\\Server\\ExamData\\{exam_code}',
            'auto_detect_empty_files' => 0,
        ]);
    }
}
