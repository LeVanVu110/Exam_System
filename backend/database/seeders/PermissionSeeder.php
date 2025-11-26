<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Permission::truncate();
        Schema::enableForeignKeyConstraints();

        $permissions = [
            ['permission_name' => 'DASHBOARD', 'permission_description' => 'Truy cập Dashboard', 'permission_is_active' => 1],
            ['permission_name' => 'EXAM_SCHEDULE', 'permission_description' => 'Xem lịch thi', 'permission_is_active' => 1],
            ['permission_name' => 'EXAM_MGT', 'permission_description' => 'Quản lý kỳ thi (Phòng đào tạo)', 'permission_is_active' => 1],
            ['permission_name' => 'DOC_MGT', 'permission_description' => 'Quản lý tài liệu', 'permission_is_active' => 1],
            ['permission_name' => 'PERMISSION_MGT', 'permission_description' => 'Quản lý quyền người dùng', 'permission_is_active' => 1],
        ];


        foreach ($permissions as $p) {
            Permission::create($p);
        }
    }
}
