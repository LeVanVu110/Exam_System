<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoryPosition;

class CategoryPositionSeeder extends Seeder
{
    public function run(): void
    {
        CategoryPosition::create([
            'position_code' => 'GV',
            'position_name' => 'Giảng viên',
        ]);

        CategoryPosition::create([
            'position_code' => 'TK',
            'position_name' => 'Trưởng khoa',
        ]);
    }
}
