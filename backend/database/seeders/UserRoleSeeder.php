<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('users_roles')->truncate();
        Schema::enableForeignKeyConstraints();

        // Admin
        DB::table('users_roles')->insert([
            'user_id' => 1,
            'role_id' => 1,
        ]);

        // PĐT / Academic
        DB::table('users_roles')->insert([
            'user_id' => 2,
            'role_id' => 4,
        ]);

        // Teacher
        DB::table('users_roles')->insert([
            'user_id' => 3,
            'role_id' => 2,
        ]);

        // Student
        DB::table('users_roles')->insert([
            'user_id' => 4,
            'role_id' => 3,
        ]);

        // Các user random khác (id >= 5) → Student
        for ($i = 5; $i <= 12; $i++) {
            DB::table('users_roles')->insert([
                'user_id' => $i,
                'role_id' => 3,
            ]);
        }
    }
}
