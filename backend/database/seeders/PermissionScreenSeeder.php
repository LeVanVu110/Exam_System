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

        // Gán quyền cho từng màn hình theo screen code
        $permissionScreens = [
            // permission_id => [screen_id => các quyền]
            1 => [ // DASHBOARD
                1 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
            ],
            2 => [ // EXAM_SCHEDULE
                2 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 1, 'is_all' => 0],
            ],
            3 => [ // EXAM_MGT → Phòng đào tạo
                3 => ['is_view' => 1, 'is_edit' => 1, 'is_add' => 1, 'is_delete' => 0, 'is_upload' => 1, 'is_download' => 0, 'is_all' => 0],
            ],
            4 => [ // DOC_MGT
                4 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 1, 'is_download' => 1, 'is_all' => 0],
            ],
            5 => [ // PERMISSION_MGT
                5 => ['is_view' => 1, 'is_edit' => 1, 'is_add' => 1, 'is_delete' => 1, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 1],
            ],
        ];

        foreach ($permissionScreens as $permissionId => $screens) {
            foreach ($screens as $screenId => $rights) {
                PermissionScreen::create(array_merge([
                    'permission_id' => $permissionId,
                    'screen_id' => $screenId,
                ], $rights));
            }
        }
    }
}
