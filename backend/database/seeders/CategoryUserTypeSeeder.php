<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryUserTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('category_user_type')->truncate();

        DB::table('category_user_type')->insert([
            ['user_type_code' => 'ADMIN', 'user_type_name' => 'Quản trị viên', 'created_at' => now(), 'updated_at' => now()],
            ['user_type_code' => 'TEACHER', 'user_type_name' => 'Giảng viên', 'created_at' => now(), 'updated_at' => now()],
            ['user_type_code' => 'STUDENT', 'user_type_name' => 'Sinh viên', 'created_at' => now(), 'updated_at' => now()],
            ['user_type_code' => 'STAFF', 'user_type_name' => 'Nhân viên phòng thi', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
