<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\IdentifyRisk;
use App\Models\User;
use Carbon\Carbon;

class IdentifyRiskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil user dengan role owner-risk untuk menjadi pemilik risiko
        $ownerRiskUser = User::whereHas('roles', function($query) {
            $query->where('name', 'owner-risk');
        })->first();

        if (!$ownerRiskUser) {
            $this->command->error('User dengan role owner-risk tidak ditemukan. Jalankan UserSeeder terlebih dahulu.');
            return;
        }

        // Buat beberapa risiko dengan status approved
        $risks = [
            [
                'id_identify' => 'RISK-001-2024',
                'risk_category' => 'Operasional',
                'unit_kerja' => 'IT',
                'kategori_risiko' => 'Teknologi',
                'tahun' => 2024,
                'identification_date_start' => Carbon::now()->subDays(30),
                'identification_date_end' => Carbon::now()->subDays(25),
                'description' => 'Risiko keamanan sistem informasi dan data',
                'nama_risiko' => 'Keamanan Sistem',
                'jabatan_risiko' => 'IT Manager',
                'no_kontak' => '081234567890',
                'strategi' => 'Mitigasi',
                'pengendalian_internal' => 'Backup rutin dan monitoring sistem',
                'biaya_penangan' => 50000000,
                'probability' => 3,
                'impact' => 4,
                'level' => 12,
                'validation_status' => IdentifyRisk::STATUS_APPROVED,
                'validation_processed_at' => Carbon::now()->subDays(20),
                'validation_processed_by' => 1, // Super admin
                'user_id' => $ownerRiskUser->id,
                'created_by' => $ownerRiskUser->id,
                'is_active' => true,
            ],
            [
                'id_identify' => 'RISK-002-2024',
                'risk_category' => 'Keuangan',
                'unit_kerja' => 'Finance',
                'kategori_risiko' => 'Likuiditas',
                'tahun' => 2024,
                'identification_date_start' => Carbon::now()->subDays(25),
                'identification_date_end' => Carbon::now()->subDays(20),
                'description' => 'Risiko likuiditas dan cash flow perusahaan',
                'nama_risiko' => 'Likuiditas',
                'jabatan_risiko' => 'Finance Manager',
                'no_kontak' => '081234567891',
                'strategi' => 'Transfer',
                'pengendalian_internal' => 'Monitoring cash flow harian',
                'biaya_penangan' => 25000000,
                'probability' => 2,
                'impact' => 5,
                'level' => 10,
                'validation_status' => IdentifyRisk::STATUS_APPROVED,
                'validation_processed_at' => Carbon::now()->subDays(15),
                'validation_processed_by' => 1, // Super admin
                'user_id' => $ownerRiskUser->id,
                'created_by' => $ownerRiskUser->id,
                'is_active' => true,
            ],
            [
                'id_identify' => 'RISK-003-2024',
                'risk_category' => 'Operasional',
                'unit_kerja' => 'HR',
                'kategori_risiko' => 'SDM',
                'tahun' => 2024,
                'identification_date_start' => Carbon::now()->subDays(20),
                'identification_date_end' => Carbon::now()->subDays(15),
                'description' => 'Risiko turnover karyawan yang tinggi',
                'nama_risiko' => 'Turnover Karyawan',
                'jabatan_risiko' => 'HR Manager',
                'no_kontak' => '081234567892',
                'strategi' => 'Reduce',
                'pengendalian_internal' => 'Program retention dan employee engagement',
                'biaya_penangan' => 30000000,
                'probability' => 4,
                'impact' => 3,
                'level' => 12,
                'validation_status' => IdentifyRisk::STATUS_APPROVED,
                'validation_processed_at' => Carbon::now()->subDays(10),
                'validation_processed_by' => 1, // Super admin
                'user_id' => $ownerRiskUser->id,
                'created_by' => $ownerRiskUser->id,
                'is_active' => true,
            ]
        ];

        foreach ($risks as $riskData) {
            $risk = IdentifyRisk::create($riskData);
            
            // Tambahkan penyebab
            $risk->penyebab()->create([
                'description' => 'Kurangnya sistem keamanan yang memadai'
            ]);
            
            // Tambahkan dampak kualitatif
            $risk->dampakKualitatif()->create([
                'description' => 'Kerugian finansial dan reputasi perusahaan'
            ]);
            
            // Tambahkan penanganan risiko
            $risk->penangananRisiko()->create([
                'description' => 'Implementasi sistem keamanan berlapis dan training awareness'
            ]);
        }

        $this->command->info('Berhasil membuat ' . count($risks) . ' risiko dengan status approved.');
    }
}