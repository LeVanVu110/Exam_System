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
            ['permission_name' => 'view_exam', 'permission_description' => 'Xem thông tin kỳ thi', 'permission_is_active' => 1],
            ['permission_name' => 'create_exam', 'permission_description' => 'Tạo kỳ thi mới', 'permission_is_active' => 1],
            ['permission_name' => 'edit_exam', 'permission_description' => 'Chỉnh sửa kỳ thi', 'permission_is_active' => 1],
            ['permission_name' => 'delete_exam', 'permission_description' => 'Xóa kỳ thi', 'permission_is_active' => 1],
        ];

        foreach ($permissions as $p) {
            Permission::create($p);
        }
    }
}
