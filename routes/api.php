<?php

use App\Http\Controllers\SipegProxyController;
use App\Http\Controllers\UnitController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Unit routes (from local database)
Route::get('/units', [UnitController::class, 'index']);
Route::get('/units/{id}', [UnitController::class, 'show']);

// Keep SIPEG sync for initial data population
Route::post('/sinkron-unit', [SipegProxyController::class, 'sinkronUnit']);
