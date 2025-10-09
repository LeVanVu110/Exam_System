<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\PermissionScreen;

class PermissionScreenSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        PermissionScreen::truncate();
        Schema::enableForeignKeyConstraints();

        for ($p = 1; $p <= 4; $p++) {
            for ($s = 1; $s <= 3; $s++) {
                PermissionScreen::create([
                    'permission_id' => $p,
                    'screen_id' => $s,
                    'is_view' => 1,
                    'is_edit' => rand(0, 1),
                    'is_add' => rand(0, 1),
                    'is_delete' => rand(0, 1),
                    'is_upload' => rand(0, 1),
                    'is_download' => rand(0, 1),
                    'is_all' => rand(0, 1),
                ]);
            }
        }
    }
}
