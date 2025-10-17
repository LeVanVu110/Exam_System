<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $json = Storage::get('mock/exams.json');
        $exams = json_decode($json, true);

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
