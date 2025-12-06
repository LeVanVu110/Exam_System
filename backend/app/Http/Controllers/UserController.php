<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // Thêm Auth để chắc chắn

class UserController extends Controller
{
    // ✅ 1. XEM DANH SÁCH (Quyền: is_view)
    public function index(Request $request)
    {
        // 🔒 Check quyền
        if (!$request->user()->hasAccess('USER_MAN', 'is_view')) {
            return response()->json(['message' => 'Bạn không có quyền xem danh sách người dùng!'], 403);
        }

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

    // ✅ 2. XEM CHI TIẾT (Quyền: is_view)
    public function show($id)
    {
        // 🔒 Check quyền (Dùng chung quyền view với index)
        if (!request()->user()->hasAccess('USER_MAN', 'is_view')) {
            return response()->json(['message' => 'Bạn không có quyền xem thông tin người dùng!'], 403);
        }

        return response()->json(User::findOrFail($id));
    }

    // ✅ 3. TẠO MỚI (Quyền: is_add)
    public function store(Request $request)
    {
        // 🔒 Check quyền
        if (!$request->user()->hasAccess('USER_MAN', 'is_add')) {
            return response()->json(['message' => 'Bạn không có quyền thêm người dùng mới!'], 403);
        }

        // 1. Validate dữ liệu đầu vào
        $request->validate([
            'user_code' => 'nullable|string|max:25|unique:users,user_code',
            'user_name' => 'required|string|max:25|unique:users,user_name',
            'user_email' => 'required|email|max:255|unique:users,user_email',
            'password'  => 'required|string|min:6|max:255',
            'role_id'   => 'required|exists:roles,role_id'
        ], [
            'user_code.max' => 'Mã user không được vượt quá 25 ký tự.',
            'user_code.unique' => 'Mã user này đã tồn tại.',
            'user_name.max' => 'Tên đăng nhập không được vượt quá 25 ký tự.',
            'user_name.unique' => 'Tên đăng nhập này đã được sử dụng.',
            'user_email.max' => 'Email không được vượt quá 255 ký tự.',
            'user_email.unique' => 'Email này đã được sử dụng.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
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

    // ✅ 4. CẬP NHẬT (Quyền: is_edit)
    public function update(Request $request, $id)
    {
        // 🔒 Check quyền
        if (!$request->user()->hasAccess('USER_MAN', 'is_edit')) {
            return response()->json(['message' => 'Bạn không có quyền cập nhật người dùng!'], 403);
        }

        // Validate Update
        $request->validate([
            'user_name' => "required|string|max:25|unique:users,user_name,{$id},user_id",
            'user_email' => "required|email|max:255|unique:users,user_email,{$id},user_id",
            'user_code' => "nullable|string|max:25|unique:users,user_code,{$id},user_id",
            'role_id' => 'required|exists:roles,role_id'
        ], [
            'user_name.max' => 'Tên user không được vượt quá 25 ký tự.',
            'user_name.unique' => 'Tên user đã tồn tại.',
            'user_email.unique' => 'Email đã tồn tại.',
            'user_code.max' => 'Mã user quá dài (tối đa 25 ký tự).',
            'user_code.unique' => 'Mã user đã tồn tại.',
        ]);

        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);

            // Ngăn chặn sửa tài khoản Super Admin nếu không phải chính họ (Logic phụ thêm cho an toàn)
            if ($user->user_id == 1 && $request->user()->user_id != 1) {
                return response()->json(['message' => 'Không thể chỉnh sửa Super Admin.'], 403);
            }

            $data = [
                'user_name' => $request->user_name,
                'user_email' => $request->user_email,
                'user_code' => $request->user_code,
                'user_is_activated' => $request->user_is_activated ?? $user->user_is_activated
            ];

            if ($request->filled('password')) {
                $request->validate(['password' => 'string|min:6']);
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

    // ✅ 5. XÓA (Quyền: is_delete)
    public function destroy($id)
    {
        // 🔒 Check quyền
        if (!request()->user()->hasAccess('USER_MAN', 'is_delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa người dùng!'], 403);
        }

        if ($id == 1) return response()->json(['message' => 'Cannot delete Super Admin'], 403);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found or already deleted'], 404);
        }

        DB::beginTransaction();
        try {
            DB::table('users_roles')->where('user_id', $id)->delete();
            $user->delete();
            DB::commit();
            return response()->json(['message' => 'User deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting user: ' . $e->getMessage()], 500);
        }
    }
}
