<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // ... (Các hàm index, show, store, update giữ nguyên như cũ) ...
    public function index(Request $request)
    {
        $query = DB::table('users')
            ->leftJoin('users_roles', 'users.user_id', '=', 'users_roles.user_id')
            ->leftJoin('roles', 'users_roles.role_id', '=', 'roles.role_id')
            ->select(
                'users.user_id',
                'users.user_code',
                'users.user_name',
                'users.user_email',
                'users.user_password',
                'users.user_is_activated',
                'users.created_at',
                'roles.role_id',
                'roles.role_name'
            );

        if ($request->keyword) {
            $keyword = $request->keyword;
            $query->where(function($q) use ($keyword) {
                $q->where('users.user_name', 'like', "%{$keyword}%")
                  ->orWhere('users.user_email', 'like', "%{$keyword}%")
                  ->orWhere('users.user_code', 'like', "%{$keyword}%");
            });
        }

        $query->orderBy('users.user_id', 'asc');

        $users = $query->get();

        $users->transform(function($user) {
            if (is_null($user->role_name)) {
                $user->role_name = 'Student';
            }
            return $user;
        });

        return response()->json($users);
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_code' => 'nullable|string|max:25|unique:users,user_code',
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|email|max:255|unique:users,user_email',
            'password'  => 'required|string|min:6',
            'role_id'   => 'required|exists:roles,role_id'
        ]);

        DB::beginTransaction();
        try {
            $userId = DB::table('users')->insertGetId([
                'user_code' => $request->user_code,
                'user_name' => $request->user_name,
                'user_email' => $request->user_email,
                'user_password' => Hash::make($request->password),
                'user_is_activated' => 1,
                'user_activate_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('users_roles')->insert([
                'user_id' => $userId,
                'role_id' => $request->role_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return response()->json(['message' => 'User created successfully', 'user_id' => $userId], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'user_name' => 'required|string|max:255',
            'user_email' => "required|email|unique:users,user_email,{$id},user_id",
            'role_id' => 'required|exists:roles,role_id'
        ]);

        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);

            $data = [
                'user_name' => $request->user_name,
                'user_email' => $request->user_email,
                'user_code' => $request->user_code,
                'user_is_activated' => $request->user_is_activated ?? $user->user_is_activated
            ];

            if ($request->filled('password')) {
                $data['user_password'] = Hash::make($request->password);
            }

            $user->update($data);

            DB::table('users_roles')->updateOrInsert(
                ['user_id' => $id],
                ['role_id' => $request->role_id, 'updated_at' => now()]
            );

            DB::commit();
            return response()->json($user);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 👇 [ĐÃ SỬA] Hàm destroy an toàn hơn
    public function destroy($id)
    {
        if ($id == 1) return response()->json(['message' => 'Cannot delete Super Admin'], 403);

        // Kiểm tra user tồn tại chưa trước khi xóa
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found or already deleted'], 404);
        }

        DB::beginTransaction();
        try {
            DB::table('users_roles')->where('user_id', $id)->delete();
            $user->delete(); // Dùng biến $user đã find ở trên
            DB::commit();
            return response()->json(['message' => 'User deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            // Trả về lỗi chi tiết để debug
            return response()->json(['message' => 'Error deleting user: ' . $e->getMessage()], 500);
        }
    }
}
