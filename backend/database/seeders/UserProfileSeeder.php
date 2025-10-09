<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserProfile::truncate();

        foreach (User::all() as $user) {
            UserProfile::create([
                'user_id' => $user->user_id,
                'category_user_type_id' => rand(1, 3),
                'user_firstname' => fake()->firstName(),
                'user_lastname' => fake()->lastName(),
                'user_phone' => fake()->phoneNumber(),
                'user_avatar' => fake()->imageUrl(200, 200, 'people'),
                'user_sex' => rand(0, 1),
                'address' => fake()->address(),
            ]);
        }
    }
}
