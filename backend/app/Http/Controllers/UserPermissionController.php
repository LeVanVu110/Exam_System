<?php

namespace App\Http\Controllers;

use App\Models\UserPermission;
use Illuminate\Http\Request;

class UserPermissionController extends Controller
{
    public function index() {
        return response()->json(UserPermission::with(['user', 'permission'])->get());
    }

    public function store(Request $request) {
        $userPermission = UserPermission::create($request->all());
        return response()->json($userPermission, 201);
    }

    public function destroy($id) {
        UserPermission::destroy($id);
        return response()->json(null, 204);
    }
}
