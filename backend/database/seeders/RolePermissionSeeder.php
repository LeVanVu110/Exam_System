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

        // Gán quyền cố định cho từng vai trò
        $rolePermissions = [
            // Admin có tất cả quyền
            1 => [1, 2, 3, 4],

            // Teacher chỉ có quyền 2, 3
            2 => [2, 3],

            // Student chỉ có quyền 3
            3 => [3],

            // Academic Affairs Office có quyền 1, 4
            4 => [1, 4],
        ];

        foreach ($rolePermissions as $roleId => $permissions) {
            foreach ($permissions as $permissionId) {
                RolePermission::create([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }
}
