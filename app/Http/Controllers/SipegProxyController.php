<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SipegProxyController extends Controller
{
    public function proxy($any, Request $request)
    {
        $url = "http://10.255.0.143/apisipeg/api/{$any}";
        Log::debug("Mengakses SIPEG API", [
            'url' => $url,
            'query' => $request->all(),
            'headers' => [
                'Authorization' => 'Bearer [REDACTED]',
                'Accept' => 'application/json',
            ],
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ3YmUzOTkxNTczZDIxOWQ4NzdmNjNjNTVjYWY2YjMzNWM4Nzc2N2Nh',
            ])->withoutVerifying()->get($url, $request->all());

            if ($response->failed()) {
                Log::error("Gagal mengakses SIPEG API", [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return response()->json([
                    'error' => 'Gagal menghubungi API SIPEG',
                    'message' => $response->body(),
                    'url' => $url,
                ], $response->status());
            }

            Log::info("Berhasil mengakses SIPEG API", [
                'url' => $url,
                'status' => $response->status(),
            ]);

            return response($response->body(), $response->status())
                ->header('Content-Type', $response->header('Content-Type'));
        } catch (\Exception $e) {
            Log::error("Kesalahan saat menghubungi SIPEG API", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => 'Gagal menghubungi API SIPEG',
                'message' => $e->getMessage(),
                'url' => $url,
            ], 500);
        }
    }
}
