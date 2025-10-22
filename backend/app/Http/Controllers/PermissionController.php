<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index() {
        return response()->json(Permission::all());
    }

    public function store(Request $request) {
        $permission = Permission::create($request->all());
        return response()->json($permission, 201);
    }

    public function show($id) {
        return response()->json(Permission::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $permission = Permission::findOrFail($id);
        $permission->update($request->all());
        return response()->json($permission);
    }

    public function destroy($id) {
        Permission::destroy($id);
        return response()->json(null, 204);
    }
}
