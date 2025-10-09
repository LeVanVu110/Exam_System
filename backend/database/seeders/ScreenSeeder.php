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
            ['screen_code' => 'DASH', 'screen_name' => 'Dashboard', 'screen_description' => null],
            ['screen_code' => 'USER', 'screen_name' => 'Users', 'screen_description' => null],
            ['screen_code' => 'EXAM', 'screen_name' => 'Exams', 'screen_description' => null],
        ];

        foreach ($screens as $s) {
            Screen::create($s);
        }
    }
}
