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

    public function sinkronUnit()
    {
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ3YmUzOTkxNTczZDIxOWQ4NzdmNjNjNTVjYWY2YjMzNWM4Nzc2N2Nh',
            ])->withoutVerifying()->get('http://10.255.0.143/apisipeg/api/allunit');

            if ($response->failed()) {
                return response()->json(['error' => 'Gagal ambil data dari SIPEG'], 500);
            }

            $units = $response->json();
            $count = 0;
            foreach ($units as $unit) {
                \App\Models\Unit::updateOrCreate(
                    ['id_unit' => $unit['id_unit'] ?? $unit['unit_id'] ?? null],
                    [
                        'nama_unit' => $unit['nama_unit'] ?? $unit['ur_unit'] ?? '',
                        'jenis_unit' => $unit['jenis_unit'] ?? null,
                        'level_unit' => $unit['level_unit'] ?? null,
                        'kode_unit' => $unit['kode_unit'] ?? $unit['id_unit'] ?? null,
                        // ...tambahkan kolom lain sesuai kebutuhan
                    ]
                );
                $count++;
            }
            return response()->json(['message' => "Sinkronisasi unit selesai. Total: $count unit."]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal sinkronisasi unit', 'message' => $e->getMessage()], 500);
        }
    }
}
