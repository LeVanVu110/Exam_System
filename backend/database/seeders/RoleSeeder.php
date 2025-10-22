<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('role')->truncate();
        DB::table('roles_permissions')->truncate();
        DB::table('users_roles')->truncate();
        DB::table('permissions')->truncate();

        Role::insert([
            [
                'role_name' => 'Admin',
                'role_description' => 'Quản trị hệ thống',
                'role_is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'Teacher',
                'role_description' => 'Giáo viên',
                'role_is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'Student',
                'role_description' => 'Sinh viên',
                'role_is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}