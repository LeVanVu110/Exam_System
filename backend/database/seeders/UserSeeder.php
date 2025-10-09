<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {
        DB::table('users')->insert([
            'user_code' => 'U001',
            'user_name' => 'admin',
            'user_email' => 'admin@example.com',
            'user_password' => Hash::make('password'),
            'user_is_activated' => 1,
        ]);
    }
}
