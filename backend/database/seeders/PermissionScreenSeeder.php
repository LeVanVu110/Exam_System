<?php

namespace Database\Seeders;

use App\Models\PermissionScreen;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionScreenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PermissionScreen::truncate();

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
