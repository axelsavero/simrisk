<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserManageController;
use App\Http\Controllers\SasaranUnivController;
use App\Http\Controllers\IdentifyRiskController;
use App\Http\Controllers\SipegProxyController;

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
    Route::get('/proxy/sipeg/{any}', [SipegProxyController::class, 'proxy'])->where('any', '.*');
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('sasaran-univ', SasaranUnivController::class);

    Route::get('sasaran-univ/{sasaranUniv}/dokumen/{dokumenId}/download', 
        [SasaranUnivController::class, 'downloadDokumen'])
        ->name('sasaran-univ.download-dokumen');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/api/risk/{id}/detail', [DashboardController::class, 'getRiskDetail'])->name('risk.detail');
Route::post('/dashboard/export', [DashboardController::class, 'exportDashboard'])->name('dashboard.export');



// Routes untuk laporan
Route::prefix('laporan')->name('laporan.')->group(function () {
    Route::get('/', [LaporanController::class, 'index'])->name('index');
    Route::get('/risk-matrix', [LaporanController::class, 'riskMatrix'])->name('risk-matrix');
    Route::get('/risk-detail', [LaporanController::class, 'riskDetail'])->name('risk-detail');
    Route::get('/export-pdf', [LaporanController::class, 'exportPdf'])->name('export-pdf');
    Route::get('/export-excel', [LaporanController::class, 'exportExcel'])->name('export-excel');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';