<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-login', function () {
    return view('login');
});
