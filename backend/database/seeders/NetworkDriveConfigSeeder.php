<?php

namespace Database\Seeders;

use App\Models\NetworkDriveConfig;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NetworkDriveConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        NetworkDriveConfig::create([
            'server_name' => '10.0.0.12',
            'shared_folder' => '\\\\Server\\ExamData',
            'username' => 'admin',
            'password' => bcrypt('123456'),
        ]);
    }
}
