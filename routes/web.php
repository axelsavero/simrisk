<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserManageController;
use App\Http\Controllers\IdentityRiskController;

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

    // --- RUTE MANUAL UNTUK IDENTITY RISK CRUD ---

    // 1. Menampilkan daftar semua identifikasi risiko (Index)
    // URI: GET /identity-risk
    // Controller Action: IdentityRiskController@index
    // Named Route: identity-risk.index
    Route::get('/identity-risk', [IdentityRiskController::class, 'index'])
         ->name('identity-risk.index');

    // 2. Menampilkan formulir untuk membuat identifikasi risiko baru (Create)
    // URI: GET /identity-risk/create
    // Controller Action: IdentityRiskController@create
    // Named Route: identity-risk.create
    Route::get('/identity-risk/create', [IdentityRiskController::class, 'create'])
         ->name('identity-risk.create');

    // 3. Menyimpan identifikasi risiko baru ke database (Store)
    // URI: POST /identity-risk
    // Controller Action: IdentityRiskController@store
    // Named Route: identity-risk.store
    Route::post('/identity-risk', [IdentityRiskController::class, 'store'])
         ->name('identity-risk.store');

    // 4. (Opsional) Menampilkan detail satu identifikasi risiko (Show)
    // URI: GET /identity-risk/{identityRisk}
    // Controller Action: IdentityRiskController@show
    // Named Route: identity-risk.show
    // Jika Anda membuat method show() di controller.
    // Route::get('/identity-risk/{identityRisk}', [IdentityRiskController::class, 'show'])
    //      ->name('identity-risk.show');

    // 5. Menampilkan formulir untuk mengedit identifikasi risiko yang ada (Edit)
    // URI: GET /identity-risk/{identityRisk}/edit
    // Controller Action: IdentityRiskController@edit
    // Named Route: identity-risk.edit
    // Laravel akan otomatis melakukan Route Model Binding untuk {identityRisk}
    Route::get('/identity-risk/{identityRisk}/edit', [IdentityRiskController::class, 'edit'])
         ->name('identity-risk.edit');

    // 6. Memperbarui identifikasi risiko yang ada di database (Update)
    // URI: PUT /identity-risk/{identityRisk} (atau PATCH)
    // Controller Action: IdentityRiskController@update
    // Named Route: identity-risk.update
    Route::put('/identity-risk/{identityRisk}', [IdentityRiskController::class, 'update'])
         ->name('identity-risk.update');
    // Anda bisa juga menggunakan PATCH jika hanya memperbarui sebagian data:
    // Route::patch('/identity-risk/{identityRisk}', [IdentityRiskController::class, 'update'])
    //      ->name('identity-risk.update'); // Nama rute bisa sama jika methodnya berbeda

    // 7. Menghapus identifikasi risiko dari database (Destroy)
    // URI: DELETE /identity-risk/{identityRisk}
    // Controller Action: IdentityRiskController@destroy
    // Named Route: identity-risk.destroy
    Route::delete('/identity-risk/{identityRisk}', [IdentityRiskController::class, 'destroy'])
         ->name('identity-risk.destroy');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
