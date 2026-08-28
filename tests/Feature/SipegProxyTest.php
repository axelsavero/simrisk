<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SipegProxyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_allhomebase_endpoint_returns_homebases_list()
    {
        $user = User::factory()->create();

        Http::fake([
            '*/allhomebase' => Http::response([
                'pesan' => 'berhasil',
                'homebases' => [
                    ['id' => 1, 'ur_homebase' => 'Direktorat Akademik', 'kode_homebase' => '1'],
                    ['id' => 42, 'ur_homebase' => 'Perpustakaan dan Kearsipan', 'kode_homebase' => 'UN39.24'],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)->getJson('/api/sipegproxy/allhomebase?refresh=1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'pesan' => 'berhasil',
                'count' => 2,
            ])
            ->assertJsonStructure(['homebases', 'data', 'count']);
    }

    public function test_homebase_pegawai_endpoint_returns_pegawai_list()
    {
        $user = User::factory()->create();
        $homebaseName = 'Perpustakaan dan Kearsipan';

        Http::fake([
            '*/homebase/*' => Http::response([
                'pesan' => 'berhasil',
                'pegawais' => [
                    [
                        'id' => 804,
                        'nama' => 'Ummi Mukminati Siregar',
                        'nip_baru' => '197005312001122002',
                        'nip1' => "'197005312001122002",
                        'homebase' => 'Perpustakaan dan Kearsipan',
                        'status_aktif' => 'Aktif',
                        'hide' => 0,
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)->getJson('/api/sipegproxy/homebase/' . urlencode($homebaseName) . '?refresh=1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'pesan' => 'berhasil',
                'count' => 1,
            ]);
    }

    public function test_sinkron_unit_endpoint_populates_units_table()
    {
        Http::fake([
            '*/allhomebase' => Http::response([
                'pesan' => 'berhasil',
                'homebases' => [
                    ['id' => 1, 'ur_homebase' => 'Direktorat Akademik', 'kode_homebase' => '1'],
                    ['id' => 42, 'ur_homebase' => 'Perpustakaan dan Kearsipan', 'kode_homebase' => 'UN39.24'],
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/sinkron-unit');

        $response->assertStatus(200)
            ->assertJson([
                'total_processed' => 2,
            ]);

        $this->assertDatabaseHas('unit', [
            'nama_unit' => 'Direktorat Akademik',
            'kode_unit' => '1',
        ]);
        $this->assertDatabaseHas('unit', [
            'nama_unit' => 'Perpustakaan dan Kearsipan',
            'kode_unit' => 'UN39.24',
        ]);
    }
}
