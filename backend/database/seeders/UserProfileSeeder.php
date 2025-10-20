<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserProfile;

class UserProfileSeeder extends Seeder
{
    public function run(): void
    {
        UserProfile::create([
            'user_id' => 1,
            'category_user_type_id' => 1,
            'user_firstname' => 'Nguyen',
            'user_lastname' => 'Van A',
            'user_phone' => '0901234567',
            'user_device_token' => 'ABC123XYZ',
            'user_avatar' => 'avatar1.jpg',
            'user_sex' => 1,
            'province_id' => 1,
            'district_id' => 1,
            'ward_id' => 1,
            'address' => '123 Đường ABC, Quận 1, TP.HCM',
        ]);
    }
}
