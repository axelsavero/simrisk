<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserManageController;
use App\Http\Controllers\SasaranUnivController;
use App\Http\Controllers\IdentifyRiskController;
use App\Http\Controllers\MitigasiController;
use App\Http\Controllers\SipegProxyController;
use App\Http\Controllers\ReferensiController;
use App\Http\Controllers\SasaranUnitController;
use App\Http\Controllers\SSO\SSOController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/user/manage', [UserManageController::class, 'index'])->name('user.manage.index');
    Route::get('/user/manage/create', [UserManageController::class, 'create'])->name('user.manage.create');
    Route::post('/user/manage', [UserManageController::class, 'store'])->name('user.manage.store');
    Route::get('/user/manage/{user}/edit', [UserManageController::class, 'edit'])->name('user.manage.edit');
    Route::put('/user/manage/{user}', [UserManageController::class, 'update'])->name('user.manage.update');
    Route::delete('/user/manage/{user}', [UserManageController::class, 'destroy'])->name('user.manage.destroy');
    Route::get('/api/sipeg/{any}', [SipegProxyController::class, 'proxy'])->where('any', '.*');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/api/risk/{id}/detail', [DashboardController::class, 'getRiskDetail'])->name('risk.detail');
    Route::post('/dashboard/export', [DashboardController::class, 'exportDashboard'])->name('dashboard.export');

    Route::resource('identify-risk', IdentifyRiskController::class);

    Route::prefix('identify-risk')->name('identify-risk.')->group(function () {
        Route::post('{identifyRisk}/submit', [IdentifyRiskController::class, 'submit'])->name('submit');
        Route::post('{identifyRisk}/approve', [IdentifyRiskController::class, 'approve'])->name('approve');
        Route::post('{identifyRisk}/reject', [IdentifyRiskController::class, 'reject'])->name('reject');
        Route::get('{identifyRisk}/download-bukti', [IdentifyRiskController::class, 'downloadBukti'])->name('download-bukti');
    })->name('identify-risk');

    Route::resource('mitigasi', MitigasiController::class);

    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('/', [LaporanController::class, 'index'])->name('index');
        Route::post('/export-pdf', [LaporanController::class, 'exportPdf'])->name('export-pdf');
        Route::post('/export-excel', [LaporanController::class, 'exportExcel'])->name('export-excel');
    });

    Route::prefix('mitigasi')->name('mitigasi.')->group(function () {
        Route::patch('{mitigasi}/progress', [MitigasiController::class, 'updateProgress'])->name('update-progress');
        Route::get('{mitigasi}/bukti/{filename}', [MitigasiController::class, 'downloadBukti'])->name('downloadBukti');
        Route::delete('{mitigasi}/remove-bukti', [MitigasiController::class, 'removeBukti'])->name('remove-bukti');
        Route::get('statistics', [MitigasiController::class, 'getStatistics'])->name('statistics');
        Route::post('{mitigasi}/submit', [MitigasiController::class, 'submit'])->name('submit');
        Route::post('{mitigasi}/approve', [MitigasiController::class, 'approve'])->name('approve');
        Route::post('{mitigasi}/reject', [MitigasiController::class, 'reject'])->name('reject');
    })->name('mitigasi');

    Route::get('api/risk/{identifyRisk}/mitigasi', [MitigasiController::class, 'getByRisk'])->name('api.risk.mitigasi');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('sasaran-univ', SasaranUnivController::class);
    Route::get('sasaran-univ/{sasaranUniv}/dokumen/{dokumenId}/download', [SasaranUnivController::class, 'downloadDokumen'])->name('sasaran-univ.download-dokumen');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('sasaran-unit', SasaranUnitController::class);
    Route::get('sasaran-unit/{sasaranUnit}/dokumen/{dokumenId}/download', [SasaranUnitController::class, 'downloadDokumen'])->name('sasaran-unit.download-dokumen');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/user/operator', [UserManageController::class, 'operatorIndex'])->name('user.operator.index');
    Route::get('/user/operator/create', [UserManageController::class, 'createOperator'])->name('user.operator.create');
    Route::post('/user/operator', [UserManageController::class, 'storeOperator'])->name('user.operator.store');
    Route::get('/user/operator/{user}/edit', [UserManageController::class, 'editOperator'])->name('user.operator.edit');
    Route::put('/user/operator/{user}', [UserManageController::class, 'updateOperator'])->name('user.operator.update');
    Route::delete('/user/operator/{user}', [UserManageController::class, 'destroyOperator'])->name('user.operator.destroy');
});

Route::resource('referensi', ReferensiController::class);

Route::get('/callback', [SSOController::class, 'handleCallback'])->name('sso.callback');

require __DIR__.'/auth.php';

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
