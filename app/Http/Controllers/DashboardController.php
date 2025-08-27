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
        // Filter parameters
        $unit = $request->get('unit');
        $kategori = $request->get('kategori');
        $tahun = $request->get('tahun', date('Y'));
        $statusMitigasi = $request->get('status_mitigasi');

        // Base query dengan role-based filtering
        $query = $this->applyRoleScope(IdentifyRisk::query(), [
            'userColumn' => 'user_id',
            // IdentifyRisk tidak punya unit_id; gunakan unit via relasi user.unit_id
            'unitColumn' => null,
            'unitViaUser' => true,
            'userRelation' => 'user',
        ])->where('is_active', true);

        // Apply filters
        $risks = $query->byUnit($unit)
            ->byKategori($kategori)
            ->byTahun($tahun)
            ->byStatusMitigasi($statusMitigasi)
            ->get();

        return Inertia::render('dashboard/index', [
            'riskMatrixData' => $this->formatRiskMatrixData($risks),
            'mitigasiMatrixData' => $this->formatMitigasiMatrixData($unit, $kategori, $tahun),
            'dashboardStats' => $this->getDashboardStatistics($risks),
            'riskTrends' => $this->getRiskTrends($tahun),
            'filters' => compact('unit', 'kategori', 'tahun', 'statusMitigasi'),
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
        ])->where('is_active', true);
    }

    private function formatRiskMatrixData($risks)
    {
        $riskPointsInherent = [];
        $riskPointsResidual = [];

        foreach ($risks as $risk) {
            // Inherent Risk Points (sebelum mitigasi)
            if ($risk->probability && $risk->impact) {
                $riskPointsInherent[] = [
                    'x' => $risk->probability,
                    'y' => $risk->impact,
                    'label' => $risk->id,
                    'kode_risiko' => $risk->id_identify,
                    'nama_risiko' => $risk->description,
                    'score' => $risk->level,
                    'level' => $risk->inherent_risk_level,
                    'unit_kerja' => $risk->unit_kerja,
                    'pemilik_risiko' => $risk->pemilik_risiko,
                    'validation_status' => $risk->validation_status
                ];
            }

            // Residual Risk Points (setelah mitigasi)
            if ($risk->probability_residual && $risk->impact_residual) {
                $riskPointsResidual[] = [
                    'x' => $risk->probability_residual,
                    'y' => $risk->impact_residual,
                    'label' => $risk->id,
                    'kode_risiko' => $risk->id_identify,
                    'nama_risiko' => $risk->description,
                    'score' => $risk->level_residual,
                    'level' => $risk->residual_risk_level,
                    'unit_kerja' => $risk->unit_kerja,
                    'pemilik_risiko' => $risk->pemilik_risiko,
                    'reduction' => $risk->risk_reduction,
                    'validation_status' => $risk->validation_status
                ];
            }
        }

        return [
            'riskPointsSebelum' => $riskPointsInherent,
            'riskPointsSesudah' => $riskPointsResidual,
            'tingkatRisiko' => $this->calculateRiskLevels($risks),
            'totalRisks' => $risks->count(),
            'mitigationEffectiveness' => $this->calculateMitigationEffectiveness($risks)
        ];
    }

    private function formatMitigasiMatrixData($unit = null, $kategori = null, $tahun = null)
    {
        $user = Auth::user();
        $query = Mitigasi::with(['identifyRisk'])
            ->where('validation_status', Mitigasi::VALIDATION_STATUS_APPROVED);

        // Filter berdasarkan role
        if ($user->hasRole('owner-risk')) {
            $query->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->hasRole('pimpinan')) {
            $query->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('unit_kerja', $user->unit_kerja);
            });
        }
        // Super admin bisa melihat semua mitigasi yang approved

        // Apply filters
        if ($unit) {
            $query->whereHas('identifyRisk', function ($q) use ($unit) {
                $q->where('unit_kerja', $unit);
            });
        }

        if ($kategori) {
            $query->whereHas('identifyRisk', function ($q) use ($kategori) {
                $q->where('kategori_risiko', $kategori);
            });
        }

        if ($tahun) {
            $query->whereHas('identifyRisk', function ($q) use ($tahun) {
                $q->where('tahun', $tahun);
            });
        }

        $mitigasis = $query->get();

        // Format data untuk matrix
        $mitigasiPoints = [];
        $statusStats = [
            'belum_dimulai' => 0,
            'sedang_berjalan' => 0,
            'selesai' => 0,
            'tertunda' => 0,
            'dibatalkan' => 0
        ];

        $strategiStats = [
            'menghindari' => 0,
            'mengurangi' => 0,
            'mentransfer' => 0,
            'menerima' => 0
        ];

        foreach ($mitigasis as $mitigasi) {
            $risk = $mitigasi->identifyRisk;

            if ($risk && $risk->probability_residual && $risk->impact_residual) {
                $mitigasiPoints[] = [
                    'id' => $mitigasi->id,
                    'x' => $risk->probability_residual,
                    'y' => $risk->impact_residual,
                    'label' => $mitigasi->id,
                    'judul_mitigasi' => $mitigasi->judul_mitigasi,
                    'kode_risiko' => $risk->id_identify,
                    'nama_risiko' => $risk->description,
                    'strategi_mitigasi' => $mitigasi->strategi_mitigasi,
                    'status_mitigasi' => $mitigasi->status_mitigasi,
                    'progress_percentage' => $mitigasi->progress_percentage,
                    'pic_mitigasi' => $mitigasi->pic_mitigasi,
                    'target_selesai' => $mitigasi->target_selesai?->format('Y-m-d'),
                    'unit_kerja' => $risk->unit_kerja,
                    'level' => $risk->level_residual,
                    'level_text' => $risk->residual_risk_level
                ];
            }

            // Count statistics
            if (isset($statusStats[$mitigasi->status_mitigasi])) {
                $statusStats[$mitigasi->status_mitigasi]++;
            }

            if (isset($strategiStats[$mitigasi->strategi_mitigasi])) {
                $strategiStats[$mitigasi->strategi_mitigasi]++;
            }
        }

        return [
            'mitigasiPoints' => $mitigasiPoints,
            'totalMitigasi' => $mitigasis->count(),
            'statusStats' => $statusStats,
            'strategiStats' => $strategiStats,
            'completionRate' => $mitigasis->count() > 0 ?
                round(($statusStats['selesai'] / $mitigasis->count()) * 100, 1) : 0,
            'averageProgress' => $mitigasis->avg('progress_percentage') ?? 0
        ];
    }

    private function calculateRiskLevels($risks)
    {
        $levels = [
            'Sangat Rendah' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-green-500'],   // 1-2
            'Rendah' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-yellow-300'],         // 3-8
            'Sedang' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-orange-400'],         // 9-16
            'Tinggi' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-red-500'],            // 17-25
        ];

        foreach ($risks as $risk) {
            // Count inherent risk levels
            $inherentLevel = $risk->inherent_risk_level;
            if (isset($levels[$inherentLevel])) {
                $levels[$inherentLevel]['inheren']++;
            }

            // Count residual risk levels
            $residualLevel = $risk->residual_risk_level;
            if (isset($levels[$residualLevel])) {
                $levels[$residualLevel]['residual']++;
            }
        }

        // Format for frontend
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
            'units' => IdentifyRisk::distinct()
                ->whereNotNull('unit_kerja')
                ->pluck('unit_kerja')
                ->filter()
                ->sort()
                ->values(),
            'kategoris' => IdentifyRisk::distinct()
                ->whereNotNull('kategori_risiko')
                ->pluck('kategori_risiko')
                ->filter()
                ->sort()
                ->values(),
            'tahuns' => IdentifyRisk::distinct()
                ->whereNotNull('tahun')
                ->pluck('tahun')
                ->filter()
                ->sort()
                ->values(),
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
