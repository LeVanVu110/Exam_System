<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends Controller
{
    public function index(Request $request)
    {
        // Danh sách tất cả thì BẮT BUỘC phải có quyền xem quản trị
        if (!$request->user()->hasAccess('USER_PRO', 'is_view')) {
            return response()->json(['message' => 'Bạn không có quyền xem danh sách hồ sơ!'], 403);
        }
        return response()->json(UserProfile::with(['user', 'roles'])->get());
    }

    // ✅ 2. XEM CHI TIẾT (Quyền: is_view)
    // ✅ SỬA LOGIC: Admin xem được tất cả, User thường chỉ xem được của mình
    public function show($id)
    {
        $user = request()->user();
        $profile = UserProfile::with(['user', 'roles'])->findOrFail($id);

        // Logic: Nếu có quyền VIEW (Admin) HOẶC là chính chủ (Profile này thuộc về User đang login)
        $isOwner = $profile->user_id === $user->user_id;
        $hasPermission = $user->hasAccess('USER_PRO', 'is_view');

        if (!$hasPermission && !$isOwner) {
            return response()->json(['message' => 'Bạn không có quyền xem hồ sơ này!'], 403);
        }

        return response()->json($profile);
    }

    // ✅ 3. TẠO MỚI (Quyền: is_add)
    public function store(Request $request)
    {
        // 🔒 Check quyền
        if (!$request->user()->hasAccess('USER_PRO', 'is_add')) {
            return response()->json(['message' => 'Bạn không có quyền tạo hồ sơ mới!'], 403);
        }

        $data = $request->validate([
            'user_id' => 'required|integer|unique:user_profiles,user_id', // Thêm unique để tránh 1 user có 2 profile
            'role_id' => 'required|integer',
            'user_firstname' => 'nullable|string|max:55',
            'user_lastname' => 'nullable|string|max:55',
            'user_phone' => 'nullable|string|max:15',
            'user_device_token' => 'nullable|string|max:255',
            'user_avatar' => 'nullable|string|max:255',
            'user_sex' => 'nullable|integer',
            'province_id' => 'nullable|integer',
            'district_id' => 'nullable|integer',
            'ward_id' => 'nullable|integer',
            'address' => 'nullable|string|max:255',
        ]);

        $profile = UserProfile::create($data);
        return response()->json($profile, 201);
    }

    // ✅ 4. CẬP NHẬT (Quyền: is_edit)
    // ✅ SỬA LOGIC: Admin sửa được tất cả, User thường chỉ sửa được của mình
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $profile = UserProfile::findOrFail($id);

        // Logic check quyền
        $isOwner = $profile->user_id === $user->user_id;
        $hasPermission = $user->hasAccess('USER_PRO', 'is_edit');

        if (!$hasPermission && !$isOwner) {
            return response()->json(['message' => 'Bạn không có quyền cập nhật hồ sơ này!'], 403);
        }

        // 🛑 OPTIMISTIC LOCKING: Kiểm tra phiên bản dữ liệu
        if (!$request->has('updated_at')) {
            return response()->json(['message' => 'Thiếu dữ liệu phiên bản cập nhật.'], 409);
        }

        // Fix lỗi so sánh ngày tháng (ép về string hoặc timestamp để so sánh chính xác)
        $clientTime = \Carbon\Carbon::parse($request->updated_at)->timestamp;
        $dbTime = \Carbon\Carbon::parse($profile->updated_at)->timestamp;

        if ($clientTime != $dbTime) {
             return response()->json(['message' => 'Dữ liệu đã thay đổi bởi người khác.'], 409);
        }

        // 🛡 Validate dữ liệu
        $data = $request->validate([
            'user_firstname' => 'nullable|string|max:55',
            'user_lastname' => 'nullable|string|max:55',
            'user_phone' => 'nullable|string|max:15',
            'user_sex' => 'nullable|integer',
            'address' => 'nullable|string|max:255',
            'user_avatar_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'province_id' => 'nullable|integer',
            'district_id' => 'nullable|integer',
            'ward_id' => 'nullable|integer',
        ]);

        // 📌 Xử lý upload avatar
        if ($request->hasFile('user_avatar_file')) {
            // ❌ Xóa avatar cũ nếu là file trong storage (tránh rác server)
            if ($profile->user_avatar && str_contains($profile->user_avatar, 'storage/')) {
                $oldPath = str_replace('storage/', '', $profile->user_avatar);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // 📥 Upload file mới
            $path = $request->file('user_avatar_file')->store('avatars', 'public');
            $data['user_avatar'] = 'storage/' . $path;
        }

        // Loại bỏ field file khỏi mảng data để không lỗi khi update vào DB
        unset($data['user_avatar_file']);

        // ⚡ Cập nhật dữ liệu
        $profile->fill($data);
        $profile->save(); // updated_at sẽ tự động được cập nhật mới tại đây

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'profile' => $profile
        ], 200);
    }

    // ✅ 5. XÓA (Quyền: is_delete)
    public function destroy($id)
    {
        // 🔒 Check quyền
        if (!request()->user()->hasAccess('USER_PRO', 'is_delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa hồ sơ!'], 403);
        }

        $profile = UserProfile::findOrFail($id);

        // Xóa ảnh avatar nếu có trước khi xóa record
        if ($profile->user_avatar && str_contains($profile->user_avatar, 'storage/')) {
            $oldPath = str_replace('storage/', '', $profile->user_avatar);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $profile->delete();
        return response()->json(['message' => 'Đã xóa hồ sơ người dùng']);
    }
}
