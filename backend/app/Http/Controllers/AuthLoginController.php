<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;


class AuthLoginController extends Controller
{
   
    // From AuthController.php (AuthLoginController)
    public function login(Request $request)
{
    // Tìm user theo email
    $user = User::where('user_email', $request->email)->first();
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Email hoặc mật khẩu không đúng.'
        ], 401);
    }

    // Kiểm tra mật khẩu
    if (!Hash::check($request->password, $user->user_password)) {
        return response()->json([
            'success' => false,
            'message' => 'Email hoặc mật khẩu không đúng.'
        ], 401);
    }

    // Lấy vai trò (Role)
    $role = DB::table('users_roles')
    ->join('roles', 'users_roles.role_id', '=', 'roles.role_id') // ✅ Sửa thành 'roles.role_id'
    ->where('users_roles.user_id', $user->user_id)
    ->value('roles.role_name');

    // Trả về thông tin user
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->user_id,
                'user_name' => $user->user_name,
                'user_email' => $user->user_email,
                'user_role' => $role ?? 'student', // Nếu $role là null, trả về 'student'
            ]
        ]);
    }
}