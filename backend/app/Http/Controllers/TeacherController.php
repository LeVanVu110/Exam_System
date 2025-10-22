<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = Teacher::with(['userProfile', 'faculty', 'major', 'position'])->get();
        return response()->json($teachers);
    }

    public function show($id)
    {
        $teacher = Teacher::with(['userProfile', 'faculty', 'major', 'position'])->findOrFail($id);
        return response()->json($teacher);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_profile_id' => 'required|integer|exists:user_profiles,user_profile_id',
            'category_faculty_id' => 'required|integer|exists:category_faculties,category_faculty_id',
            'category_major_id' => 'required|integer|exists:category_majors,category_major_id',
            'category_position_id' => 'required|integer|exists:category_positions,category_position_id',
        ]);

        $teacher = Teacher::create($data);
        return response()->json($teacher, 201);
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        $teacher->update($request->all());
        return response()->json($teacher);
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        $teacher->delete();
        return response()->json(['message' => 'Teacher deleted']);
    }
}
