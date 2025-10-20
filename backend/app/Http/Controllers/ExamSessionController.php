<?php

namespace App\Http\Controllers;

use App\Models\ExamSession;
use Illuminate\Http\Request;

class ExamSessionController extends Controller
{
    public function index()
    {
        return response()->json(ExamSession::with(['course', 'teacher1', 'teacher2'])->get());
    }

    public function show($id)
    {
        return response()->json(ExamSession::with(['course', 'teacher1', 'teacher2'])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'exam_code' => 'required|string|max:50|unique:exam_sessions,exam_code',
            'exam_name' => 'required|string|max:255',
            'course_id' => 'required|exists:courses,course_id',
            'exam_date' => 'required|date',
            'exam_start_time' => 'required',
            'exam_end_time' => 'required',
            'assigned_teacher1_id' => 'nullable|exists:teachers,teacher_id',
            'assigned_teacher2_id' => 'nullable|exists:teachers,teacher_id',
            'exam_room' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:20',
        ]);

        $exam = ExamSession::create($data);
        return response()->json($exam, 201);
    }

    public function update(Request $request, $id)
    {
        $exam = ExamSession::findOrFail($id);
        $exam->update($request->all());
        return response()->json($exam);
    }

    public function destroy($id)
    {
        ExamSession::findOrFail($id)->delete();
        return response()->json(['message' => 'Exam session deleted']);
    }
}
