<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use Illuminate\Http\Request;

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
        $profile->update($request->all());
        return response()->json($profile);
    }

    public function destroy($id)
    {
        $profile = UserProfile::findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'User profile deleted']);
    }
}
