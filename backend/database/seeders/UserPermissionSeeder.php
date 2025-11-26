<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\UserPermission;

class UserPermissionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        UserPermission::truncate();
        Schema::enableForeignKeyConstraints();

        // Gán quyền cụ thể cho từng user
        $permissionsMap = [
            1 => [1, 2, 3, 4, 5], // User 1 có tất cả các permission
            2 => [1, 2, 3, 4, 5],       // User 2 chỉ có permission 1 và 3
            3 => [2, 4],       // User 3 chỉ có permission 2 và 4
            4 => [1],          // User 4 chỉ có permission 1
            5 => [1, 2, 3, 4, 5]       // User 5 chỉ có permission 3 và 4
        ];

        foreach ($permissionsMap as $userId => $permissionIds) {
            foreach ($permissionIds as $permId) {
                UserPermission::create([
                    'user_id' => $userId,
                    'permission_id' => $permId,
                ]);
            }
        }
    }
}
