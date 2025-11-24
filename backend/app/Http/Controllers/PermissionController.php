<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use App\Models\Screen;
use App\Models\PermissionScreen;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * Lấy danh sách Permissions và Screens để hiển thị lên giao diện
     */
    public function index()
    {
        $permissions = Permission::where('permission_is_active', 1)->get();
        $screens = Screen::all();

        return response()->json([
            'permissions' => $permissions,
            'screens' => $screens
        ]);
    }

    /**
     * Lấy ma trận phân quyền hiện tại của một Permission cụ thể
     */
    public function getMatrix($permissionId)
    {
        // Lấy tất cả các screen đã được gán cho permission này
        $permissionScreens = PermissionScreen::where('permission_id', $permissionId)
            ->get()
            ->keyBy('screen_id'); // Key by screen_id để frontend dễ mapping

        return response()->json($permissionScreens);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'description' => 'nullable|string',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json($permission, 201);
    }

    public function destroy($id)
    {
        Permission::destroy($id);
        return response()->json(['message' => 'Đã xóa nhóm quyền']);
    }

    /**
     * Cập nhật phân quyền (Hàm quan trọng nhất)
     */
    public function updateMatrix(Request $request, $permissionId)
    {
        // Validate dữ liệu gửi lên
        // Data structure expected:
        // [
        //    { screen_id: 1, is_view: 1, is_add: 0 ... },
        //    { screen_id: 2, is_view: 1, is_add: 1 ... }
        // ]
        $data = $request->input('matrix');

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                // Sử dụng updateOrInsert để xử lý cả trường hợp tạo mới và cập nhật
                PermissionScreen::updateOrInsert(
                    [
                        'permission_id' => $permissionId,
                        'screen_id' => $row['screen_id']
                    ],
                    [
                        'is_view' => $row['is_view'] ?? 0,
                        'is_edit' => $row['is_edit'] ?? 0,
                        'is_add'  => $row['is_add']  ?? 0,
                        'is_delete' => $row['is_delete'] ?? 0,
                        'is_upload' => $row['is_upload'] ?? 0,
                        'is_download' => $row['is_download'] ?? 0,
                        'is_all'    => $row['is_all'] ?? 0,
                        'updated_at' => now(),
                        // Nếu là insert thì cần created_at, updateOrInsert không tự thêm created_at nếu update
                        // Có thể cần xử lý thủ công hơn nếu muốn time chuẩn xác cho created_at
                    ]
                );
            }

            DB::commit();
            return response()->json(['message' => 'Cập nhật phân quyền thành công!', 'status' => 'success']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi cập nhật: ' . $e->getMessage(), 'status' => 'error'], 500);
        }
    }
}
