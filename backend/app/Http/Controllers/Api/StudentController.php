<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\ExamSession;

class ExamSessionController extends Controller
{
    /**
     * Lấy danh sách tất cả các buổi thi.
     */
    public function index()
    {
        $exams = ExamSession::all();
        return response()->json($exams);
    }

    /**
     * Lấy thông tin chi tiết của một buổi thi.
     */
    public function show($id)
    {
        $exam = ExamSession::find($id);

        if (!$exam) {
            return response()->json([
                'message' => 'Exam session not found'
            ], 404);
        }

        return response()->json($exam);
    }

    /**
     * Thêm một buổi thi mới.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_code' => 'required|string|max:50|unique:exam_sessions,exam_code',
            'exam_name' => 'nullable|string|max:255',
            'course_id' => 'nullable|integer',
            'class_code' => 'nullable|string|max:50',
            'subject_name' => 'nullable|string|max:255',
            'exam_date' => 'nullable|date',
            'exam_start_time' => 'nullable',
            'exam_end_time' => 'nullable',
            'exam_room' => 'nullable|string|max:100',
            'total_students' => 'nullable|integer',
            'total_computers' => 'nullable|integer',
            'assigned_teacher1_id' => 'nullable|integer',
            'assigned_teacher2_id' => 'nullable|integer',
            'actual_teacher1_id' => 'nullable|integer',
            'actual_teacher2_id' => 'nullable|integer',
            'status' => 'nullable|string|max:50'
        ]);

        $exam = ExamSession::create($validated);

        return response()->json([
            'message' => 'Exam session created successfully',
            'data' => $exam
        ], 201);
    }

    /**
     * Cập nhật thông tin buổi thi.
     */
    public function update(Request $request, $id)
    {
        $exam = ExamSession::find($id);

        if (!$exam) {
            return response()->json([
                'message' => 'Exam session not found'
            ], 404);
        }

        $validated = $request->validate([
            'exam_name' => 'nullable|string|max:255',
            'class_code' => 'nullable|string|max:50',
            'subject_name' => 'nullable|string|max:255',
            'exam_date' => 'nullable|date',
            'exam_start_time' => 'nullable',
            'exam_end_time' => 'nullable',
            'exam_room' => 'nullable|string|max:100',
            'total_students' => 'nullable|integer',
            'total_computers' => 'nullable|integer',
            'assigned_teacher1_id' => 'nullable|integer',
            'assigned_teacher2_id' => 'nullable|integer',
            'actual_teacher1_id' => 'nullable|integer',
            'actual_teacher2_id' => 'nullable|integer',
            'status' => 'nullable|string|max:50'
        ]);

        $exam->update($validated);

        return response()->json([
            'message' => 'Exam session updated successfully',
            'data' => $exam
        ]);
    }

    /**
     * Xóa buổi thi.
     */
    public function destroy($id)
    {
        $exam = ExamSession::find($id);

        if (!$exam) {
            return response()->json([
                'message' => 'Exam session not found'
            ], 404);
        }

        $exam->delete();

        return response()->json([
            'message' => 'Exam session deleted successfully'
        ]);
    }
}
