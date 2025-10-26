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

        // tạo 5 mapping user->permission
        for ($i = 1; $i <= 5; $i++) {
            UserPermission::create([
                'user_id' => $i,
                'permission_id' => rand(1, 4),
            ]);
        }
    }
}

