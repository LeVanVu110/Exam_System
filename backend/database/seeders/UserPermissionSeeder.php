<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\UserPermission;

class UserPermissionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        UserPermission::truncate();
        Schema::enableForeignKeyConstraints();

        // Gán quyền cụ thể cho từng user
        // Lưu ý: Code này đang gán TẤT CẢ quyền [1..5] cho 5 user đầu tiên.
        // Bạn có thể sửa lại mảng bên dưới nếu muốn giới hạn quyền cụ thể.
        $permissionsMap = [
            1 => [1, 2, 3, 4, 5], // User 1 (Admin)
            2 => [1, 2, 3, 4, 5], // User 2 (Academic/PDT)
            3 => [1, 2, 3, 4, 5], // User 3 (Teacher)
            4 => [1, 2, 3, 4, 5], // User 4 (Student)
            5 => [1, 2, 3, 4, 5]  // User 5
        ];

        foreach ($permissionsMap as $userId => $permissionIds) {

            // Logic: Chỉ User 1 (Admin) và 2 (PDT) mới có quyền Thêm/Sửa/Xóa
            // Các user khác chỉ được cấp quyền Xem (nếu được gán permission đó)
            $isFullAccess = in_array($userId, [1, 2]);

            foreach ($permissionIds as $permId) {
                UserPermission::create([
                    'user_id'       => $userId,
                    'permission_id' => $permId,

                    // QUAN TRỌNG: Bật quyền xem để tránh lỗi 403
                    'is_view'       => 1,

                    // Phân quyền chi tiết
                    'is_add'        => $isFullAccess ? 1 : 0,
                    'is_edit'       => $isFullAccess ? 1 : 0,
                    'is_delete'     => $isFullAccess ? 1 : 0,
                ]);
            }
        }
    }
}
