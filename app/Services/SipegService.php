<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SipegService
{
    protected string $baseUrl;
    protected ?string $token;
    protected bool $verifySsl;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.sipeg.base_url', 'http://10.255.0.143/apisipeg/api'), '/');
        $this->token = config('services.sipeg.token');
        $this->verifySsl = (bool) config('services.sipeg.verify_ssl', false);
        $this->timeout = (int) config('services.sipeg.timeout', 10);
    }

    /**
     * Build HTTP request with standard headers and options.
     */
    protected function httpClient()
    {
        $headers = ['Accept' => 'application/json'];
        if (!empty($this->token)) {
            $headers['Authorization'] = "Bearer {$this->token}";
        }

        $client = Http::withHeaders($headers)
            ->timeout($this->timeout)
            ->retry(2, 500);

        if (!$this->verifySsl) {
            $client = $client->withoutVerifying();
        }

        return $client;
    }

    /**
     * Get all homebases, sorted alphabetically (A-Z), cached for 6 hours.
     */
    public function getAllHomebases(bool $forceRefresh = false): array
    {
        $cacheKey = 'sipeg_all_homebases';

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, 21600, function () {
            $url = "{$this->baseUrl}/allhomebase";
            Log::debug('Mengakses SIPEG API All Homebase', ['url' => $url]);

            try {
                $response = $this->httpClient()->get($url);

                if ($response->failed()) {
                    Log::error('Gagal mengakses SIPEG API All Homebase', [
                        'url' => $url,
                        'status' => $response->status(),
                    ]);
                    throw new \RuntimeException("SIPEG API HTTP error status {$response->status()}");
                }

                $data = $response->json();

                if (!is_array($data) || ($data['pesan'] ?? '') !== 'berhasil') {
                    $pesan = is_array($data) ? ($data['pesan'] ?? 'Response invalid') : 'Response bukan JSON valid';
                    Log::error('SIPEG API All Homebase mengembalikan pesan gagal', [
                        'url' => $url,
                        'pesan' => $pesan,
                    ]);
                    throw new \RuntimeException("SIPEG API error: {$pesan}");
                }

                $homebasesRaw = $data['homebases'] ?? [];
                if (!is_array($homebasesRaw)) {
                    $homebasesRaw = [];
                }

                $processed = [];
                foreach ($homebasesRaw as $hb) {
                    $rawName = $hb['ur_homebase'] ?? '';
                    $cleanName = trim($rawName);

                    if ($cleanName === '') {
                        continue;
                    }

                    $processed[] = [
                        'id' => (int) ($hb['id'] ?? 0),
                        'ur_homebase' => $cleanName,
                        'raw_homebase' => $rawName, // Pertahankan nilai asli jika server membutuhkan trailing space
                        'kode_homebase' => trim((string) ($hb['kode_homebase'] ?? '')),
                    ];
                }

                // Urutkan alfabetis A-Z berdasarkan ur_homebase
                usort($processed, function ($a, $b) {
                    return strnatcasecmp($a['ur_homebase'], $b['ur_homebase']);
                });

                Log::info('Berhasil mengambil data All Homebase dari SIPEG', [
                    'count' => count($processed),
                ]);

                return $processed;

            } catch (\Exception $e) {
                Log::error('Kesalahan saat menghubungi SIPEG API All Homebase', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Get pegawais per homebase by homebase name, cached for 15 minutes.
     */
    public function getPegawaiByHomebase(string $urHomebase, bool $forceRefresh = false): array
    {
        $cleanHomebase = trim($urHomebase);
        if ($cleanHomebase === '') {
            return [];
        }

        $cacheKey = 'sipeg_pegawai_homebase_' . md5($cleanHomebase);

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, 900, function () use ($cleanHomebase) {
            $encodedHomebase = rawurlencode($cleanHomebase);
            $url = "{$this->baseUrl}/homebase/{$encodedHomebase}";

            Log::debug('Mengakses SIPEG API Pegawai per Homebase', [
                'url' => $url,
                'homebase' => $cleanHomebase,
            ]);

            try {
                $response = $this->httpClient()->get($url);

                if ($response->failed()) {
                    Log::error('Gagal mengakses SIPEG API Pegawai per Homebase', [
                        'url' => $url,
                        'status' => $response->status(),
                        'homebase' => $cleanHomebase,
                    ]);
                    throw new \RuntimeException("SIPEG API HTTP error status {$response->status()}");
                }

                $data = $response->json();

                if (!is_array($data) || ($data['pesan'] ?? '') !== 'berhasil') {
                    $pesan = is_array($data) ? ($data['pesan'] ?? 'Response invalid') : 'Response bukan JSON valid';
                    Log::error('SIPEG API Pegawai per Homebase mengembalikan pesan gagal', [
                        'url' => $url,
                        'homebase' => $cleanHomebase,
                        'pesan' => $pesan,
                    ]);
                    throw new \RuntimeException("SIPEG API error: {$pesan}");
                }

                $pegawaiRaw = $data['pegawais'] ?? [];
                if (!is_array($pegawaiRaw)) {
                    $pegawaiRaw = [];
                }

                $filtered = [];
                foreach ($pegawaiRaw as $p) {
                    // Default filter: hide == 0 dan status_aktif == 'Aktif'
                    $hide = (int) ($p['hide'] ?? 0);
                    $statusAktif = trim((string) ($p['status_aktif'] ?? ''));

                    if ($hide !== 0 || strtolower($statusAktif) !== 'aktif') {
                        continue;
                    }

                    $filtered[] = $this->normalizePegawaiData($p);
                }

                Log::info('Berhasil mengambil data Pegawai per Homebase dari SIPEG', [
                    'homebase' => $cleanHomebase,
                    'count' => count($filtered),
                ]);

                return $filtered;

            } catch (\Exception $e) {
                Log::error('Kesalahan saat menghubungi SIPEG API Pegawai per Homebase', [
                    'homebase' => $cleanHomebase,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Clear allhomebase cache.
     */
    public function clearCache(): void
    {
        Cache::forget('sipeg_all_homebases');
    }

    /**
     * Normalize individual pegawai data structure according to business rules.
     */
    public function normalizePegawaiData(array $p): array
    {
        // Strip apostrophe prefix from NIP and NIK fields
        $nipBaru = ltrim(trim((string) ($p['nip_baru'] ?? '')), "'");
        $nip1 = ltrim(trim((string) ($p['nip1'] ?? '')), "'");
        $nik = ltrim(trim((string) ($p['nik'] ?? '')), "'");
        $nipLama = ltrim(trim((string) ($p['nip_lama'] ?? '')), "'");

        // Main identity: prefer nip_baru, fallback to nip1 or id
        $mainNip = !empty($nipBaru) ? $nipBaru : (!empty($nip1) ? $nip1 : (string) ($p['id'] ?? ''));

        // Normalize invalid dates ("0000-00-00")
        $tglLahir = $this->normalizeDate($p['tgl_lahir'] ?? null);
        $tmtCpns = $this->normalizeDate($p['tmt_cpns'] ?? null);
        $tmtPns = $this->normalizeDate($p['tmt_pns'] ?? null);
        $tmtTmmd = $this->normalizeDate($p['tmt_tmmd'] ?? null);
        $tmtNonaktif = $this->normalizeDate($p['tmt_nonaktif'] ?? null);

        // Normalize gender
        $rawGender = strtoupper(trim((string) ($p['gender'] ?? '')));
        $genderLabel = match ($rawGender) {
            'L' => 'Laki-laki',
            'P' => 'Perempuan',
            default => $rawGender !== '' ? $rawGender : null,
        };

        // Normalize marital status
        $rawStatusNikah = strtoupper(trim((string) ($p['status_nikah'] ?? '')));
        $statusNikahLabel = match ($rawStatusNikah) {
            'K' => 'Kawin',
            'B' => 'Belum kawin',
            default => null,
        };

        return [
            'id' => (int) ($p['id'] ?? 0),
            'id_absen' => $this->normalizeNullable($p['id_absen'] ?? null),
            'id_absen_baru' => $this->normalizeNullable($p['id_absen_baru'] ?? null),
            'nip_baru' => $mainNip,
            'nip1' => $nip1 !== '' ? $nip1 : null,
            'nip_lama' => $nipLama !== '' ? $nipLama : null,
            'nik' => $nik !== '' ? $nik : null,
            'nik_ptnbh' => $this->normalizeNullable($p['nik_ptnbh'] ?? null),
            'nama' => trim((string) ($p['nama'] ?? '')),
            'gelar_depan' => trim((string) ($p['gelar_depan'] ?? '')),
            'gelar_belakang' => trim((string) ($p['gelar_belakang'] ?? '')),
            'tgl_lahir' => $tglLahir,
            'tmpt_lahir' => $this->normalizeNullable($p['tmpt_lahir'] ?? null),
            'gender' => $rawGender !== '' ? $rawGender : null,
            'gender_label' => $genderLabel,
            'status_nikah' => $rawStatusNikah !== '' ? $rawStatusNikah : null,
            'status_nikah_label' => $statusNikahLabel,
            'agama' => $this->normalizeNullable($p['agama'] ?? null),
            'status_kepeg' => $this->normalizeNullable($p['status_kepeg'] ?? null),
            'instansi_asal' => $this->normalizeNullable($p['instansi_asal'] ?? null),
            'tmt_cpns' => $tmtCpns,
            'tmt_pns' => $tmtPns,
            'tmt_tmmd' => $tmtTmmd,
            'tmt_nonaktif' => $tmtNonaktif,
            'prodi' => $this->normalizeNullable($p['prodi'] ?? null),
            'unit_kerja' => $this->normalizeNullable($p['unit_kerja'] ?? null),
            'homebase' => trim((string) ($p['homebase'] ?? '')),
            'karpeg' => $this->normalizeNullable($p['karpeg'] ?? null),
            'npwp' => $this->normalizeNullable($p['npwp'] ?? null),
            'norek' => $this->normalizeNullable($p['norek'] ?? null),
            'bpjs' => $this->normalizeNullable($p['bpjs'] ?? null),
            'alamat' => $this->normalizeNullable($p['alamat'] ?? null),
            'kota' => $this->normalizeNullable($p['kota'] ?? null),
            'kode_pos' => $this->normalizeNullable($p['kode_pos'] ?? null),
            'phone' => $this->normalizeNullable($p['phone'] ?? null),
            'email' => trim((string) ($p['email'] ?? '')),
            'nidn' => $this->normalizeNullable($p['nidn'] ?? null),
            'nidk' => $this->normalizeNullable($p['nidk'] ?? null),
            'nuptk' => $this->normalizeNullable($p['nuptk'] ?? null),
            'nitk' => $this->normalizeNullable($p['nitk'] ?? null),
            'cabang' => $this->normalizeNullable($p['cabang'] ?? null),
            'foto' => $this->normalizeNullable($p['foto'] ?? null),
            'status_aktif' => trim((string) ($p['status_aktif'] ?? '')),
            'hide' => (int) ($p['hide'] ?? 0),
        ];
    }

    /**
     * Normalize date value, converting invalid dates like "0000-00-00" to null.
     */
    protected function normalizeDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        $trimmed = trim($date);
        if ($trimmed === '0000-00-00' || $trimmed === '0000-00-00 00:00:00' || str_starts_with($trimmed, '0000-00-00')) {
            return null;
        }

        return $trimmed;
    }

    /**
     * Normalize empty representation values ("", "-", "0") to null.
     */
    protected function normalizeNullable(mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $str = trim((string) $value);
        if ($str === '' || $str === '-' || $str === '0') {
            return null;
        }

        return $str;
    }
}
