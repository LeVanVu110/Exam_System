<?php

namespace App\Http\Controllers;

use App\Models\Screen;
use Illuminate\Http\Request;

class ScreenController extends Controller
{
    // Lấy danh sách màn hình
    public function index()
    {
        return response()->json(Screen::all());
    }

    // Thêm màn hình mới
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:screens,code|max:50', // code dùng để định danh, v.d: 'user_management'
        ]);

        $screen = Screen::create([
            'name' => $request->name,
            'code' => $request->code,
        ]);

        return response()->json($screen, 201);
    }

    // 🗑️ Xóa màn hình
    public function destroy($id)
    {
        // 1. Tìm màn hình
        $screen = \App\Models\Screen::find($id);

        if (!$screen) {
            return response()->json(['message' => 'Không tìm thấy màn hình!'], 404);
        }

        // 2. (Tùy chọn) Xóa các phân quyền liên quan trong bảng permissions_screens trước
        // Nếu database của bạn có set "ON DELETE CASCADE" thì không cần bước này
        \Illuminate\Support\Facades\DB::table('permissions_screens')
            ->where('screen_id', $id)
            ->delete();

        // 3. Xóa màn hình
        $screen->delete();

        return response()->json(['message' => 'Xóa màn hình thành công!'], 200);
    }
}
