<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryPositionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('category_positions')->truncate();

        DB::table('category_positions')->insert([
            ['position_code' => 'GV', 'position_name' => 'Giảng viên', 'created_at' => now(), 'updated_at' => now()],
            ['position_code' => 'TK', 'position_name' => 'Trưởng khoa', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
