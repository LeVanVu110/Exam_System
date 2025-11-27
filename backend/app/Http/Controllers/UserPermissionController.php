<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;

class UserPermissionController extends Controller
{
    public function getMyPermissions(Request $request)
    {
        // Lấy user từ token
        $user = $request->user(); // hoặc auth()->user()

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Load quan hệ roles.permissions
        $user->load('roles.permissions');

        $permissions = [];

        // Duyệt qua các Roles
        foreach ($user->roles as $role) {
            // Duyệt qua các Permissions của từng Role
            foreach ($role->permissions as $perm) {
                $code = $perm->permission_name;

                if (!isset($permissions[$code])) {
                    $permissions[$code] = [
                        'is_view' => 0,
                        'is_add' => 0,
                        'is_edit' => 0,
                        'is_delete' => 0
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

        return response()->json($permissions); // Trả về JSON đúng cấu trúc Frontend mong muốn
    }
}
