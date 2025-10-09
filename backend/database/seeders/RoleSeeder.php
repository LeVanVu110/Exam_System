<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::truncate();

        $roles = [
            ['role_name' => 'Admin', 'role_description' => 'Quản trị hệ thống'],
            ['role_name' => 'Academic Affairs Office', 'role_description' => 'Phòng Đào Tạo'],
            ['role_name' => 'Teacher', 'role_description' => 'Giáo viên'],
            ['role_name' => 'Student', 'role_description' => 'Sinh viên'],
        ];

        foreach ($roles as $r) {
            Role::create($r + ['role_is_active' => 1]);
        }
    }
}
