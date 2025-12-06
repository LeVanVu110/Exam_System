<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthLoginController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate dữ liệu gửi lên
        $request->validate([
            'user_email' => 'required|email',
            'user_password' => 'required',
        ]);

        // 2. Tìm user theo email
        $user = User::where('user_email', $request->email)->first();

        // 3. Kiểm tra user và mật khẩu
        // Lưu ý: UserSeeder đã sửa lại thành mật khẩu text thường (không hash),
        // nhưng nếu Model User có Mutator hash tự động thì Hash::check vẫn đúng.
        if (!$user || !Hash::check($request->password, $user->user_password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không đúng'
            ], 401);
        }

        // 4. Tạo Token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. [QUAN TRỌNG] Lấy tên Role để trả về cho Frontend
        // Load quan hệ roles (Giả sử User n-n Role)
        $user->load('roles');

        // Lấy tên role đầu tiên (nếu có)
        // Lưu ý: Cột tên role trong DB thường là 'role_name' hoặc 'name'.
        // Bạn hãy kiểm tra DB, code dưới đây ưu tiên 'role_name'.
        $roleName = '';
        if ($user->roles->isNotEmpty()) {
            $role = $user->roles->first();
            $roleName = $role->role_name ?? $role->name ?? '';
        }

        // 6. Trả về JSON đúng cấu trúc Frontend cần
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'role' => $roleName, // <--- Frontend dùng cái này để switch case
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    }
}
