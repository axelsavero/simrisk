<?php

use App\Http\Controllers\SipegProxyController;
use App\Http\Controllers\UnitController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route untuk unit dan pegawai
Route::get('/sipegproxy/allunit', [SipegProxyController::class, 'allunit']);
Route::get('/sipegproxy/pegawai', [SipegProxyController::class, 'pegawai']);

// Route dinamis untuk endpoint SIPEG lain
Route::get('/sipegproxy/{any}', [SipegProxyController::class, 'proxy'])->where('any', '.*');

// Unit routes (dari database lokal)
Route::get('/units', [UnitController::class, 'index']);
Route::get('/units/{id}', [UnitController::class, 'show']);
Route::post('/sinkron-unit', [SipegProxyController::class, 'sinkronUnit']);
