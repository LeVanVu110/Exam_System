<?php

namespace App\Http\Controllers;

use App\Models\CategoryPosition;
use Illuminate\Http\Request;

class CategoryPositionController extends Controller
{
    public function index()
    {
        return response()->json(CategoryPosition::all());
    }

    public function show($id)
    {
        return response()->json(CategoryPosition::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'position_code' => 'required|string|max:20|unique:category_positions',
            'position_name' => 'required|string|max:255',
        ]);

        $pos = CategoryPosition::create($data);
        return response()->json($pos, 201);
    }

    public function update(Request $request, $id)
    {
        $pos = CategoryPosition::findOrFail($id);
        $pos->update($request->all());
        return response()->json($pos);
    }

    public function destroy($id)
    {
        CategoryPosition::findOrFail($id)->delete();
        return response()->json(['message' => 'Position deleted']);
    }
}
