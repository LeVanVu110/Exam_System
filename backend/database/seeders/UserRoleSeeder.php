<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\UserRole;
use App\Models\User;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        UserRole::truncate();
        Schema::enableForeignKeyConstraints();

        foreach (User::all() as $u) {
            UserRole::create([
                'user_id' => $u->user_id,
                'role_id' => rand(1, 3),
            ]);
        }
    }
}

