<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Role::truncate();
        Schema::enableForeignKeyConstraints();

        $roles = [
            ['role_name' => 'Admin', 'role_description' => 'Quản trị hệ thống', 'role_is_active' => 1],
            ['role_name' => 'Teacher', 'role_description' => 'Giáo viên', 'role_is_active' => 1],
            ['role_name' => 'Student', 'role_description' => 'Sinh viên', 'role_is_active' => 1],
            ['role_name' => 'Academic Affairs Office', 'role_description' => 'Phòng Đào Tạo', 'role_is_active' => 1],

        ];

        foreach ($roles as $r) {
            Role::create($r);
        }
    }
}
