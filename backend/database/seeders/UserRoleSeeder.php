<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Role;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('users_roles')->truncate(); // Bảng pivot
        Schema::enableForeignKeyConstraints();

        $roleIds = Role::pluck('role_id')->toArray(); // Lấy danh sách role_id

        foreach (User::all() as $user) {
            $randomRoleId = $roleIds[array_rand($roleIds)];

            // Gắn role vào user bằng belongsToMany
            $user->roles()->attach($randomRoleId);
        }
    }
}
