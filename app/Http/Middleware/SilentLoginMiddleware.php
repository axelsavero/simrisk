<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class SilentLoginMiddleware
{
    /**
     * Handle an incoming request.
     * Attempts silent SSO login for guest users on their first page visit.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip if user is already authenticated
        if ($request->user()) {
            \Log::debug('SilentLogin: User already authenticated, skipping');
            return $next($request);
        }

        // Skip if this is the SSO callback route (prevent redirect loop)
        if ($request->is('callback')) {
            \Log::debug('SilentLogin: Callback route, skipping');
            return $next($request);
        }

        // Skip if this is the login route (let user use manual login)
        if ($request->is('login')) {
            \Log::debug('SilentLogin: Login route, skipping');
            return $next($request);
        }

        // Check if silent login has already been attempted in this session
        $silentLoginAttempted = $request->session()->get('silent_login_attempted', false);
        
        \Log::debug('SilentLogin: Check attempt status', [
            'attempted' => $silentLoginAttempted,
            'session_id' => $request->session()->getId()
        ]);

        if (!$silentLoginAttempted) {
            try {
                \Log::info('SilentLogin: Starting SSO API call');
                
                // Fetch SSO keys from the SSO API
                $ssoResponse = Http::withoutVerifying()->post(env('SSO_API_URL') . '/user-aplikasi/login-aplikasi', [
                    'client_id' => env('SSO_CLIENT_ID'),
                ]);

                if ($ssoResponse->successful()) {
                    $ssoData = $ssoResponse->json()['data'];
                    
                    \Log::info('SilentLogin: SSO API successful', [
                        'public_key' => $ssoData['public_key']
                    ]);
                    
                    // Store private_key in session for JWT decoding later
                    $request->session()->put('sso_private_key', $ssoData['private_key']);
                    $request->session()->put('sso_public_key', $ssoData['public_key']);
                    
                    // Mark silent login as attempted to prevent infinite loops
                    $request->session()->put('silent_login_attempted', true);
                    
                    // IMPORTANT: Save session before redirect to ensure data persists
                    $request->session()->save();
                    
                    // Redirect to SSO silent login endpoint
                    $silentLoginUrl = env('SSO_API_URL') . '/user-aplikasi/silent-login-microsoft?public_key=' . $ssoData['public_key'];
                    
                    \Log::info('SilentLogin: Redirecting to SSO', [
                        'from' => $request->fullUrl(),
                        'to' => $silentLoginUrl,
                        'is_inertia' => $request->header('X-Inertia') ? true : false
                    ]);
                    
                    // Use appropriate redirect based on request type
                    // For Inertia requests (AJAX), use Inertia::location
                    // For regular requests (first page load), use standard redirect
                    if ($request->header('X-Inertia')) {
                        return Inertia::location($silentLoginUrl);
                    }
                    
                    // Standard HTTP redirect for initial page load
                    return redirect()->away($silentLoginUrl);
                } else {
                    \Log::warning('SilentLogin: SSO API failed', [
                        'status' => $ssoResponse->status(),
                        'body' => $ssoResponse->body()
                    ]);
                }
            } catch (\Exception $e) {
                // If SSO is unavailable, log the error and continue to the page
                \Log::warning('SilentLogin: Exception occurred', [
                    'error' => $e->getMessage(),
                    'url' => $request->fullUrl()
                ]);
                
                // Mark as attempted to prevent retry on every request
                $request->session()->put('silent_login_attempted', true);
            }
        }

        return $next($request);
    }
}

