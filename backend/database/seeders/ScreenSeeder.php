<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\Screen;

class ScreenSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Screen::truncate();
        Schema::enableForeignKeyConstraints();

        $screens = [
            [
                'screen_code' => 'DASH',
                'screen_name' => 'Dashboard',
                'screen_description' => 'Màn hình tổng quan hệ thống',
                // 'screen_is_active' => 1,
            ],
            [
                'screen_code' => 'USER',
                'screen_name' => 'Users',
                'screen_description' => 'Quản lý người dùng',
                // 'screen_is_active' => 1,
            ],
            [
                'screen_code' => 'EXAM',
                'screen_name' => 'Exams',
                'screen_description' => 'Quản lý kỳ thi',
                // 'screen_is_active' => 1,
            ],
        ];

        foreach ($screens as $screen) {
            Screen::updateOrCreate(
                ['screen_code' => $screen['screen_code']], // nếu trùng code thì update
                $screen
            );
        }
    }
}
