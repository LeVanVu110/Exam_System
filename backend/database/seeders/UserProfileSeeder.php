<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        UserProfile::truncate();
        Schema::enableForeignKeyConstraints();

        $faker = \Faker\Factory::create();

        foreach (User::all() as $user) {
            UserProfile::create([
                'user_id' => $user->user_id,
                'category_user_type_id' => rand(1, 3),
                'user_firstname' => $faker->firstName,
                'user_lastname' => $faker->lastName,
                'user_phone' => $faker->phoneNumber,
                'user_device_token' => null,
                'user_avatar' => $faker->imageUrl(200, 200, 'people'),
                'user_sex' => rand(0, 1),
                'province_id' => null,
                'district_id' => null,
                'ward_id' => null,
                'address' => $faker->address,
            ]);
        }
    }
}

