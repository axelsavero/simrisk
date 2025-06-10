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
//...
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // --- RUTE MANUAL UNTUK IDENTIFY RISK CRUD ---

    // 1. Menampilkan daftar semua identifikasi risiko (Index)
    // URI: GET /identify-risk
    // Controller Action: IdentifyRiskController@index
    // Named Route: identify-risk.index
    Route::get('/identify-risk', [IdentifyRiskController::class, 'index'])
         ->name('identify-risk.index');

    // 2. Menampilkan formulir untuk membuat identifikasi risiko baru (Create)
    // URI: GET /identify-risk/create
    // Controller Action: IdentifyRiskController@create
    // Named Route: identify-risk.create
    Route::get('/identify-risk/create', [IdentifyRiskController::class, 'create'])
         ->name('identify-risk.create');

    // 3. Menyimpan identifikasi risiko baru ke database (Store)
    // URI: POST /identify-risk
    // Controller Action: IdentifyRiskController@store
    // Named Route: identify-risk.store
    Route::post('/identify-risk', [IdentifyRiskController::class, 'store'])
         ->name('identify-risk.store');

    // 4. (Opsional) Menampilkan detail satu identifikasi risiko (Show)
    // URI: GET /identify-risk/{identifyRisk}
    // Controller Action: IdentifyRiskController@show
    // Named Route: identify-risk.show
    // Jika Anda membuat method show() di controller.
    // Route::get('/identify-risk/{identifyRisk}', [IdentifyRiskController::class, 'show'])
    //      ->name('identify-risk.show');

    // 5. Menampilkan formulir untuk mengedit identifikasi risiko yang ada (Edit)
    // URI: GET /identify-risk/{identifyRisk}/edit
    // Controller Action: IdentifyRiskController@edit
    // Named Route: identify-risk.edit
    // Laravel akan otomatis melakukan Route Model Binding untuk {identifyRisk}
    Route::get('/identify-risk/{identifyRisk}/edit', [IdentifyRiskController::class, 'edit'])
         ->name('identify-risk.edit');

    // 6. Memperbarui identifikasi risiko yang ada di database (Update)
    // URI: PUT /identify-risk/{identifyRisk} (atau PATCH)
    // Controller Action: IdentifyRiskController@update
    // Named Route: identify-risk.update
    Route::put('/identify-risk/{identifyRisk}', [IdentifyRiskController::class, 'update'])
         ->name('identify-risk.update');
    // Anda bisa juga menggunakan PATCH jika hanya memperbarui sebagian data:
    // Route::patch('/identify-risk/{identifyRisk}', [IdentifyRiskController::class, 'update'])
    //      ->name('identify-risk.update'); // Nama rute bisa sama jika methodnya berbeda

    // 7. Menghapus identifikasi risiko dari database (Destroy)
    // URI: DELETE /identify-risk/{identifyRisk}
    // Controller Action: IdentifyRiskController@destroy
    // Named Route: identify-risk.destroy
    Route::delete('/identify-risk/{identifyRisk}', [IdentifyRiskController::class, 'destroy'])
         ->name('identify-risk.destroy');


    Route::post('/identify-risk/{identifyRisk}/approve', [IdentifyRiskController::class, 'approve'])
    ->name('identify-risk.approve');
    // ->middleware('can:approve,identifyRisk');

    Route::post('/identify-risk/{identifyRisk}/reject', [IdentifyRiskController::class, 'reject'])
         ->name('identify-risk.reject');

     Route::post('/identify-risk/{identifyRisk}/submit', [IdentifyRiskController::class, 'submit'])->name('identify-risk.submit');
    });




Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
