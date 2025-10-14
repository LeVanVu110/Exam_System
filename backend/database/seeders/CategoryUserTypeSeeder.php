<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\CategoryUserType;

class CategoryUserTypeSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        CategoryUserType::truncate();
        Schema::enableForeignKeyConstraints();

        CategoryUserType::insert([
            ['user_type_code' => 'ADMIN', 'user_type_name' => 'Admin'],
            ['user_type_code' => 'AAO', 'user_type_name' => 'Academic Affairs Office'],
            ['user_type_code' => 'TEACH', 'user_type_name' => 'Teacher'],
            ['user_type_code' => 'STUD', 'user_type_name' => 'Student'],

        ]);
    }
}
