<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SipegProxyController extends Controller
{
    // Fetch daftar unit dari SIPEG
    public function allunit(Request $request)
    {
        $url = "http://10.255.0.143/apisipeg/api/allunit";
        Log::debug("Mengakses SIPEG API Unit", ['url' => $url]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => env('SIPEG_TOKEN', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ3YmUzOTkxNTczZDIxOWQ4NzdmNjNjNTVjYWY2YjMzNWM4Nzc2N2Nh'),
            ])->withoutVerifying()->get($url);

            if ($response->failed()) {
                Log::error("Gagal mengakses SIPEG API Unit", [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return response()->json([
                    'error' => 'Gagal mengambil data unit dari SIPEG',
                    'status' => $response->status(),
                    'message' => $response->body(),
                ], $response->status());
            }

            $data = $response->json();
            $unitData = $this->processApiData($data, 'units');

            // Transformasi unit untuk frontend
            $filteredUnits = collect($unitData)->filter(function ($unit) {
                $name = $unit['nama_unit'] ?? $unit['ur_unit'] ?? $unit['name'] ?? $unit['unit_name'] ?? '';
                return !empty(trim($name));
            })->map(function ($unit) {
                return [
                    'id' => $unit['id'] ?? $unit['id_homebase'] ?? $unit['kode_homebase'] ?? $unit['kode_unit'] ?? $unit['unit_id'] ?? 0,
                    'name' => $unit['nama_unit'] ?? $unit['ur_unit'] ?? $unit['name'] ?? $unit['unit_name'] ?? '',
                ];
            })->values()->toArray();

            Log::info("Berhasil mengakses SIPEG API Unit", [
                'url' => $url,
                'count' => count($filteredUnits),
            ]);

            return response()->json([
                'success' => true,
                'data' => $filteredUnits,
                'count' => count($filteredUnits),
            ]);

        } catch (\Exception $e) {
            Log::error("Kesalahan saat menghubungi SIPEG API Unit", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => 'Gagal menghubungi API SIPEG',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Fetch pegawai dengan filter unit_kerja
    public function pegawai(Request $request)
    {
        $unitKerja = $request->query('unit_kerja');
        if (!$unitKerja || trim($unitKerja) === '') {
            return response()->json([
                'error' => 'Parameter unit_kerja diperlukan dan tidak boleh kosong.',
                'message' => 'Contoh: ?unit_kerja=Subdit Sumber Daya Manusia'
            ], 400);
        }

        $url = "http://10.255.0.143/apisipeg/api/pegawai";
        Log::debug("Mengakses SIPEG API Pegawai", [
            'url' => $url,
            'unit_kerja' => $unitKerja,
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => env('SIPEG_TOKEN', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ3YmUzOTkxNTczZDIxOWQ4NzdmNjNjNTVjYWY2YjMzNWM4Nzc2N2Nh'),
            ])->withoutVerifying()->get($url);

            if ($response->failed()) {
                Log::error("Gagal mengakses SIPEG API Pegawai", [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'unit_kerja' => $unitKerja,
                ]);
                return response()->json([
                    'error' => 'Gagal mengambil data pegawai dari SIPEG',
                    'status' => $response->status(),
                    'message' => $response->body(),
                ], $response->status());
            }

            $data = $response->json();
            $pegawaiData = $this->processApiData($data, 'pegawais');

            // Filter berdasarkan unit_kerja atau homebase
            $filtered = collect($pegawaiData)->filter(function ($p) use ($unitKerja) {
                $unit = strtolower(trim($p['unit_kerja'] ?? $p['homebase'] ?? ''));
                return $unit === strtolower(trim($unitKerja));
            })->map(function ($p) {
                return [
                    'id' => $p['id'],
                    'nama' => $p['nama'],
                    'email' => $p['email'],
                    'unit_kerja' => $p['unit_kerja'],
                    'homebase' => $p['homebase'],
                ];
            })->values()->toArray();

            Log::info("Berhasil mengakses SIPEG API Pegawai", [
                'url' => $url,
                'unit_kerja' => $unitKerja,
                'count' => count($filtered),
            ]);

            return response()->json([
                'success' => true,
                'data' => $filtered,
                'count' => count($filtered),
            ]);

        } catch (\Exception $e) {
            Log::error("Kesalahan saat menghubungi SIPEG API Pegawai", [
                'url' => $url,
                'error' => $e->getMessage(),
                'unit_kerja' => $unitKerja,
            ]);
            return response()->json([
                'error' => 'Gagal menghubungi API SIPEG',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Method proxy dinamis untuk endpoint lain
    public function proxy($any, Request $request)
    {
        $url = "http://10.255.0.143/apisipeg/api/{$any}";
        Log::debug("Mengakses SIPEG API", [
            'url' => $url,
            'query' => $request->all(),
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => env('SIPEG_TOKEN', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ3YmUzOTkxNTczZDIxOWQ4NzdmNjNjNTVjYWY2YjMzNWM4Nzc2N2Nh'),
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

    private function processApiData($data, $key = 'data')
    {
        if (isset($data[$key]) && is_array($data[$key])) {
            return $data[$key];
        }
        if (is_array($data)) {
            return $data;
        }
        if (isset($data['result']) && is_array($data['result'])) {
            return $data['result'];
        }
        return [];
    }

    public function sinkronUnit()
    {
        try {
            $baseUrl = config('services.sipeg.base_url');
            $token = config('services.sipeg.token');

            Log::info('Starting unit synchronization', [
                'baseUrl' => $baseUrl,
                'hasToken' => !empty($token)
            ]);

            if (!$token) {
                return response()->json(['error' => 'SIPEG API token tidak ditemukan'], 500);
            }

            $http = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => "Bearer {$token}",
            ]);

            if (!config('services.sipeg.verify_ssl', false)) {
                $http = $http->withoutVerifying();
            }

            Log::info('Fetching units from SIPEG API');
            $response = $http->get("{$baseUrl}/allunit");

            if ($response->failed()) {
                $status = $response->status();
                $body = $response->body();
                Log::error('SIPEG API request failed', [
                    'status' => $status,
                    'response' => $body,
                    'url' => "{$baseUrl}/allunit"
                ]);
                return response()->json([
                    'error' => 'Gagal ambil data dari SIPEG',
                    'status' => $status,
                    'message' => $body
                ], 500);
            }

            $data = $response->json();
            $units = $data['units'] ?? [];
            Log::info('Received SIPEG response', ['unitsCount' => count($units)]);

            if (empty($units) || !is_array($units)) {
                Log::error('SIPEG API returned invalid data', [
                    'response' => $response->body(),
                    'type' => gettype($units)
                ]);
                return response()->json(['error' => 'Data unit dari SIPEG tidak valid'], 500);
            }

            $count = 0;
            $skipped = 0;
            DB::beginTransaction();

            try {
                foreach ($units as $unit) {
                    $unitData = [
                        'nama_unit' => $unit['ur_unit'] ?? null,
                        'jenis_unit' => $unit['jenis_unit'] ?? null,
                        'level_unit' => $unit['level_unit'] ?? null,
                        'kode_unit' => $unit['kode_unit'] ?? null,
                        'status' => 'aktif'
                    ];

                    // Debug log for each unit
                    Log::debug('Processing unit data', [
                        'raw' => $unit,
                        'processed' => $unitData
                    ]);

                    if (!$unitData['nama_unit']) {
                        Log::warning('Skipping unit without name', [
                            'unit' => $unit,
                            'processed' => $unitData
                        ]);
                        $skipped++;
                        continue;
                    }

                    // If kode_unit is "0", generate a unique code based on the unit name
                    if (!$unitData['kode_unit'] || $unitData['kode_unit'] === "0") {
                        $unitData['kode_unit'] = 'UNIT-' . strtoupper(substr(md5($unitData['nama_unit']), 0, 8));
                    }

                    $model = \App\Models\Unit::updateOrCreate(
                        ['kode_unit' => $unitData['kode_unit']],
                        $unitData
                    );

                    Log::info('Unit processed successfully', [
                        'id' => $model->id_unit,
                        'name' => $model->nama_unit
                    ]);

                    $count++;
                }

                DB::commit();

                $result = [
                    'message' => "Sinkronisasi unit selesai",
                    'total_received' => count($units),
                    'total_processed' => $count,
                    'total_skipped' => $skipped
                ];

                Log::info('Unit synchronization completed', $result);

                return response()->json($result);
            } catch (\Exception $e) {
                DB::rollback();
                Log::error('Failed to sync units', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'error' => 'Gagal sinkronisasi unit',
                    'message' => $e->getMessage()
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('SIPEG API error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Gagal menghubungi API SIPEG',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

