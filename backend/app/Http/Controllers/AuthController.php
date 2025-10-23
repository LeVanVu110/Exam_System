<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class AuthLoginController extends Controller
{
    public function login(Request $request)
    {
        // ✅ Validate dữ liệu đầu vào
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // ✅ Tìm user theo email
        $user = User::where('user_email', $request->email)->first();

        // Nếu không có user
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng.'
            ], 401);
        }

        // ✅ Kiểm tra mật khẩu
        if (!Hash::check($request->password, $user->user_password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng.'
            ], 401);
        }

        // Code đã điều chỉnh
$role = DB::table('users_roles')
    // Tên bảng role là 'role', không phải 'roles' (dựa trên 2025_10_20_162604_create_roles_table.php)
    ->join('role', 'users_roles.role_id', '=', 'role.role_id') 
    // Sử dụng $user->user_id (khóa chính tùy chỉnh)
    ->where('users_roles.user_id', $user->user_id) 
    ->value('role.role_name');

        // ✅ Trả về thông tin user
        // Code đã điều chỉnh
return response()->json([
    'success' => true,
    'user' => [
        'id' => $user->user_id, // Sử dụng khóa chính tùy chỉnh 'user_id'
        'name' => $user->user_name,
        'email' => $user->user_email,
        'role' => $role ?? 'student', 
    ]
]);
    }
}