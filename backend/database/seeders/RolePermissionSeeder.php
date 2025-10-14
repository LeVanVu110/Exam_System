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
