<?php

namespace App\Http\Controllers;

use App\Models\UserRole;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    public function index() {
        return response()->json(UserRole::with(['user', 'role'])->get());
    }

    public function store(Request $request) {
        $userRole = UserRole::create($request->all());
        return response()->json($userRole, 201);
    }

    public function destroy($id) {
        UserRole::destroy($id);
        return response()->json(null, 204);
    }
}
