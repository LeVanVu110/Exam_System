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
        // 1. Lấy user hiện tại từ Token
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // 2. Load Eager Loading: User -> Roles -> Screens (kèm dữ liệu Pivot)
        // Lưu ý: Trong Model Role cần có function screens()
        $user->load(['roles.screens']);

        $finalPermissions = [];

        // 3. Duyệt qua từng Role của User
        foreach ($user->roles as $role) {
            // Duyệt qua từng Màn hình (Screen) trong Role đó
            foreach ($role->screens as $screen) {
                // Key là Mã màn hình (VD: 'STUDENT_MGT', 'EXAM_SCHEDULE')
                // Nếu bạn lưu trong DB là 'permission_name' thì sửa lại dòng này
                $code = $screen->screen_code;

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

                // 4. Logic Hợp nhất (OR): Chỉ cần 1 Role có quyền thì User có quyền
                // Sử dụng hàm max() để lấy giá trị lớn nhất (1 > 0)
                // pivot là bảng trung gian (role_screens)
                $finalPermissions[$code]['is_view']     = max($finalPermissions[$code]['is_view'],     $screen->pivot->is_view ?? 0);
                $finalPermissions[$code]['is_add']      = max($finalPermissions[$code]['is_add'],      $screen->pivot->is_add ?? 0);
                $finalPermissions[$code]['is_edit']     = max($finalPermissions[$code]['is_edit'],     $screen->pivot->is_edit ?? 0);
                $finalPermissions[$code]['is_delete']   = max($finalPermissions[$code]['is_delete'],   $screen->pivot->is_delete ?? 0);
                $finalPermissions[$code]['is_upload']   = max($finalPermissions[$code]['is_upload'],   $screen->pivot->is_upload ?? 0);
                $finalPermissions[$code]['is_download'] = max($finalPermissions[$code]['is_download'], $screen->pivot->is_download ?? 0);
            }
        }

        return response()->json($finalPermissions);
    }
}
