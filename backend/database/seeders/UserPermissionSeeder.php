<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserPermission;

class UserPermissionSeeder extends Seeder
{
    public function run(): void
    {
        UserPermission::insert([
            ['user_id' => 1, 'permission_id' => 4], // Admin có quyền xem báo cáo
        ]);
    }
}
