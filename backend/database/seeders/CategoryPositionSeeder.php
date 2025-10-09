<?php

namespace Database\Seeders;

use App\Models\CategoryPosition;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoryPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CategoryPosition::insert([
            ['name' => 'Trưởng khoa'],
            ['name' => 'Giảng viên chính'],
            ['name' => 'Trợ giảng'],
        ]);
    }
}
