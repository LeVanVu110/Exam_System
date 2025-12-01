<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; 

class UserProfileController extends Controller
{
    public function index()
    {
        return response()->json(UserProfile::with(['user', 'categoryUserType'])->get());
    }

    public function show($id)
    {
        $profile = UserProfile::with(['user', 'categoryUserType'])->findOrFail($id);
        return response()->json($profile);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'category_user_type_id' => 'required|integer',
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

    public function update(Request $request, $id)
    {
        $profile = UserProfile::findOrFail($id);

        // 🛑 NẾU KHÔNG GỬI updated_at NĂM TRONG REACT → BÁO LỖI
        if (!$request->has('updated_at')) {
            return response()->json([
                'message' => 'Thiếu dữ liệu phiên bản cập nhật (updated_at). Hãy tải lại trang và thử lại.'
            ], 409);
        }

        // 🔍 Kiểm tra xung đột dữ liệu (Optimistic Locking)
        if ($request->updated_at != $profile->updated_at) {
            return response()->json([
                'message' => 'Dữ liệu đã được cập nhật bởi tab khác! Vui lòng tải lại trang để có dữ liệu mới nhất.'
            ], 409);
        }

        // 🛡 Validate dữ liệu
        $data = $request->validate([
            'user_firstname' => 'nullable|string|max:55',
            'user_lastname' => 'nullable|string|max:55',
            'user_phone' => 'nullable|string|max:15',
            'user_sex' => 'nullable|integer',
            'address' => 'nullable|string|max:255',
            'user_avatar_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // 📌 Xử lý upload avatar
        if ($request->hasFile('user_avatar_file')) {

            // ❌ Xóa avatar cũ nếu là file trong storage
            if ($profile->user_avatar && str_contains($profile->user_avatar, 'storage/')) {
                $oldPath = str_replace('storage/', '', $profile->user_avatar);
                Storage::disk('public')->delete($oldPath);
            }

            // 📥 upload file mới
            $path = $request->file('user_avatar_file')->store('avatars', 'public');
            $data['user_avatar'] = 'storage/' . $path;
        }
        unset($data['user_avatar_file']);

        // ⚡ Cập nhật dữ liệu
        $profile->fill($data);
        $profile->save();

        return response()->json([
            'message' => 'Cập nhật thành công!',
            'profile' => $profile
        ], 200);
    }


    public function destroy($id)
    {
        $profile = UserProfile::findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'User profile deleted']);
    }
}