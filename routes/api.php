<?php

use App\Http\Controllers\SipegProxyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/sinkron-unit', [SipegProxyController::class, 'sinkronUnit']);
