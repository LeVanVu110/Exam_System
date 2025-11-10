<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('user_email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng'], 401);
        }

        if (!Hash::check($request->password, $user->user_password)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng'], 401);
        }

        if ($user->user_is_banned) {
            return response()->json(['message' => 'Tài khoản bị khóa'], 403);
        }

        if (!$user->user_is_activated) {
            return response()->json(['message' => 'Tài khoản chưa kích hoạt'], 403);
        }

        $user->user_last_login = now();
        $user->save();

        // --- Lấy role đầu tiên (hoặc bạn có thể trả tất cả role) ---
        $role = $user->roles()->pluck('role_name')->first(); // ví dụ: 'Admin' hoặc 'Academic Affairs Office'

        // Tạo token (nếu dùng Sanctum)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->user_id,
                'name' => $user->user_name,
                'email' => $user->user_email,
            ],
            'role' => $role,
            'token' => $token,
        ]);
    }
}
