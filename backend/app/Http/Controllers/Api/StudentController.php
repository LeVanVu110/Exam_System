<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    /**
     * Danh sách tất cả sinh viên
     * GET /api/students
     */
    public function index()
    {
        $students = Student::with(['userProfile', 'faculty', 'major'])->get();
        return response()->json($students);
    }

    /**
     * Lấy thông tin sinh viên theo ID
     * GET /api/students/{id}
     */
    public function show($id)
    {
        $student = Student::with(['userProfile', 'faculty', 'major'])->find($id);

        if (!$student) {
            return response()->json(['message' => 'Không tìm thấy sinh viên'], 404);
        }

        return response()->json($student);
    }

    /**
     * Thêm sinh viên mới
     * POST /api/students
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_profile_id' => 'required|exists:user_profiles,user_profile_id',
            'category_faculty_id' => 'required|exists:category_faculty,category_faculty_id',
            'category_major_id' => 'required|exists:category_major,category_major_id',
            'student_score' => 'nullable|numeric',
            'student_cv' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = Student::create($request->all());
        return response()->json(['message' => 'Thêm sinh viên thành công', 'data' => $student], 201);
    }

    /**
     * Cập nhật thông tin sinh viên
     * PUT /api/students/{id}
     */
    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Không tìm thấy sinh viên'], 404);
        }

        $student->update($request->all());
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $student]);
    }

    /**
     * Xóa sinh viên
     * DELETE /api/students/{id}
     */
    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Không tìm thấy sinh viên'], 404);
        }

        $student->delete();
        return response()->json(['message' => 'Đã xóa sinh viên']);
    }
}
