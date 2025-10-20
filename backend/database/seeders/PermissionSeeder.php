<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        Permission::insert([
            ['permission_name' => 'create_exam', 'permission_description' => 'Tạo kỳ thi mới', 'permission_is_active' => 1],
            ['permission_name' => 'edit_exam', 'permission_description' => 'Chỉnh sửa kỳ thi', 'permission_is_active' => 1],
            ['permission_name' => 'delete_exam', 'permission_description' => 'Xóa kỳ thi', 'permission_is_active' => 1],
            ['permission_name' => 'view_reports', 'permission_description' => 'Xem báo cáo', 'permission_is_active' => 1],
        ]);
    }
}
