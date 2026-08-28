<?php

namespace Tests\Unit;

use App\Services\SipegService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SipegServiceTest extends TestCase
{
    protected SipegService $sipegService;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->sipegService = new SipegService();
    }

    public function test_get_all_homebases_success_and_sorted_alphabetically()
    {
        Http::fake([
            '*/allhomebase' => Http::response([
                'pesan' => 'berhasil',
                'homebases' => [
                    ['id' => 42, 'ur_homebase' => "Perpustakaan dan Kearsipan\t", 'kode_homebase' => 'UN39.24'],
                    ['id' => 1, 'ur_homebase' => 'Direktorat Akademik', 'kode_homebase' => '1'],
                    ['id' => 3, 'ur_homebase' => 'Direktorat Sumber Daya Manusia', 'kode_homebase' => 'UN39.12'],
                ],
            ], 200),
        ]);

        $result = $this->sipegService->getAllHomebases(true);

        $this->assertCount(3, $result);
        $this->assertEquals('Direktorat Akademik', $result[0]['ur_homebase']);
        $this->assertEquals('Direktorat Sumber Daya Manusia', $result[1]['ur_homebase']);
        $this->assertEquals('Perpustakaan dan Kearsipan', $result[2]['ur_homebase']);
        $this->assertEquals(42, $result[2]['id']);
    }

    public function test_get_all_homebases_throws_exception_when_failed()
    {
        Http::fake([
            '*/allhomebase' => Http::response([
                'pesan' => 'gagal',
                'homebases' => [],
            ], 200),
        ]);

        $this->expectException(\RuntimeException::class);
        $this->sipegService->getAllHomebases(true);
    }

    public function test_get_pegawai_by_homebase_normalizes_data_and_filters_inactive()
    {
        $homebaseName = 'Kantor Urusan Internasional (KUI)';

        Http::fake([
            '*/homebase/*' => Http::response([
                'pesan' => 'berhasil',
                'pegawais' => [
                    [
                        'id' => 804,
                        'id_absen' => 393,
                        'id_absen_baru' => 210230,
                        'nip_baru' => '197005312001122002',
                        'nip1' => "'197005312001122002",
                        'nip_lama' => '132298408',
                        'nik_ptnbh' => null,
                        'nama' => 'Ummi Mukminati Siregar',
                        'nik' => "'3175027105700002",
                        'gender' => 'L',
                        'status_nikah' => 'K',
                        'tgl_lahir' => '1970-05-31',
                        'tmt_tmmd' => '0000-00-00',
                        'homebase' => 'Kantor Urusan Internasional (KUI)',
                        'status_aktif' => 'Aktif',
                        'hide' => 0,
                        'email' => 'ummi-mukminati@unj.ac.id',
                    ],
                    [
                        'id' => 805,
                        'nama' => 'Pegawai Inaktif',
                        'status_aktif' => 'Nonaktif',
                        'hide' => 0,
                    ],
                    [
                        'id' => 806,
                        'nama' => 'Pegawai Hidden',
                        'status_aktif' => 'Aktif',
                        'hide' => 1,
                    ],
                ],
            ], 200),
        ]);

        $result = $this->sipegService->getPegawaiByHomebase($homebaseName, true);

        $this->assertCount(1, $result);
        $pegawai = $result[0];

        $this->assertEquals(804, $pegawai['id']);
        $this->assertEquals('197005312001122002', $pegawai['nip1']); // Strip apostrophe
        $this->assertEquals('3175027105700002', $pegawai['nik']); // Strip apostrophe
        $this->assertNull($pegawai['tmt_tmmd']); // 0000-00-00 to null
        $this->assertEquals('Laki-laki', $pegawai['gender_label']);
        $this->assertEquals('Kawin', $pegawai['status_nikah_label']);
    }

    public function test_url_encoding_for_special_characters_in_homebase_name()
    {
        $homebaseName = 'Direktorat Inovasi, Hilirisasi, Sistem Informasi dan Pemeringkatan';

        Http::fake([
            '*/homebase/*' => Http::response([
                'pesan' => 'berhasil',
                'pegawais' => [],
            ], 200),
        ]);

        $this->sipegService->getPegawaiByHomebase($homebaseName, true);

        Http::assertSent(function ($request) use ($homebaseName) {
            return str_contains($request->url(), rawurlencode($homebaseName));
        });
    }
}
