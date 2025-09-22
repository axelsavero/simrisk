<?php

namespace App\Http\Controllers;

use App\Models\IdentifyRisk;
use App\Models\Mitigasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Ambil parameter filter dari request
        $unitId = $request->get('unit');
        $kategori = $request->get('kategori');
        $tahun = $request->get('tahun', date('Y'));
        $statusMitigasi = $request->get('status_mitigasi');

        // --- Query untuk Data Risiko Inheren (Sebelum) ---
        $riskQuery = IdentifyRisk::with(['user.unit'])
            ->where('validation_status', 'approved');


        if ($user->hasRole('owner-risk')) {
            $riskQuery->where('user_id', $user->id);
        } elseif ($user->hasAnyRole(['admin', 'pimpinan'])) {
            $riskQuery->whereHas('user', fn($q) => $q->where('unit_id', $user->unit_id));
        }

        if ($unitId) $riskQuery->whereHas('user', fn($q) => $q->where('unit_id', $unitId));
        if ($kategori) $riskQuery->byKategori($kategori);
        if ($tahun) $riskQuery->byTahun($tahun);
        if ($statusMitigasi) $riskQuery->byStatusMitigasi($statusMitigasi);

        $risks = $riskQuery->get();

        // --- PERBAIKAN 1: Query data mitigasi (Residual) di sini ---
        $mitigasiQuery = Mitigasi::with(['identifyRisk.user.unit']) // <-- UBAH INI
            ->where('validation_status', Mitigasi::VALIDATION_STATUS_APPROVED);

        if ($user->hasRole('owner-risk')) {
            $mitigasiQuery->whereHas('identifyRisk', fn($q) => $q->where('user_id', $user->id));
        } elseif ($user->hasAnyRole(['admin', 'pimpinan'])) {
            $mitigasiQuery->whereHas('identifyRisk.user', fn($q) => $q->where('unit_id', $user->unit_id));
        }

        if ($unitId) $mitigasiQuery->whereHas('identifyRisk.user', fn($q) => $q->where('unit_id', $unitId));
        if ($kategori) $mitigasiQuery->whereHas('identifyRisk', fn($q) => $q->where('risk_category', $kategori));
        if ($tahun) $mitigasiQuery->whereYear('created_at', $tahun);
        if ($statusMitigasi) $mitigasiQuery->where('status_mitigasi', $statusMitigasi);
        
        $mitigasis = $mitigasiQuery->get();

        // Render Inertia dengan data yang sudah dipisahkan
        return Inertia::render('dashboard/index', [
            // PERBAIKAN 2: Kirim kedua koleksi ke formatRiskMatrixData untuk kalkulasi
            'riskMatrixData' => $this->formatRiskMatrixData($risks, $mitigasis),
            'mitigasiMatrixData' => $this->formatMitigasiMatrixData($mitigasis),
            'dashboardStats' => $this->getDashboardStatistics($risks),
            'riskTrends' => $this->getRiskTrends($tahun),
            'filters' => ['unit' => $unitId, 'kategori' => $kategori, 'tahun' => $tahun, 'statusMitigasi' => $statusMitigasi],
            'filterOptions' => $this->getFilterOptions(),
            'permissions' => $this->getUserPermissions()
        ]);
    }

    private function getBaseQuery()
    {
        // Ke belakang untuk kompatibilitas, gunakan aturan umum + aktif saja
        return $this->applyRoleScope(IdentifyRisk::query(), [
            'userColumn' => 'user_id',
            'unitColumn' => null,
            'unitViaUser' => true,
            'userRelation' => 'user',
        ])->where('is_active', true)->where('validation_status', 'approved');
    }

    private function formatRiskMatrixData($risks, $mitigasis)
    {
        $riskPointsInherent = $risks->map(function ($risk) {
            if ($risk->probability && $risk->impact) {
                return [
                    'x' => $risk->probability,
                    'y' => $risk->impact,
                    'label' => $risk->id,
                    'kode_risiko' => $risk->id_identify,
                    'nama_risiko' => $risk->description,
                    'unit_kerja' => $risk->user?->unit?->nama_unit ?? $risk->user?->unit ?? $risk->unit_kerja ?? 'Tidak Diketahui',
                    'validation_status' => $risk->validation_status,
                ];
            }
            return null;
        })->filter();

        return [
            'riskPointsSebelum' => $riskPointsInherent,
            'riskPointsSesudah' => [],
            'tingkatRisiko' => $this->calculateRiskLevels($risks, $mitigasis),
        ];
    }

    private function formatMitigasiMatrixData($mitigasis)
    {
        $mitigasiPoints = $mitigasis->map(function ($mitigasi) {
            $risk = $mitigasi->identifyRisk;
            if (!$risk) return null;

            $level = ($mitigasi->probability ?: 1) * ($mitigasi->impact ?: 1);

            $levelText = 'Sangat Rendah';
            if ($level >= 17) $levelText = 'Tinggi';
            elseif ($level >= 9) $levelText = 'Sedang';
            elseif ($level >= 3) $levelText = 'Rendah';

            return [
                'id' => $mitigasi->id,
                'x' => $mitigasi->probability,
                'y' => $mitigasi->impact,
                'label' => $mitigasi->id,
                'judul_mitigasi' => $mitigasi->judul_mitigasi,
                'kode_risiko' => $risk->id_identify,
                'nama_risiko' => $risk->description,
                'strategi_mitigasi' => $mitigasi->strategi_mitigasi,
                'status_mitigasi' => $mitigasi->status_mitigasi,
                'progress_percentage' => $mitigasi->progress_percentage,
                'pic_mitigasi' => $mitigasi->pic_mitigasi,
                'target_selesai' => $mitigasi->target_selesai?->format('Y-m-d'),
                'unit_kerja' => $risk->user?->unit?->nama_unit ?? $risk->user?->unit ?? $risk->unit_kerja ?? 'Tidak Diketahui',
                'level' => $level,
                'level_text' => $levelText,
                'validation_status' => $mitigasi->validation_status,
            ];
        })->filter();

        return [
            'mitigasiPoints' => $mitigasiPoints,
        ];
    }

     private function calculateRiskLevels($risks, $mitigasis)
    {
        $levels = [
            'Sangat Rendah' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-green-500'],
            'Rendah' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-yellow-300'],
            'Sedang' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-orange-400'],
            'Tinggi' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-red-500'],
        ];

        // Hitung jumlah risiko inheren dari koleksi $risks
        foreach ($risks as $risk) {
            $inherentLevel = $risk->inherent_risk_level;
            if (isset($levels[$inherentLevel])) {
                $levels[$inherentLevel]['inheren']++;
            }
        }

        // Hitung jumlah risiko residual dari koleksi $mitigasis
        foreach ($mitigasis as $mitigasi) {
            $residualLevelValue = ($mitigasi->probability ?: 1) * ($mitigasi->impact ?: 1);
            
            $residualLevelText = 'Sangat Rendah';
            if ($residualLevelValue >= 17) $residualLevelText = 'Tinggi';
            elseif ($residualLevelValue >= 9) $residualLevelText = 'Sedang';
            elseif ($residualLevelValue >= 3) $residualLevelText = 'Rendah';
            
            if (isset($levels[$residualLevelText])) {
                $levels[$residualLevelText]['residual']++;
            }
        }

        // Format untuk frontend
        return collect($levels)->map(function ($data, $tingkat) {
            return [
                'tingkat' => $tingkat,
                'inheren' => $data['inheren'],
                'residual' => $data['residual'],
                'color' => $data['color']
            ];
        })->values()->toArray();
    }

    private function getDashboardStatistics($risks)
    {
        $totalRisks = $risks->count();
        $highRisks = $risks->where('level', '>=', 17)->count();      // 17-25
        $mediumRisks = $risks->whereBetween('level', [9, 16])->count(); // 9-16
        $lowRisks = $risks->whereBetween('level', [3, 8])->count();     // 3-8
        $veryLowRisks = $risks->whereBetween('level', [1, 2])->count(); // 1-2

        // Mitigasi statistics
        $mitigasiStats = $risks->groupBy('status_mitigasi')->map->count();

        // Unit statistics
        $unitStats = $risks->groupBy('unit_kerja')->map->count()->sortDesc();

        return [
            'overview' => [
                'total_risks' => $totalRisks,
                'high_risks' => $highRisks,
                'medium_risks' => $mediumRisks,
                'low_risks' => $lowRisks,
                'very_low_risks' => $veryLowRisks,
                'high_risk_percentage' => $totalRisks > 0 ? round(($highRisks / $totalRisks) * 100, 1) : 0
            ],
            'mitigasi' => [
                'belum_dimulai' => $mitigasiStats->get('belum_dimulai', 0),
                'sedang_berjalan' => $mitigasiStats->get('sedang_berjalan', 0),
                'selesai' => $mitigasiStats->get('selesai', 0)
            ],
            'by_unit' => $unitStats->take(5)->toArray(),
            'effectiveness' => $this->calculateMitigationEffectiveness($risks)
        ];
    }

    private function calculateMitigationEffectiveness($risks)
    {
        $risksWithMitigation = $risks->filter(function ($risk) {
            return $risk->level && $risk->level_residual;
        });

        if ($risksWithMitigation->isEmpty()) {
            return ['percentage' => 0, 'average_reduction' => 0];
        }

        $totalReduction = $risksWithMitigation->sum('risk_reduction');
        $averageReduction = $totalReduction / $risksWithMitigation->count();
        $effectivenessPercentage = $risksWithMitigation->filter(function ($risk) {
            return $risk->risk_reduction > 0;
        })->count() / $risksWithMitigation->count() * 100;

        return [
            'percentage' => round($effectivenessPercentage, 1),
            'average_reduction' => round($averageReduction, 1),
            'total_risks_mitigated' => $risksWithMitigation->count()
        ];
    }

    private function getRiskTrends($currentYear)
    {
        $trends = IdentifyRisk::selectRaw('
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(*) as count,
                AVG(level) as avg_level
            ')
            ->where('created_at', '>=', now()->subYear())
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return $trends->map(function ($trend) {
            return [
                'period' => sprintf('%d-%02d', $trend->year, $trend->month),
                'count' => $trend->count,
                'average_level' => round($trend->avg_level, 1)
            ];
        });
    }

    private function getFilterOptions()
    {
        return [
            'kategoris' => IdentifyRisk::distinct()
                ->whereNotNull('risk_category')->pluck('risk_category')->sort()->values(),
            'tahuns' => IdentifyRisk::distinct()
                ->whereNotNull('tahun')->pluck('tahun')->sort()->values(),
            'status_mitigasi' => [
                'belum_dimulai' => 'Belum Dimulai',
                'sedang_berjalan' => 'Sedang Berjalan',
                'selesai' => 'Selesai'
            ]
        ];
    }

    private function getUserPermissions()
    {
        $user = Auth::user();

        return [
            'canViewAll' => $user->hasRole('super-admin'),
            'canViewDraft' => $user->hasRole('owner-risk'),
            'canExport' => $user->hasAnyRole(['super-admin', 'pimpinan']),
            'canManageRisk' => $user->hasAnyRole(['super-admin', 'owner-risk']),
            'canApproveRisk' => $user->hasRole('super-admin'),
            'canSubmitRisk' => $user->hasAnyRole(['owner-risk', 'super-admin']),
            'canViewReports' => $user->hasAnyRole(['super-admin', 'pimpinan', 'owner-risk'])
        ];
    }

    public function getRiskDetail($id)
    {
        $risk = IdentifyRisk::with(['validationProcessor', 'creator'])
            ->findOrFail($id);

        return response()->json([
            'id' => $risk->id,
            'id_identify' => $risk->id_identify,
            'description' => $risk->description,
            'unit_kerja' => $risk->unit_kerja,
            'kategori_risiko' => $risk->kategori_risiko,
            'pemilik_risiko' => $risk->pemilik_risiko,
            'inherent' => [
                'probability' => $risk->probability,
                'impact' => $risk->impact,
                'level' => $risk->level,
                'level_text' => $risk->inherent_risk_level
            ],
            'residual' => [
                'probability' => $risk->probability_residual,
                'impact' => $risk->impact_residual,
                'level' => $risk->level_residual,
                'level_text' => $risk->residual_risk_level
            ],
            'mitigation' => [
                'rencana' => $risk->rencana_mitigasi,
                'target' => $risk->target_mitigasi?->format('Y-m-d'),
                'status' => $risk->status_mitigasi,
                'reduction' => $risk->risk_reduction
            ]
        ]);
    }

    public function exportDashboard(Request $request)
    {
        // Implementation for exporting dashboard data
        return response()->json(['message' => 'Export functionality coming soon']);
    }
}