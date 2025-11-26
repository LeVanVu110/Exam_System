<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use App\Models\Screen;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * Lấy danh sách nhóm quyền (Permissions)
     * GET /api/permissions
     */
    public function index()
    {
        // Trả về danh sách active
        return response()->json(Permission::where('permission_is_active', 1)->get());
    }

    /**
     * Tạo nhóm quyền mới (Standard CRUD)
     * POST /api/permissions
     */
    public function store(Request $request)
    {
        $request->validate([
            'permission_name' => 'required|string|max:55'
        ]);

        $perm = Permission::create([
            'permission_name' => $request->permission_name,
            'permission_description' => $request->permission_description,
            'permission_is_active' => 1
        ]);

        return response()->json($perm, 201);
    }

    // --- CÁC HÀM CUSTOM CHO MÀN HÌNH VÀ MATRIX ---

    /**
     * Lấy danh sách màn hình
     * GET /api/screens
     */
    public function getScreens()
    {
        return response()->json(Screen::all());
    }

    /**
     * Tạo màn hình mới
     * POST /api/screens
     */
    public function storeScreen(Request $request)
    {
        $request->validate([
            'screen_name' => 'required|string|max:55',
            'screen_code' => 'required|string|max:15'
        ]);

        $screen = Screen::create([
            'screen_name' => $request->screen_name,
            'screen_code' => $request->screen_code,
        ]);

        return response()->json($screen, 201);
    }

    /**
     * Lấy ma trận quyền hiện tại của một nhóm quyền
     * GET /api/permissions/{id}/screens
     */
    public function getMatrix($id)
    {
        // Lấy dữ liệu từ bảng trung gian permissions_screens
        $matrix = DB::table('permissions_screens')
                    ->where('permission_id', $id)
                    ->get();

        return response()->json($matrix);
    }

    /**
     * Cập nhật ma trận quyền
     * POST /api/permissions/{id}/update-matrix
     */
    public function updateMatrix(Request $request, $id)
    {
        $permissionsData = $request->input('permissions'); // Mảng dữ liệu từ React gửi lên

        if (!$permissionsData || !is_array($permissionsData)) {
            return response()->json(['error' => 'Invalid data format'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($permissionsData as $row) {
                // Sử dụng updateOrInsert để tự động Insert hoặc Update
                DB::table('permissions_screens')->updateOrInsert(
                    [
                        // Điều kiện tìm kiếm (Composite Key)
                        'permission_id' => $id,
                        'screen_id'     => $row['screen_id']
                    ],
                    [
                        // Các trường cần update
                        'is_view'     => $row['is_view'],
                        'is_add'      => $row['is_add'],
                        'is_edit'     => $row['is_edit'],
                        'is_delete'   => $row['is_delete'],
                        'is_upload'   => $row['is_upload'],
                        'is_download' => $row['is_download'],
                        'is_all'      => $row['is_all'],
                        'updated_at'  => now(),
                    ]
                );
            }
            DB::commit();
            return response()->json(['message' => 'Matrix updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }
    /**
     * API: Lấy danh sách quyền của User đang đăng nhập
     * Method: GET
     * Url: /api/my-permissions
     */
    public function myPermissions(Request $request)
    {
        // 1. Lấy user hiện tại từ Token
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Chưa đăng nhập'], 401);
        }

        // 2. Tìm Role của User trong bảng users_roles
        // Giả sử bảng users_roles có cột: user_id, role_id
        $userRole = DB::table('users_roles')->where('user_id', $user->user_id)->first();

        if (!$userRole) {
            // Nếu user này chưa được gán vai trò nào -> Trả về rỗng
            return response()->json([]);
        }

        // 3. Lấy tất cả quyền màn hình tương ứng với Role ID đó
        // (Join bảng permissions_screens với bảng screens để lấy screen_code)
        $permissions = DB::table('permissions_screens')
            ->join('screens', 'permissions_screens.screen_id', '=', 'screens.screen_id')
            ->where('permissions_screens.permission_id', $userRole->role_id)
            ->select(
                'screens.screen_code',
                'permissions_screens.is_view',
                'permissions_screens.is_add',
                'permissions_screens.is_edit',
                'permissions_screens.is_delete',
                'permissions_screens.is_upload',
                'permissions_screens.is_download'
            )
            ->get();

        // 4. Format lại dữ liệu để Frontend dễ dùng (Dạng Key-Value)
        // Ví dụ: { "USER_MGT": { is_view: 1, is_add: 0... }, "EXAM_MGT": ... }
        $formatted = [];
        foreach ($permissions as $p) {
            if ($p->screen_code) {
                $formatted[$p->screen_code] = [
                    'is_view' => $p->is_view,
                    'is_add' => $p->is_add,
                    'is_edit' => $p->is_edit,
                    'is_delete' => $p->is_delete,
                    'is_upload' => $p->is_upload,
                    'is_download' => $p->is_download,
                ];
            }
        }

        return response()->json($formatted);
    }

// ... Dấu đóng class ở đây
}
