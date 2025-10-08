<?php

namespace App\Http\Controllers\SSO;

use App\Http\Controllers\Controller;
use App\Models\User; // Pastikan model User di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // Jika perlu validasi token ke server SSO lagi
use Illuminate\Support\Str; // Untuk generate password random jika user baru

class SSOController extends Controller
{
    /**
     * Handle the callback from the SSO server.
     */
    public function handleCallback(Request $request)
    {
        // 1. Ambil token dari URL
        $token = $request->input('token');

        // Di sini Anda HARUS mem-parsing dan memvalidasi token JWT.
        // Untuk sekarang, kita akan melakukan decode sederhana (INI TIDAK AMAN UNTUK PRODUKSI)
        // Anda sebaiknya menggunakan library seperti firebase/php-jwt untuk validasi yang benar.
        try {
            $payload = json_decode(base64_decode(str_replace('_', '/', str_replace('-','+',explode('.', $token)[1]))));

            if (!$payload || !isset($payload->email)) {
                return redirect('/login')->with('error', 'Token SSO tidak valid.');
            }

        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Gagal memproses token SSO.');
        }

        // 2. Cari pengguna di database berdasarkan email dari token
        $user = User::where('email', $payload->email)->first();

        // 3. Jika pengguna tidak ada, buat akun baru untuknya
        if (!$user) {
            $user = User::create([
                'name' => $payload->name,
                'email' => $payload->email,
                // SSO user biasanya tidak punya password di sistem kita
                'password' => bcrypt(Str::random(16)),
            ]);
        }

        // 4. Login-kan pengguna tersebut
        Auth::login($user);

        // 5. Regenerate session dan arahkan ke dashboard
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
