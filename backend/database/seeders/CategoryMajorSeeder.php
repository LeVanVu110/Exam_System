<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryMajorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('category_majors')->truncate();

        DB::table('category_majors')->insert([
            ['major_code' => 'CS', 'major_name' => 'Khoa học máy tính', 'category_faculty_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['major_code' => 'IS', 'major_name' => 'Hệ thống thông tin', 'category_faculty_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['major_code' => 'QTKD', 'major_name' => 'Quản trị kinh doanh', 'category_faculty_id' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
