<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserPermissionController extends Controller
{
    public function getMyPermissions(Request $request)
    {
        $user = $request->user();
        // Load quan hệ roles và permissions
        $user->load(['roles.permissions']);

        $permissions = [];

        // 1. Lấy quyền từ Vai trò (Roles)
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $perm) {
                // permission_name là mã quyền (VD: DASHBOARD, EXAM_MGT)
                $code = $perm->permission_name;

                if (!isset($permissions[$code])) {
                    $permissions[$code] = [
                        'is_view' => 0, 'is_add' => 0, 'is_edit' => 0, 'is_delete' => 0
                    ];
                }

                // Lấy thông tin từ bảng trung gian (pivot)
                // Dùng hàm max để nếu có 1 role cho phép thì sẽ được phép (logic OR)
                $permissions[$code]['is_view']   = max($permissions[$code]['is_view'],   $perm->pivot->is_view ?? 0);
                $permissions[$code]['is_add']    = max($permissions[$code]['is_add'],    $perm->pivot->is_add ?? 0);
                $permissions[$code]['is_edit']   = max($permissions[$code]['is_edit'],   $perm->pivot->is_edit ?? 0);
                $permissions[$code]['is_delete'] = max($permissions[$code]['is_delete'], $perm->pivot->is_delete ?? 0);
            }
        }

        // 2. (Tùy chọn) Lấy quyền riêng của User nếu có bảng user_permissions
        // ... Logic tương tự nếu cần

        return response()->json($permissions);
    }
}
