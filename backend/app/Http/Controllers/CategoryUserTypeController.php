<?php

namespace App\Http\Controllers;

use App\Models\CategoryUserType;
use Illuminate\Http\Request;

class CategoryUserTypeController extends Controller
{
    public function index() {
        return response()->json(CategoryUserType::all());
    }

    public function store(Request $request) {
        $type = CategoryUserType::create($request->all());
        return response()->json($type, 201);
    }

    public function update(Request $request, $id) {
        $type = CategoryUserType::findOrFail($id);
        $type->update($request->all());
        return response()->json($type);
    }

    public function destroy($id) {
        CategoryUserType::destroy($id);
        return response()->json(null, 204);
    }
}
