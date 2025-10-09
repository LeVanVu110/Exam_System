<?php

namespace Database\Seeders;

use App\Models\Screen;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ScreenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Screen::truncate();

        $screens = [
            ['screen_code' => 'DASH', 'screen_name' => 'Dashboard'],
            ['screen_code' => 'USER', 'screen_name' => 'Users'],
            ['screen_code' => 'EXAM', 'screen_name' => 'Exams'],
        ];

        foreach ($screens as $s) {
            Screen::create($s);
        }
    }
}
