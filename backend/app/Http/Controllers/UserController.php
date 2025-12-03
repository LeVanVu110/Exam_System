<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Lấy danh sách users kèm thông tin vai trò
     */
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
                'users.user_is_activated',
                'users.created_at',
                'roles.role_id',
                'roles.role_name'
            )
            ->orderBy('users.user_id', 'desc');

        return response()->json($query->get());
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    /**
     * Tạo user mới và gán role
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_code' => 'nullable|string|max:25|unique:users,user_code',
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|email|max:255|unique:users,user_email',
            'user_password' => 'required|string|min:6', // Frontend gửi lên field là 'password' hoặc 'user_password' tùy form
            'role_id' => 'required|exists:roles,role_id'
        ]);

        DB::beginTransaction();
        try {
            // 1. Tạo User
            $userId = DB::table('users')->insertGetId([
                'user_code' => $request->user_code,
                'user_name' => $request->user_name,
                'user_email' => $request->user_email,
                'user_password' => Hash::make($request->user_password), // Hoặc $request->password
                'user_is_activated' => 1,
                'user_activate_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Gán Role
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

    /**
     * Cập nhật user và role
     */
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
            } elseif ($request->filled('user_password')) {
                $data['user_password'] = Hash::make($request->user_password);
            }

            $user->update($data);

            // Cập nhật Role
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

    public function destroy($id)
    {
        if ($id == 1) return response()->json(['message' => 'Cannot delete Super Admin'], 403);

        DB::beginTransaction();
        try {
            DB::table('users_roles')->where('user_id', $id)->delete();
            User::findOrFail($id)->delete();
            DB::commit();
            return response()->json(['message' => 'User deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error'], 500);
        }
    }
}
