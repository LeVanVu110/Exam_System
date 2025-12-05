<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Screen;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScreenController extends Controller
{
    // Lấy danh sách màn hình
    public function index()
    {
        return response()->json(Screen::orderBy('screen_id', 'asc')->get());
    }

    // Thêm màn hình mới (Tự động đồng bộ quyền)
    public function store(Request $request)
    {
        $request->validate([
            'screen_name' => 'required|string|max:255',
            'screen_code' => 'required|string|unique:screens,screen_code|max:50',
        ]);

        DB::beginTransaction();
        try {
            // 1. Tạo Màn hình (Screen)
            $screen = Screen::create([
                'screen_name' => $request->screen_name,
                'screen_code' => $request->screen_code,
            ]);

            // 2. Tự động tạo Permission tương ứng
            // Logic này giúp permission_id khớp với screen_id (nếu auto-increment chưa bị lệch)
            // Hoặc ít nhất đảm bảo có permission để gán quyền.
            $permissionId = DB::table('permissions')->insertGetId([
                'permission_name'        => $request->screen_code,
                'permission_description' => 'Quyền truy cập ' . $request->screen_name,
                'permission_is_active'   => 1,
                'created_at'             => now(),
                'updated_at'             => now()
            ]);

            // 3. (Tùy chọn) Tạo dòng mặc định trong permissions_screens nếu hệ thống cần
            DB::table('permissions_screens')->insert([
                'permission_id' => $permissionId,
                'screen_id'     => $screen->screen_id,
                'is_view'       => 0, 'is_add' => 0, 'is_edit' => 0,
                'is_delete'     => 0, 'is_upload' => 0, 'is_download' => 0, 'is_all' => 0,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            DB::commit();
            return response()->json($screen, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi tạo màn hình: ' . $e->getMessage()], 500);
        }
    }

    // Xóa màn hình
    public function destroy($id)
    {
        $screen = Screen::find($id);
        if (!$screen) {
            return response()->json(['message' => 'Không tìm thấy màn hình!'], 404);
        }

        DB::beginTransaction();
        try {
            // 1. Xóa các ràng buộc phân quyền liên quan
            // Xóa trong permissions_screens
            DB::table('permissions_screens')->where('screen_id', $id)->delete();

            // Xóa trong roles_permissions (Dùng permission_id = screen_id làm chuẩn)
            DB::table('roles_permissions')->where('permission_id', $id)->delete();

            // 2. Xóa Permission tương ứng (Để tránh rác database)
            // Giả định permission_id trùng screen_id hoặc tìm theo code
            DB::table('permissions')->where('permission_name', $screen->screen_code)->delete();

            // 3. Xóa màn hình chính
            $screen->delete();

            DB::commit();
            return response()->json(['message' => 'Xóa màn hình thành công!'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xóa màn hình: ' . $e->getMessage()], 500);
        }
    }
}
