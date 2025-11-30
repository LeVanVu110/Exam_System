<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserPermissionController extends Controller
{
    /**
     * API trả về danh sách quyền tổng hợp của User hiện tại
     * Route: GET /api/my-permissions
     */
    public function getMyPermissions(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        try {
            // 2. Load quan hệ: User -> Roles -> Screens (kèm dữ liệu Pivot)
            // LƯU Ý: Nếu báo lỗi Class 'Screen' not found, hãy kiểm tra lại Model Role xem đang trỏ tới Model nào.
            // Nếu bạn dùng Model Permission, hãy đảm bảo quan hệ trong Role là 'permissions' thay vì 'screens'.
            $user->load(['roles.screens']);
        } catch (\Exception $e) {
            // Bắt lỗi Database (ví dụ thiếu cột) để trả về thông báo rõ ràng
            return response()->json(['error' => 'Lỗi Database/Model: ' . $e->getMessage()], 500);
        }

        $finalPermissions = [];

        // 3. Duyệt qua từng Role của User
        foreach ($user->roles as $role) {
            // Duyệt qua từng Màn hình (Permission) trong Role đó
            // Nếu trong Role.php bạn đặt tên hàm là permissions() thì đổi screens thành permissions
            foreach ($role->screens as $screen) {

                // ✅ SỬA LỖI: Ưu tiên lấy 'permission_name' (theo Model Permission), dự phòng 'screen_code'
                $code = $screen->permission_name ?? $screen->screen_code ?? null;

                if (empty($code)) continue;

                // Khởi tạo nếu chưa có trong mảng kết quả
                if (!isset($finalPermissions[$code])) {
                    $finalPermissions[$code] = [
                        'is_view'     => 0,
                        'is_add'      => 0,
                        'is_edit'     => 0,
                        'is_delete'   => 0,
                        'is_upload'   => 0,
                        'is_download' => 0,
                    ];
                }

                // 4. Logic Hợp nhất (OR) - Sử dụng ?? 0 để tránh lỗi null
                $finalPermissions[$code]['is_view']     = max($finalPermissions[$code]['is_view'],     $screen->pivot->is_view ?? 0);
                $finalPermissions[$code]['is_add']      = max($finalPermissions[$code]['is_add'],      $screen->pivot->is_add ?? 0);
                $finalPermissions[$code]['is_edit']     = max($finalPermissions[$code]['is_edit'],     $screen->pivot->is_edit ?? 0);
                $finalPermissions[$code]['is_delete']   = max($finalPermissions[$code]['is_delete'],   $screen->pivot->is_delete ?? 0);

                // Hai cột này phải chạy SQL thêm vào DB mới hết lỗi 500
                $finalPermissions[$code]['is_upload']   = max($finalPermissions[$code]['is_upload'],   $screen->pivot->is_upload ?? 0);
                $finalPermissions[$code]['is_download'] = max($finalPermissions[$code]['is_download'], $screen->pivot->is_download ?? 0);
            }
        }

        return response()->json($finalPermissions);
    }
}
