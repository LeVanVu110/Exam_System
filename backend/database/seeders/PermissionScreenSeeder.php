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

        // Định nghĩa quyền cho từng permission trên từng màn hình
        $permissionScreens = [
            // permission_id => [screen_id => [quyền]]
            1 => [ // view_exam
                1 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 1, 'is_all' => 0],
                2 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
                3 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
            ],
            2 => [ // create_exam
                1 => ['is_view' => 1, 'is_edit' => 1, 'is_add' => 1, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
                2 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 1, 'is_delete' => 0, 'is_upload' => 1, 'is_download' => 0, 'is_all' => 0],
            ],
            3 => [ // edit_exam
                1 => ['is_view' => 1, 'is_edit' => 1, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
                3 => ['is_view' => 1, 'is_edit' => 1, 'is_add' => 0, 'is_delete' => 0, 'is_upload' => 1, 'is_download' => 0, 'is_all' => 0],
            ],
            4 => [ // delete_exam
                2 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 1, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
                3 => ['is_view' => 1, 'is_edit' => 0, 'is_add' => 0, 'is_delete' => 1, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0],
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
