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

    // Xóa màn hình
    public function destroy($id)
    {
        Screen::destroy($id);
        return response()->json(['message' => 'Đã xóa màn hình']);
    }
}
