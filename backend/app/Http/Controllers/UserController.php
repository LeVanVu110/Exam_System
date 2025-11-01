<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_code' => 'nullable|string|max:25',
            'user_name' => 'required|string|max:25|unique:users',
            'user_email' => 'nullable|email|max:255',
            'user_password' => 'required|string|min:6',
        ]);

        $data['user_password'] = Hash::make($data['user_password']);
        $data['user_is_activated'] = 1;
        $data['user_activate_at'] = now();

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->all();

        if (isset($data['user_password'])) {
            $data['user_password'] = Hash::make($data['user_password']);
        }

        $user->update($data);
        return response()->json($user);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
