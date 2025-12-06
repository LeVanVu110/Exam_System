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

        // Lấy tất cả user và sắp xếp theo ID để đảm bảo thứ tự
        $users = User::orderBy('user_id')->get();

        foreach ($users as $user) {

            // --- BẮT ĐẦU SỬA ĐỔI ---
            // Logic gán role cố định để dễ test
            if ($user->user_id == 1) {
                $role_id = 1; // Admin
            } elseif ($user->user_id == 2) {
                $role_id = 2; // Teacher
            } elseif ($user->user_id == 4) {
                $role_id = 4; // Academic Affairs
            } else {
                $role_id = 3; // Mặc định tất cả người còn lại là Student
            }
            // --- KẾT THÚC SỬA ĐỔI ---

            UserProfile::create([
                'user_id' => $user->user_id,
                'role_id' => $role_id, // Sử dụng biến đã gán logic ở trên
                'user_firstname' => $faker->firstName,
                'user_lastname' => $faker->lastName,
                'user_phone' => $faker->phoneNumber,
                'user_device_token' => null,
                'user_avatar' => $faker->imageUrl(200, 200, 'people'),
                'user_sex' => rand(0, 1), // Giới tính random cũng được, hoặc sửa thành 1 nếu muốn
                'province_id' => null,
                'district_id' => null,
                'ward_id' => null,
                'address' => $faker->address,
            ]);
        }
    }
}
