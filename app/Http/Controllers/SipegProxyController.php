<?php

namespace App\Http\Controllers;

use App\Services\SipegService;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SipegProxyController extends Controller
{
    protected SipegService $sipegService;

    public function __construct(SipegService $sipegService)
    {
        $this->sipegService = $sipegService;
    }

    /**
     * Endpoint: GET /api/sipegproxy/allhomebase (atau /allunit)
     * Mengambil daftar seluruh homebase/unit dari SIPEG
     */
    public function allhomebase(Request $request)
    {
        try {
            $forceRefresh = $request->boolean('refresh', false);
            $homebases = $this->sipegService->getAllHomebases($forceRefresh);

            // Format DTO/Array ringkas untuk dropdown frontend
            $formatted = array_map(function ($hb) {
                return [
                    'id' => $hb['id'],
                    'name' => $hb['ur_homebase'],
                    'ur_homebase' => $hb['ur_homebase'],
                    'kode_homebase' => $hb['kode_homebase'],
                ];
            }, $homebases);

            return response()->json([
                'success' => true,
                'pesan' => 'berhasil',
                'homebases' => $homebases,
                'data' => $formatted, // Alias kompatibilitas frontend
                'count' => count($formatted),
            ]);
        } catch (\Exception $e) {
            Log::error("Gagal mengambil data homebase dari SIPEG", [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Gagal mengambil data homebase dari SIPEG',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Backward compatibility alias untuk allunit
     */
    public function allunit(Request $request)
    {
        return $this->allhomebase($request);
    }

    /**
     * Endpoint: GET /api/sipegproxy/homebase/{ur_homebase} atau /pegawai?homebase=...
     * Mengambil daftar pegawai per homebase dari SIPEG
     */
    public function homebase($ur_homebase = null, Request $request = null)
    {
        $homebaseName = $ur_homebase;

        if (empty($homebaseName) && $request) {
            $homebaseName = $request->query('homebase') 
                ?? $request->query('ur_homebase') 
                ?? $request->query('unit_kerja');
        }

        if (empty($homebaseName) || trim($homebaseName) === '') {
            return response()->json([
                'success' => false,
                'error' => 'Parameter nama homebase diperlukan dan tidak boleh kosong.',
                'message' => 'Contoh: /api/sipegproxy/homebase/Perpustakaan%20dan%20Kearsipan'
            ], 400);
        }

        try {
            $forceRefresh = $request ? $request->boolean('refresh', false) : false;
            $pegawais = $this->sipegService->getPegawaiByHomebase($homebaseName, $forceRefresh);

            // Filter data sensitif sebelum dikirim ke frontend jika tidak diperlukan
            $safePegawais = array_map(function ($p) {
                return [
                    'id' => $p['id'],
                    'nip_baru' => $p['nip_baru'],
                    'nip1' => $p['nip1'],
                    'nama' => $p['nama'],
                    'email' => $p['email'],
                    'homebase' => $p['homebase'],
                    'unit_kerja' => $p['homebase'],
                    'gender' => $p['gender'],
                    'gender_label' => $p['gender_label'],
                    'status_nikah' => $p['status_nikah'],
                    'status_nikah_label' => $p['status_nikah_label'],
                    'cabang' => $p['cabang'],
                    'foto' => $p['foto'],
                    'status_aktif' => $p['status_aktif'],
                ];
            }, $pegawais);

            return response()->json([
                'success' => true,
                'pesan' => 'berhasil',
                'pegawais' => $safePegawais,
                'data' => $safePegawais, // Alias kompatibilitas frontend
                'count' => count($safePegawais),
            ]);
        } catch (\Exception $e) {
            Log::error("Gagal mengambil data pegawai homebase dari SIPEG", [
                'homebase' => $homebaseName,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Gagal mengambil data pegawai dari SIPEG',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Backward compatibility alias untuk pegawai per unit
     */
    public function pegawai(Request $request)
    {
        return $this->homebase(null, $request);
    }

    /**
     * Method proxy dinamis untuk endpoint SIPEG lainnya
     */
    public function proxy($any, Request $request)
    {
        $cleanPath = trim($any, '/');

        if ($cleanPath === 'allhomebase' || $cleanPath === 'allunit') {
            return $this->allhomebase($request);
        }

        if ($cleanPath === 'pegawai' || str_starts_with($cleanPath, 'homebase/')) {
            $parts = explode('/', $cleanPath, 2);
            $urHomebase = isset($parts[1]) ? urldecode($parts[1]) : null;
            return $this->homebase($urHomebase, $request);
        }

        // Catch-all fallback ke endpoint SIPEG jika dibutuhkan
        $baseUrl = rtrim(config('services.sipeg.base_url'), '/');
        $url = "{$baseUrl}/{$cleanPath}";

        try {
            $token = config('services.sipeg.token');
            $http = \Illuminate\Support\Facades\Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => "Bearer {$token}",
            ])->timeout(config('services.sipeg.timeout', 10));

            if (!config('services.sipeg.verify_ssl', false)) {
                $http = $http->withoutVerifying();
            }

            $response = $http->get($url, $request->all());

            return response($response->body(), $response->status())
                ->header('Content-Type', $response->header('Content-Type', 'application/json'));
        } catch (\Exception $e) {
            Log::error("Kesalahan proxy SIPEG", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Gagal menghubungi API SIPEG',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sinkronisasi data unit lokal berdasarkan data Homebase dari SIPEG
     */
    public function sinkronUnit()
    {
        try {
            Log::info('Memulai sinkronisasi unit dari SIPEG All Homebase');

            // Force refresh cache saat sinkronisasi
            $homebases = $this->sipegService->getAllHomebases(true);

            if (empty($homebases)) {
                return response()->json([
                    'error' => 'Data homebase dari SIPEG kosong atau tidak valid'
                ], 500);
            }

            $count = 0;
            $skipped = 0;
            DB::beginTransaction();

            try {
                // Hapus semua data unit lama sebelum sinkronisasi
                Unit::query()->delete();
                Log::info('Semua data unit lama berhasil dihapus sebelum sinkronisasi');

                foreach ($homebases as $hb) {
                    $namaUnit = $hb['ur_homebase'] ?? null;
                    $kodeHomebase = $hb['kode_homebase'] ?? null;

                    if (!$namaUnit) {
                        $skipped++;
                        continue;
                    }

                    // Jika kode_homebase kosong atau "0", generate kode unik berbasis MD5 nama
                    $kodeUnit = (!empty($kodeHomebase) && $kodeHomebase !== '0')
                        ? $kodeHomebase
                        : 'UNIT-' . strtoupper(substr(md5($namaUnit), 0, 8));

                    $model = Unit::create([
                        'nama_unit' => $namaUnit,
                        'jenis_unit' => 'Homebase',
                        'level_unit' => 'Unit Kerja',
                        'kode_unit' => $kodeUnit,
                        'status' => 'aktif',
                    ]);

                    $count++;
                }

                DB::commit();

                $result = [
                    'message' => "Sinkronisasi unit selesai",
                    'total_received' => count($homebases),
                    'total_processed' => $count,
                    'total_skipped' => $skipped
                ];

                Log::info('Sinkronisasi unit selesai', $result);

                return response()->json($result);
            } catch (\Exception $e) {
                DB::rollback();
                Log::error('Gagal saat menyimpan data sinkronisasi unit', [
                    'error' => $e->getMessage(),
                ]);

                return response()->json([
                    'error' => 'Gagal sinkronisasi unit',
                    'message' => $e->getMessage()
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Gagal sinkronisasi dari SIPEG API', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Gagal menghubungi API SIPEG',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
