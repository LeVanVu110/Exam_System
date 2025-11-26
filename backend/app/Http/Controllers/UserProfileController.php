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

        // ✅ Thêm validation chi tiết cho hàm update
        $data = $request->validate([
            // user_id và category_user_type_id có thể không cần thiết phải update thường xuyên
            // Tùy theo logic ứng dụng, có thể để optional hoặc loại bỏ khỏi update
            'user_firstname' => 'nullable|string|max:55',
            'user_lastname' => 'nullable|string|max:55',
            'user_phone' => 'nullable|string|max:15',
            'user_sex' => 'nullable|integer',
            'address' => 'nullable|string|max:255',
            'user_avatar_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Tối đa 2MB
        ]);
        if ($request->hasFile('user_avatar_file')) {
            // 1. Xóa ảnh cũ (nếu có và không phải là đường dẫn URL mặc định)
            if ($profile->user_avatar && strpos($profile->user_avatar, 'storage/') !== false) {
                // Lấy đường dẫn tương đối (ví dụ: avatars/tenfile.jpg)
                $oldPath = str_replace('storage/', '', $profile->user_avatar); 
                Storage::disk('public')->delete($oldPath);
            }
            
            // 2. Lưu ảnh mới vào thư mục 'avatars' trong storage/app/public
            $path = $request->file('user_avatar_file')->store('avatars', 'public');
            
            // 3. Cập nhật đường dẫn lưu trữ trong DB (storage/avatars/ten_file.jpg)
            $data['user_avatar'] = 'storage/' . $path; 
        }

        // Loại bỏ trường file trước khi update các trường khác
        unset($data['user_avatar_file']);

        $profile->update($data); // Chỉ update các trường đã được validate
        return response()->json($profile);
    }

    public function destroy($id)
    {
        $profile = UserProfile::findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'User profile deleted']);
    }
}
