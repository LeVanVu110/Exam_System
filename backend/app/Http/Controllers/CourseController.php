<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with(['faculty', 'major', 'teacher'])->get();
        return response()->json($courses);
    }

    public function show($id)
    {
        $course = Course::with(['faculty', 'major', 'teacher'])->findOrFail($id);
        return response()->json($course);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'course_code' => 'required|string|max:20|unique:courses',
            'course_name' => 'required|string|max:255',
            'category_faculty_id' => 'required|integer|exists:category_faculties,category_faculty_id',
            'category_major_id' => 'required|integer|exists:category_majors,category_major_id',
            'teacher_id' => 'required|integer|exists:teachers,teacher_id',
            'credits' => 'required|integer|min:1',
        ]);

        $course = Course::create($data);
        return response()->json($course, 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $course->update($request->all());
        return response()->json($course);
    }

    public function destroy($id)
    {
        Course::findOrFail($id)->delete();
        return response()->json(['message' => 'Course deleted']);
    }
}
