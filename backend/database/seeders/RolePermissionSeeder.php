<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\RolePermission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RolePermission::truncate();
        Schema::enableForeignKeyConstraints();

        // Danh sách quyền cho từng vai trò
        $rolePermissions = [
            // 1. Admin: Có tất cả quyền
            1 => [1, 2, 3, 4, 5],

            // 2. Teacher: Chỉ xem dashboard và lịch thi
            2 => [1, 2],

            // 3. Student: Chỉ xem lịch thi
            3 => [1,2],

            // 4. Academic Affairs Office (PDT): Có tất cả quyền
            4 => [1, 2, 3, 4, 5],
        ];

        foreach ($rolePermissions as $roleId => $permissions) {

            // Logic phân quyền: Admin (1) và PDT (4) có toàn quyền thao tác
            // Teacher (2) và Student (3) chỉ có quyền Xem
            $isFullAccess = in_array($roleId, [1, 4]);

            foreach ($permissions as $permissionId) {
                RolePermission::create([
                    'role_id'       => $roleId,
                    'permission_id' => $permissionId,

                    // QUAN TRỌNG: Phải set = 1 thì mới vào được trang
                    'is_view'       => 1,

                    // Các quyền tác động dữ liệu (chỉ dành cho Admin & PDT)
                    'is_add'        => $isFullAccess ? 1 : 0,
                    'is_edit'       => $isFullAccess ? 1 : 0,
                    'is_delete'     => $isFullAccess ? 1 : 0,
                ]);
            }
        }
    }
}
