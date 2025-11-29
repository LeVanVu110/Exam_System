<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
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
    // ... (Các hàm index, store, update, destroy cũ của resource giữ nguyên) ...

    // --- THÊM 2 HÀM MỚI NÀY VÀO CUỐI CLASS ---

    /**
     * Lấy danh sách quyền (matrix) của một Role cụ thể
     */
    /**
     * Lấy danh sách quyền
     */
    public function getScreensByRole($id)
    {
        // Sửa: Dùng bảng 'roles_permissions'
        $permissions = DB::table('roles_permissions')
                        ->where('role_id', $id)
                        ->get();

        // Map lại permission_id thành screen_id để Frontend React hiểu
        $mapped = $permissions->map(function($p) {
            $p->screen_id = $p->permission_id; // Frontend cần key 'screen_id'
            return $p;
        });

        return response()->json($mapped);
    }

    /**
     * Cập nhật ma trận phân quyền
     */
    public function updateMatrix(Request $request, $id)
    {
        $request->validate([
            'permissions' => 'required|array',
            // Frontend gửi lên screen_id, nhưng ta sẽ lưu vào permission_id
            'permissions.*.screen_id' => 'required|integer',
        ]);

        $permissions = $request->input('permissions');

        try {
            DB::beginTransaction();

            foreach ($permissions as $perm) {
                // Sửa: Update vào bảng 'roles_permissions'
                DB::table('roles_permissions')->updateOrInsert(
                    [
                        'role_id' => $id,
                        'permission_id' => $perm['screen_id'] // Map screen_id -> permission_id
                    ],
                    [
                        'is_view'     => $perm['is_view'],
                        'is_add'      => $perm['is_add'],
                        'is_edit'     => $perm['is_edit'],
                        'is_delete'   => $perm['is_delete'],
                        // Đảm bảo bạn đã chạy SQL thêm 2 cột này ở Bước 1
                        'is_upload'   => $perm['is_upload'],
                        'is_download' => $perm['is_download'],
                        'updated_at'  => now()
                    ]
                );
            }

            DB::commit();
            return response()->json(['message' => 'Cập nhật thành công', 'status' => true]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
