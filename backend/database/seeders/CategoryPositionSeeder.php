<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\CategoryPosition;

class CategoryPositionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        CategoryPosition::truncate();
        Schema::enableForeignKeyConstraints();

        CategoryPosition::insert([
            ['position_code' => 'HEAD', 'position_name' => 'Trưởng khoa'],
            ['position_code' => 'LECT', 'position_name' => 'Giảng viên chính'],
            ['position_code' => 'ASST', 'position_name' => 'Trợ giảng'],
        ]);
    }
}
