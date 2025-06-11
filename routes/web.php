<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserManageController;
use App\Http\Controllers\IdentifyRiskController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/user/manage', [UserManageController::class, 'index'])->name('user.manage.index');

    // Route untuk menampilkan form tambah user
    Route::get('/user/manage/create', [UserManageController::class, 'create'])->name('user.manage.create');

    // Route untuk menyimpan user baru
    Route::post('/user/manage', [UserManageController::class, 'store'])->name('user.manage.store');

    Route::get('/user/manage/{user}/edit', [UserManageController::class, 'edit'])->name('user.manage.edit');
    Route::put('/user/manage/{user}', [UserManageController::class, 'update'])->name('user.manage.update');
    Route::delete('/user/manage/{user}', [UserManageController::class, 'destroy'])->name('user.manage.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('identify-risk', IdentifyRiskController::class);
    
    // Routes untuk workflow dan file handling
    Route::prefix('identify-risk')->name('identify-risk.')->group(function () {
        // Workflow routes
        Route::post('{identifyRisk}/submit', [IdentifyRiskController::class, 'submit'])
              ->name('submit');
        Route::post('{identifyRisk}/approve', [IdentifyRiskController::class, 'approve'])
              ->name('approve');
        Route::post('{identifyRisk}/reject', [IdentifyRiskController::class, 'reject'])
              ->name('reject');
        
        // File download route
        Route::get('{identifyRisk}/download-bukti', [IdentifyRiskController::class, 'downloadBukti'])
              ->name('download-bukti');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
