<?php

namespace App\Http\Controllers\SSO;

use App\Http\Controllers\Controller;
use App\Models\User; // Pastikan model User di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // Jika perlu validasi token ke server SSO lagi


class SSOController extends Controller
{
    /**
     * Handle the callback from the SSO server.
     * Implements silent login for existing users only.
     */
    public function handleCallback(Request $request)
    {
        // 1. Ambil token dari URL
        $token = $request->input('token');

        // Validasi token JWT
        // CATATAN: Untuk produksi, gunakan library seperti firebase/php-jwt untuk validasi yang lebih aman
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

        // 3. VALIDASI: Hanya izinkan login jika user sudah ada di database
        if (!$user) {
            return redirect('/login')->with('error', 'Akun Anda belum terdaftar di sistem. Silakan hubungi administrator untuk mendaftarkan akun Anda.');
        }

        // 4. Silent Login - Login pengguna yang sudah terdaftar
        Auth::login($user);

        // 5. Regenerate session untuk keamanan
        $request->session()->regenerate();

        // 6. Redirect ke dashboard
        return redirect()->intended(route('dashboard', absolute: false));
    }
}
