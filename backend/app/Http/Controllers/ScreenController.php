<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Screen;
use App\Models\Permission; // 👉 Import Model Permission
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // 👉 Import DB Facade

class ScreenController extends Controller
{
    // Lấy danh sách màn hình
    public function index()
    {
        return response()->json(Screen::all());
    }

    // Thêm màn hình mới (Cập nhật logic tạo quyền tự động)
    public function store(Request $request)
    {
        // 1. Validate dữ liệu đầu vào (Frontend gửi screen_name, screen_code)
        $request->validate([
            'screen_name' => 'required|string|max:255',
            'screen_code' => 'required|string|unique:screens,screen_code|max:50',
        ]);

        DB::beginTransaction(); // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
        try {
            // 2. Tạo Màn hình (Screen)
            $screen = Screen::create([
                'screen_name' => $request->screen_name,
                'screen_code' => $request->screen_code,
                // 'category_screen_type_id' => ... (nếu cần)
            ]);

            // 3. Tự động tạo Permission tương ứng
            // Hệ thống cần permission này để phân quyền cho Role
            $permission = Permission::create([
                'permission_name' => $request->screen_code, // Dùng chung mã với màn hình
                'permission_description' => $request->screen_name,
                'permission_is_active' => 1,
            ]);

            // 4. Tạo liên kết mặc định vào bảng permissions_screens
            // Việc này tạo ra dòng dữ liệu để Frontend có thể update (is_view, is_add...)
            DB::table('permissions_screens')->insert([
                'permission_id' => $permission->permission_id,
                'screen_id'     => $screen->screen_id,
                'is_view'       => 0, // Mặc định tắt hết quyền
                'is_add'        => 0,
                'is_edit'       => 0,
                'is_delete'     => 0,
                'is_upload'     => 0,
                'is_download'   => 0,
                'is_all'        => 0,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            DB::commit(); // Lưu tất cả vào DB

            return response()->json($screen, 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Nếu có lỗi thì hoàn tác tất cả
            return response()->json(['message' => 'Lỗi tạo màn hình: ' . $e->getMessage()], 500);
        }
    }

    // 🗑️ Xóa màn hình
    public function destroy($id)
    {
        $screen = Screen::find($id);

        if (!$screen) {
            return response()->json(['message' => 'Không tìm thấy màn hình!'], 404);
        }

        DB::beginTransaction();
        try {
            // 1. Lấy mã màn hình
            $screenCode = $screen->screen_code;

            // 2. Xóa liên kết trong permissions_screens trước
            DB::table('permissions_screens')->where('screen_id', $id)->delete();

            // 3. Xóa màn hình
            $screen->delete();

            // 4. (Tùy chọn) Xóa Permission tương ứng để sạch rác
            // Permission::where('permission_name', $screenCode)->delete();

            DB::commit();
            return response()->json(['message' => 'Xóa màn hình thành công!'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xóa màn hình: ' . $e->getMessage()], 500);
        }
    }
}
