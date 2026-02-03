<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    /**
     * Display the welcome page with silent login check.
     */
    public function index(Request $request)
    {
        \Log::info('WelcomeController: Loading welcome page');

        // If user is already authenticated, redirect to dashboard
        if ($request->user()) {
            \Log::info('WelcomeController: User authenticated, redirecting to dashboard');
            return redirect()->route('dashboard');
        }

        // Force retry if requested via query param
        // Force retry if requested via query param
        if ($request->has('retry_sso')) {
            $request->session()->forget('silent_login_attempted');
        }

        // Check if silent login has already been attempted recently
        $lastAttemptTime = $request->session()->get('silent_login_attempted');
        $silentLoginAttempted = false;

        // If attempted less than 5 seconds ago, skip to prevent loop
        if ($lastAttemptTime && (time() - $lastAttemptTime < 5)) {
            $silentLoginAttempted = true;
            \Log::info('WelcomeController: Skipping silent login (rapid retry detected)', [
                'last_attempt' => $lastAttemptTime,
                'time_diff' => time() - $lastAttemptTime
            ]);
        }
        
        $silentLoginUrl = null;

        if (!$silentLoginAttempted) {
            \Log::info('WelcomeController: Attempting silent login flow');
            try {
                // Fetch SSO keys from the SSO API
                $ssoResponse = Http::withoutVerifying()->post(env('SSO_API_URL') . '/user-aplikasi/login-aplikasi', [
                    'client_id' => env('SSO_CLIENT_ID'),
                ]);

                if ($ssoResponse->successful()) {
                    $ssoData = $ssoResponse->json()['data'];
                    
                    // Store private_key in session for JWT decoding later
                    $request->session()->put('sso_private_key', $ssoData['private_key']);
                    $request->session()->put('sso_public_key', $ssoData['public_key']);
                    
                    // Mark silent login as attempted with TIMESTAMP
                    $request->session()->put('silent_login_attempted', time());
                    
                    // Build redirect URL for frontend to handle
                    $silentLoginUrl = env('SSO_API_URL') . '/user-aplikasi/silent-login-microsoft?public_key=' . $ssoData['public_key'];
                    
                    \Log::info('WelcomeController: Passing SSO URL to frontend', [
                        'url' => $silentLoginUrl
                    ]);
                } else {
                    \Log::warning('WelcomeController: SSO API returned error', [
                        'status' => $ssoResponse->status(),
                        'body' => $ssoResponse->body()
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('WelcomeController: Silent login failed', [
                    'error' => $e->getMessage()
                ]);
                
                // Mark as attempted with TIMESTAMP
                $request->session()->put('silent_login_attempted', time());
            }
        }

        // Render the welcome page with optional redirect URL
        return Inertia::render('welcome', [
            'public_key' => $request->session()->get('sso_public_key'),
            'silentLoginUrl' => $silentLoginUrl,
        ]);
    }
}
