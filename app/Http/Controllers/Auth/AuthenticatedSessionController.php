<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        $sso_response = Http::withoutVerifying()->post(env('SSO_API_URL').'/user-aplikasi/login-aplikasi', [
            'client_id' => env('SSO_CLIENT_ID'),
        ]);
        
        // Store private_key in session for JWT decoding later
        $ssoData = $sso_response->json()['data'];
        $request->session()->put('sso_private_key', $ssoData['private_key']);
        
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'public_key' => $ssoData['public_key'],
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        // Clear silent login flag to allow retry after logout
        $request->session()->forget('silent_login_attempted');
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect to SSO logout to clear Microsoft session
        return Inertia::location(env('SSO_API_URL').'/user/logout');
    }
}
