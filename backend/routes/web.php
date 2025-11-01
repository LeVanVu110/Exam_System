<?php

use Illuminate\Support\Facades\Route;

Route::get('/exams', function () {
    $path = storage_path('app/mock/exams.json');

    if (!file_exists($path)) {
        return response()->json(['error' => 'Mock file not found'], 404);
    }

    $data = json_decode(file_get_contents($path), true);
    return response()->json($data);
});
