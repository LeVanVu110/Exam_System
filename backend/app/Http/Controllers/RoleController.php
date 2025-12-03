<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    // --- CÁC HÀM CRUD CƠ BẢN (GIỮ NGUYÊN) ---
    public function index() {
        return response()->json(Role::all());
    }

    public function store(Request $request) {
        $role = Role::create($request->all());
        return response()->json($role, 201);
    }

    public function show($id) {
        return response()->json(Role::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $role = Role::findOrFail($id);
        $role->update($request->all());
        return response()->json($role);
    }

    public function destroy($id) {
        Role::destroy($id);
        return response()->json(null, 204);
    }

    // --- PHẦN XỬ LÝ PHÂN QUYỀN (QUAN TRỌNG) ---

    /**
     * API: Lấy danh sách quyền (matrix) của một Role để hiển thị lên Frontend
     * GET /api/roles/{id}/screens
     */
    public function getScreensByRole($id)
    {
        // Lấy dữ liệu từ bảng trung gian 'roles_permissions'
        $permissions = DB::table('roles_permissions')
                        ->where('role_id', $id)
                        ->select(
                            'permission_id',
                            'is_view', 'is_add', 'is_edit', 'is_delete', 'is_upload', 'is_download'
                        )
                        ->get();

        // Map lại 'permission_id' thành 'screen_id' để Frontend React hiểu và tô màu checkbox
        $mapped = $permissions->map(function($p) {
            $p->screen_id = $p->permission_id; // Frontend cần key 'screen_id'
            return $p;
        });

        return response()->json($mapped);
    }

    /**
     * API: Lưu cập nhật phân quyền từ Frontend
     * POST /api/roles/{id}/update-matrix
     */
    public function updateMatrix(Request $request, $id)
    {
        // 1. Validate dữ liệu
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*.screen_id' => 'required|integer',
        ]);

        $inputPermissions = $request->input('permissions');

        DB::beginTransaction();
        try {
            foreach ($inputPermissions as $perm) {
                // 2. Chuẩn bị dữ liệu update
                // Lưu ý: Ép kiểu (int) để đảm bảo là 0 hoặc 1, tránh lỗi SQL strict mode
                $dataToUpdate = [
                    'is_view'     => (int)$perm['is_view'],
                    'is_add'      => (int)$perm['is_add'],
                    'is_edit'     => (int)$perm['is_edit'],
                    'is_delete'   => (int)$perm['is_delete'],
                    'is_upload'   => (int)$perm['is_upload'],
                    'is_download' => (int)$perm['is_download'],
                    'updated_at'  => now()
                ];

                // 3. Thực hiện Update hoặc Insert
                // Chúng ta map screen_id từ frontend vào permission_id trong database
                DB::table('roles_permissions')->updateOrInsert(
                    [
                        'role_id'       => $id,
                        'permission_id' => $perm['screen_id']
                    ],
                    $dataToUpdate
                );
            }

            DB::commit();
            return response()->json(['message' => 'Cập nhật quyền thành công!', 'status' => true]);

        } catch (\Exception $e) {
            DB::rollBack();
            // Log lỗi ra để debug nếu cần
            return response()->json(['message' => 'Lỗi Server: ' . $e->getMessage()], 500);
        }
    }
}
