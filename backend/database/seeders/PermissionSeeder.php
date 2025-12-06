<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Thêm DB Facade

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        // Xóa bảng permissions
        DB::table('permissions')->truncate();
        Schema::enableForeignKeyConstraints();

        $now = now();

        // Sử dụng DB::table()->insert để ÉP CỨNG ID vào Database
        // Cách này bỏ qua mọi ràng buộc của Eloquent Model, đảm bảo ID chuẩn 100%
        $permissions = [
            [
                'permission_id' => 1,
                'permission_name' => 'DASHBOARD',
                'permission_description' => 'Truy cập Dashboard',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'permission_id' => 2,
                'permission_name' => 'EXAM_SCHEDULE',
                'permission_description' => 'Xem lịch thi',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'permission_id' => 3,
                'permission_name' => 'EXAM_MGT',
                'permission_description' => 'Quản lý kỳ thi (Phòng đào tạo)',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'permission_id' => 4,
                'permission_name' => 'DOC_MGT',
                'permission_description' => 'Quản lý tài liệu',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'permission_id' => 5,
                'permission_name' => 'PERMISSION_MGT',
                'permission_description' => 'Quản lý quyền người dùng',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'permission_id' => 6,
                'permission_name' => 'USER_MAN',
                'permission_description' => 'Quản lý người dùng',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'permission_id' => 7,
                'permission_name' => 'USER_PRO',
                'permission_description' => 'Quản lý hồ sơ người dùng',
                'permission_is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('permissions')->insert($permissions);
    }
}
