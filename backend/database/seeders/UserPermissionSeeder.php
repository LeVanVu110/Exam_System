<?php

namespace Database\Seeders;

use App\Models\UserPermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserPermission::truncate();

        for ($i = 1; $i <= 5; $i++) {
            UserPermission::create([
                'user_id' => $i,
                'permission_id' => rand(1, 4),
            ]);
        }
    }
}
