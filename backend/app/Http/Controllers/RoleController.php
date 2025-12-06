<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RoleController extends Controller
{
    // --- CÁC HÀM CRUD CƠ BẢN (GIỮ NGUYÊN) ---
    public function index()
    {
        return response()->json(Role::all());
    }

    public function store(Request $request)
    {
        // validate 'unique:roles,role_name' là mấu chốt để chặn trùng lặp
        $request->validate([
            'role_name' => 'required|unique:roles,role_name'
        ], [
            // (Tùy chọn) Tùy chỉnh thông báo lỗi tiếng Việt từ Backend
            'role_name.unique' => 'Tên vai trò đã tồn tại.'
        ]);

        $role = Role::create($request->all());
        return response()->json($role, 201);
    }

    public function show($id)
    {
        return response()->json(Role::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $role->update($request->all());
        return response()->json($role);
    }

    public function destroy($id)
    {
        // 1. Tìm Role
        $role = Role::find($id);

        // 2. Nếu không thấy -> Trả về 404 (React sẽ bắt được ở tab thứ 2)
        if (!$role) {
            return response()->json(['message' => 'Role không tồn tại hoặc đã bị xóa'], 404);
        }

        // 3. Nếu thấy -> Xóa
        // Dùng $role->delete() tốt hơn Role::destroy($id) vì không cần query lại DB lần nữa
        $role->delete();

        return response()->json(['message' => 'Xóa thành công'], 200);
    }

    // --- PHẦN XỬ LÝ PHÂN QUYỀN (QUAN TRỌNG) ---

    /**
     * API: Lấy danh sách quyền (matrix) của một Role để hiển thị lên Frontend
     * GET /api/roles/{id}/screens
     */
    public function getScreensByRole($id)
    {
        $role = Role::find($id);
        if (!$role) return response()->json(['message' => 'Role not found'], 404);

        $permissions = DB::table('roles_permissions')
            ->where('role_id', $id)
            ->select('permission_id', 'is_view', 'is_add', 'is_edit', 'is_delete', 'is_upload', 'is_download')
            ->get();

        $mapped = $permissions->map(function ($p) {
            $p->screen_id = $p->permission_id;
            return $p;
        });

        return response()->json([
            'permissions' => $mapped,
            // 👇 Gửi về định dạng ISO 8601 chuẩn UTC để Client dễ xử lý
            'last_updated_at' => $role->updated_at ? $role->updated_at->toISOString() : now()->toISOString(),
        ]);
    }

    /**
     * API: Lưu cập nhật phân quyền từ Frontend
     * POST /api/roles/{id}/update-matrix
     */
    /**
     * POST /api/roles/{id}/update-matrix
     */
    public function updateMatrix(Request $request, $id)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*.screen_id' => 'required|integer',
            'last_updated_at' => 'nullable', // Cho phép null để tránh lỗi validate nếu client gửi sai
        ]);

        $role = Role::find($id);
        if (!$role) return response()->json(['message' => 'Role không tồn tại'], 404);

        // 👇 XỬ LÝ KHÓA LẠC QUAN (OPTIMISTIC LOCKING) BẰNG CARBON
        $clientTimeStr = $request->input('last_updated_at');

        if ($clientTimeStr && $role->updated_at) {
            // Parse thời gian Client gửi lên
            $clientDate = Carbon::parse($clientTimeStr);

            // So sánh: Nếu khác nhau (không tính giây lẻ mili-seconds nếu DB không lưu)
            // Dùng notEqualTo sẽ so sánh giá trị thời gian thực tế thay vì so sánh chuỗi
            if ($role->updated_at->notEqualTo($clientDate)) {
                 return response()->json([
                    'message' => 'Dữ liệu phân quyền đã bị thay đổi bởi người khác. Vui lòng tải lại trang!',
                    'code' => 'CONFLICT_DATA'
                ], 409);
            }
        }

        $inputPermissions = $request->input('permissions');

        DB::beginTransaction();
        try {
            foreach ($inputPermissions as $perm) {
                $dataToUpdate = [
                    'is_view'     => (int)$perm['is_view'],
                    'is_add'      => (int)$perm['is_add'],
                    'is_edit'     => (int)$perm['is_edit'],
                    'is_delete'   => (int)$perm['is_delete'],
                    'is_upload'   => (int)$perm['is_upload'],
                    'is_download' => (int)$perm['is_download'],
                ];

                DB::table('roles_permissions')->updateOrInsert(
                    ['role_id' => $id, 'permission_id' => $perm['screen_id']],
                    $dataToUpdate
                );
            }

            // Cập nhật lại thời gian của Role
            $role->touch();

            // Refresh để lấy thời gian chính xác từ DB sau khi touch
            $role->refresh();

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật quyền thành công!',
                'new_updated_at' => $role->updated_at->toISOString()
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi Server: ' . $e->getMessage()], 500);
        }
    }
}
