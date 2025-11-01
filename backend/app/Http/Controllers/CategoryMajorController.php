<?php

namespace App\Http\Controllers;

use App\Models\CategoryMajor;
use Illuminate\Http\Request;

class CategoryMajorController extends Controller
{
    public function index()
    {
        return response()->json(CategoryMajor::with('faculty')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'major_code' => 'required|string|max:20|unique:category_majors',
            'major_name' => 'required|string|max:255',
            'category_faculty_id' => 'required|exists:category_faculties,category_faculty_id',
        ]);

        $major = CategoryMajor::create($data);
        return response()->json($major, 201);
    }

    public function show($id)
    {
        $major = CategoryMajor::with('faculty')->findOrFail($id);
        return response()->json($major);
    }

    public function update(Request $request, $id)
    {
        $major = CategoryMajor::findOrFail($id);
        $major->update($request->all());
        return response()->json($major);
    }

    public function destroy($id)
    {
        CategoryMajor::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
