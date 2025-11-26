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
            ['screen_code' => 'DASHBOARD', 'screen_name' => 'Dashboard', 'screen_description' => 'Tổng quan hệ thống'],
            ['screen_code' => 'EXAM_SCHEDULE', 'screen_name' => 'Lịch thi', 'screen_description' => 'Xem lịch thi'],
            ['screen_code' => 'EXAM_MGT', 'screen_name' => 'Quản lý kỳ thi', 'screen_description' => 'Dành cho phòng đào tạo'],
            ['screen_code' => 'DOC_MGT', 'screen_name' => 'Quản lý tài liệu', 'screen_description' => 'Tài liệu kỳ thi'],
            ['screen_code' => 'PERMISSION_MGT', 'screen_name' => 'Quản lý quyền', 'screen_description' => 'Phân quyền hệ thống'],
        ];


        foreach ($screens as $screen) {
            Screen::updateOrCreate(
                ['screen_code' => $screen['screen_code']], // nếu trùng code thì update
                $screen
            );
        }
    }
}
