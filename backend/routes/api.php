<?php

use App\Http\Controllers\Api\ExamController;
use Illuminate\Support\Facades\Route;

Route::get('/exams', [ExamController::class, 'index']);
