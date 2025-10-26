<?php

namespace App\Http\Controllers;

use App\Models\RolePermission;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    public function index() {
        return response()->json(RolePermission::with(['role', 'permission'])->get());
    }

    public function store(Request $request) {
        $rolePermission = RolePermission::create($request->all());
        return response()->json($rolePermission, 201);
    }

    public function destroy($id) {
        RolePermission::destroy($id);
        return response()->json(null, 204);
    }
}
