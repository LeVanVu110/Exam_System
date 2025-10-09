<?php

namespace Database\Seeders;

use App\Models\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserRole::truncate();

        foreach (User::all() as $u) {
            UserRole::create([
                'user_id' => $u->user_id,
                'role_id' => rand(1, 3),
            ]);
        }
    }
}
