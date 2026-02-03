<?php

namespace App\Http\Controllers\SSO;

use App\Http\Controllers\Controller;
use App\Models\User; // Pastikan model User di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // Jika perlu validasi token ke server SSO lagi
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


class SSOController extends Controller
{
    /**
     * Handle the callback from the SSO server.
     * Implements silent login for existing users only.
     */
    public function handleCallback(Request $request)
    {
        \Log::info('SSO Callback started', ['url' => $request->fullUrl()]);
        
        // 1. Ambil token dari URL
        $token = $request->input('token');

        if (!$token) {
            \Log::error('SSO token not found in request');
            return redirect('/login')->with('error', 'Token SSO tidak ditemukan.');
        }
        
        \Log::info('SSO token received', ['token_length' => strlen($token)]);

        // 2. Ambil private_key dari session
        $privateKey = $request->session()->get('sso_private_key');

        if (!$privateKey) {
            \Log::error('SSO private key not found in session');
            return redirect('/login')->with('error', 'Session SSO tidak valid. Silakan login kembali.');
        }
        
        \Log::info('Private key found in session');

        // 3. Decode JWT token menggunakan firebase/php-jwt dengan private_key
        try {
            // Add leeway to handle time sync differences between servers (60 seconds tolerance)
            JWT::$leeway = 60;
            
            $decoded = JWT::decode($token, new Key($privateKey, 'HS256'));
            
            \Log::info('JWT decoded successfully', ['email' => $decoded->email ?? 'no email']);
            
            if (!$decoded || !isset($decoded->email)) {
                \Log::error('Invalid JWT structure', ['decoded' => $decoded]);
                return redirect('/login')->with('error', 'Token SSO tidak valid.');
            }

        } catch (\Firebase\JWT\ExpiredException $e) {
            \Log::error('JWT token expired', ['error' => $e->getMessage()]);
            return redirect('/login')->with('error', 'Token SSO sudah kadaluarsa. Silakan login kembali.');
        } catch (\Exception $e) {
            \Log::error('JWT decode failed', ['error' => $e->getMessage()]);
            return redirect('/login')->with('error', 'Gagal memproses token SSO: ' . $e->getMessage());
        }

        // 4. Cari pengguna di database berdasarkan email dari token
        $user = User::where('email', $decoded->email)->first();
        
        \Log::info('User lookup', ['email' => $decoded->email, 'found' => $user ? 'yes' : 'no']);

        // 5. VALIDASI: Hanya izinkan login jika user sudah ada di database
        if (!$user) {
            \Log::warning('User not found in database', ['email' => $decoded->email]);
            return redirect('/login')->with('error', 'Akun Anda belum terdaftar di sistem. Silakan hubungi administrator untuk mendaftarkan akun Anda.');
        }

        // 6. Silent Login - Login pengguna yang sudah terdaftar
        Auth::login($user);
        
        \Log::info('User logged in successfully', ['user_id' => $user->id, 'email' => $user->email]);

        // 7. Regenerate session untuk keamanan
        $request->session()->regenerate();
        
        \Log::info('Session regenerated');

        // 8. Redirect ke dashboard
        $dashboardUrl = route('dashboard', absolute: false);
        \Log::info('Redirecting to dashboard', ['url' => $dashboardUrl]);
        
        return redirect()->intended($dashboardUrl);
    }
}
