<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $path = storage_path('app/mock/exams.json');
        if (!file_exists($path)) {
            return response()->json(['error' => 'Mock file not found', 'path' => $path], 404);
        };
        $exams = json_decode(file_get_contents($path), true);

        $room = $request->query('room');
        if ($room) {
            $exams = array_filter($exams, fn($exam) => strtolower($exam['room']) === strtolower($room));
        }

        return response()->json([
            'message' => $room ? "Danh sách ca thi phòng ($room)" : "Tất cả các ca thi",
            'count' => count($exams),
            'data' => array_values($exams)
        ]);
    }
}
