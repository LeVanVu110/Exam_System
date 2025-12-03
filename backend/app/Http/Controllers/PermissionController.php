<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use App\Models\Screen;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function index()
    {
        return response()->json(Permission::where('permission_is_active', 1)->get());
    }

    public function store(Request $request)
    {
        // ... (Giữ nguyên logic tạo permission đơn lẻ nếu cần)
        $perm = Permission::create($request->all());
        return response()->json($perm, 201);
    }

    // --- CÁC HÀM CUSTOM ---

    /**
     * API: Lấy danh sách màn hình để vẽ bảng Matrix
     * GET /api/screens
     */
    public function getScreens()
    {
        // Sắp xếp theo ID để hiển thị thứ tự nhất quán trên bảng
        return response()->json(Screen::orderBy('screen_id', 'asc')->get());
    }

    /**
     * API: Lấy quyền của User đang đăng nhập (Cho Frontend check quyền hiển thị menu/nút bấm)
     * GET /api/my-permissions
     */
    public function myPermissions(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthenticated'], 401);

        // 1. Tìm Role của User
        $userRole = DB::table('users_roles')->where('user_id', $user->user_id)->first();
        if (!$userRole) return response()->json([]);

        // 2. Lấy quyền từ bảng roles_permissions
        // JOIN với bảng screens (thông qua permission_id = screen_id) để lấy screen_code
        $permissions = DB::table('roles_permissions')
            ->join('screens', 'roles_permissions.permission_id', '=', 'screens.screen_id')
            ->where('roles_permissions.role_id', $userRole->role_id)
            ->select(
                'screens.screen_code',
                'roles_permissions.is_view',
                'roles_permissions.is_add',
                'roles_permissions.is_edit',
                'roles_permissions.is_delete',
                'roles_permissions.is_upload',
                'roles_permissions.is_download'
            )
            ->get();

        // 3. Format dữ liệu dạng Key-Value: { "SCREEN_CODE": { permissions... } }
        $formatted = [];
        foreach ($permissions as $p) {
            if ($p->screen_code) {
                $formatted[$p->screen_code] = [
                    'is_view'     => $p->is_view,
                    'is_add'      => $p->is_add,
                    'is_edit'     => $p->is_edit,
                    'is_delete'   => $p->is_delete,
                    'is_upload'   => $p->is_upload,
                    'is_download' => $p->is_download,
                ];
            }
        }

        return response()->json($formatted);
    }
}
