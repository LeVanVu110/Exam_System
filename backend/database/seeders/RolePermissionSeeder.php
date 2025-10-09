<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RolePermission::truncate();

        for ($r = 1; $r <= 3; $r++) {
            for ($p = 1; $p <= 4; $p++) {
                RolePermission::create([
                    'role_id' => $r,
                    'permission_id' => $p,
                ]);
            }
        }
    }
}
