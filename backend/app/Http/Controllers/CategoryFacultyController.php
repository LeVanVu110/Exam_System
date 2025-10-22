<?php

namespace App\Http\Controllers;

use App\Models\CategoryFaculty;
use Illuminate\Http\Request;

class CategoryFacultyController extends Controller
{
    public function index()
    {
        return response()->json(CategoryFaculty::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'faculty_code' => 'required|string|max:20|unique:category_faculties',
            'faculty_name' => 'required|string|max:255',
        ]);

        $faculty = CategoryFaculty::create($data);
        return response()->json($faculty, 201);
    }

    public function show($id)
    {
        $faculty = CategoryFaculty::with('majors')->findOrFail($id);
        return response()->json($faculty);
    }

    public function update(Request $request, $id)
    {
        $faculty = CategoryFaculty::findOrFail($id);
        $faculty->update($request->all());
        return response()->json($faculty);
    }

    public function destroy($id)
    {
        CategoryFaculty::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
