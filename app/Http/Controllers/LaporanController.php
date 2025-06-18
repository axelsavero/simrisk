<?php

namespace App\Http\Controllers;

use App\Models\IdentifyRisk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class LaporanController extends Controller
{
    public function __construct()
    {
        // Middleware untuk akses laporan
        $this->middleware(function ($request, $next) {
            if (!Auth::check()) {
                abort(403, 'AKSES DITOLAK: Anda harus login terlebih dahulu.');
            }
            return $next($request);
        });
    }

    /**
     * Halaman utama laporan dengan pilihan jenis laporan
     */
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('laporan/index', [
            'permissions' => [
                'canViewAll' => $user->hasRole('super-admin'),
                'canViewReports' => $user->hasAnyRole(['super-admin', 'pimpinan', 'owner-risk']),
                'canExport' => $user->hasAnyRole(['super-admin', 'pimpinan']),
            ],
            'summary' => $this->getLaporanSummary()
        ]);
    }

    /**
     * Laporan Risk Matrix Detail
     */
    public function riskMatrix(Request $request)
    {
        // Filter parameters
        $unit = $request->get('unit');
        $kategori = $request->get('kategori'); 
        $tahun = $request->get('tahun', date('Y'));
        $periode_start = $request->get('periode_start');
        $periode_end = $request->get('periode_end');

        // Base query dengan role-based filtering
        $query = $this->getBaseQuery();
        
        // Apply filters
        $risks = $query->byUnit($unit)
            ->byKategori($kategori)
            ->byTahun($tahun)
            ->when($periode_start, function($q) use ($periode_start) {
                return $q->where('identification_date_start', '>=', $periode_start);
            })
            ->when($periode_end, function($q) use ($periode_end) {
                return $q->where('identification_date_end', '<=', $periode_end);
            })
            ->get();

        return Inertia::render('laporan/risk-matrix', [
            'riskMatrixData' => $this->formatRiskMatrixData($risks),
            'riskDetailData' => $this->formatRiskDetailData($risks),
            'statistik' => $this->getStatistikLaporan($risks),
            'filters' => compact('unit', 'kategori', 'tahun', 'periode_start', 'periode_end'),
            'filterOptions' => $this->getFilterOptions(),
            'metaData' => [
                'generated_at' => now()->format('d/m/Y H:i:s'),
                'generated_by' => Auth::user()->name,
                'total_records' => $risks->count(),
                'periode' => $this->getPeriodeText($periode_start, $periode_end)
            ]
        ]);
    }

    /**
     * Laporan Detail Risiko (Tabel lengkap)
     */
    public function riskDetail(Request $request)
    {
        // Filter sama seperti risk matrix
        $unit = $request->get('unit');
        $kategori = $request->get('kategori'); 
        $tahun = $request->get('tahun', date('Y'));
        $validation_status = $request->get('validation_status');

        $query = $this->getBaseQuery();
        
        $risks = $query->byUnit($unit)
            ->byKategori($kategori)
            ->byTahun($tahun)
            ->when($validation_status, function($q) use ($validation_status) {
                return $q->where('validation_status', $validation_status);
            })
            ->with(['validationProcessor', 'creator'])
            ->orderBy('level', 'desc') // Urutkan dari risk tertinggi
            ->paginate(50);

        return Inertia::render('laporan/risk-detail', [
            'risks' => $risks,
            'statistik' => $this->getDetailStatistik($risks),
            'filters' => compact('unit', 'kategori', 'tahun', 'validation_status'),
            'filterOptions' => $this->getFilterOptions(),
            'metaData' => [
                'generated_at' => now()->format('d/m/Y H:i:s'),
                'generated_by' => Auth::user()->name,
            ]
        ]);
    }

    /**
     * Export laporan ke PDF
     */
    public function exportPdf(Request $request)
    {
        // Implementasi export PDF menggunakan DomPDF atau lainnya
        $unit = $request->get('unit');
        $kategori = $request->get('kategori'); 
        $tahun = $request->get('tahun', date('Y'));

        $query = $this->getBaseQuery();
        $risks = $query->byUnit($unit)->byKategori($kategori)->byTahun($tahun)->get();

        $data = [
            'riskMatrixData' => $this->formatRiskMatrixData($risks),
            'risks' => $risks,
            'statistik' => $this->getStatistikLaporan($risks),
            'filters' => compact('unit', 'kategori', 'tahun'),
            'metaData' => [
                'generated_at' => now()->format('d/m/Y H:i:s'),
                'generated_by' => Auth::user()->name,
                'total_records' => $risks->count(),
            ]
        ];

        // Return PDF download
        return response()->json([
            'message' => 'Export PDF akan segera tersedia',
            'data' => $data
        ]);
    }

    /**
     * Export laporan ke Excel
     */
    public function exportExcel(Request $request)
    {
        // Implementasi export Excel menggunakan Laravel Excel
        $unit = $request->get('unit');
        $kategori = $request->get('kategori'); 
        $tahun = $request->get('tahun', date('Y'));

        $query = $this->getBaseQuery();
        $risks = $query->byUnit($unit)->byKategori($kategori)->byTahun($tahun)->get();

        $data = $risks->map(function($risk) {
            return [
                'ID Risiko' => $risk->id_identify,
                'Nama Risiko' => $risk->nama_risiko,
                'Deskripsi' => $risk->description,
                'Unit Kerja' => $risk->unit_kerja,
                'Kategori' => $risk->kategori_risiko,
                'Tahun' => $risk->tahun,
                'Probability' => $risk->probability,
                'Impact' => $risk->impact,
                'Level' => $risk->level,
                'Risk Level' => $risk->inherent_risk_level,
                'Probability Residual' => $risk->probability_residual,
                'Impact Residual' => $risk->impact_residual,
                'Level Residual' => $risk->level_residual,
                'Residual Risk Level' => $risk->residual_risk_level,
                'Status Validasi' => $risk->validation_status_label,
                'Tanggal Dibuat' => $risk->created_at->format('d/m/Y'),
            ];
        });

        return response()->json([
            'message' => 'Export Excel akan segera tersedia',
            'data' => $data->toArray()
        ]);
    }

    // ======= PRIVATE HELPER METHODS =======

    private function getBaseQuery()
    {
        $user = Auth::user();
        $query = IdentifyRisk::query();
        
        // Role-based filtering
        if ($user->hasRole('super-admin')) {
            // Super admin melihat semua kecuali draft
            return $query->whereNotIn('validation_status', ['draft'])
                        ->where('status', true);
        } elseif ($user->hasRole('owner-risk')) {
            // Owner-risk melihat semua data mereka
            return $query->where('status', true);
        } elseif ($user->hasRole('pimpinan')) {
            // Pimpinan hanya approved
            return $query->approved()->where('status', true);
        } else {
            // User lain hanya approved
            return $query->approved()->where('status', true);
        }
    }

    private function formatRiskMatrixData($risks)
    {
        $riskPointsSebelum = [];
        $riskPointsSesudah = [];

        foreach ($risks as $risk) {
            // Risk points untuk "Sebelum" (Inherent Risk)
            if ($risk->probability && $risk->impact) {
                $riskPointsSebelum[] = [
                    'x' => $risk->probability,
                    'y' => $risk->impact,
                    'label' => (string)$risk->id,
                    'kode_risiko' => $risk->id_identify,
                    'nama_risiko' => $risk->nama_risiko,
                    'score' => $risk->level
                ];
            }

            // Risk points untuk "Sesudah" (Residual Risk)
            if ($risk->probability_residual && $risk->impact_residual) {
                $riskPointsSesudah[] = [
                    'x' => $risk->probability_residual,
                    'y' => $risk->impact_residual,
                    'label' => (string)$risk->id,
                    'kode_risiko' => $risk->id_identify,
                    'nama_risiko' => $risk->nama_risiko,
                    'score' => $risk->level_residual
                ];
            }
        }

        // Calculate tingkat risiko
        $tingkatRisiko = $this->calculateRiskLevels($risks);

        return [
            'riskPointsSebelum' => $riskPointsSebelum,
            'riskPointsSesudah' => $riskPointsSesudah,
            'tingkatRisiko' => $tingkatRisiko
        ];
    }

    private function formatRiskDetailData($risks)
    {
        return $risks->map(function($risk) {
            return [
                'id' => $risk->id,
                'id_identify' => $risk->id_identify,
                'nama_risiko' => $risk->nama_risiko,
                'description' => $risk->description,
                'unit_kerja' => $risk->unit_kerja,
                'kategori_risiko' => $risk->kategori_risiko,
                'tahun' => $risk->tahun,
                'probability' => $risk->probability,
                'impact' => $risk->impact,
                'level' => $risk->level,
                'inherent_risk_level' => $risk->inherent_risk_level,
                'probability_residual' => $risk->probability_residual,
                'impact_residual' => $risk->impact_residual,
                'level_residual' => $risk->level_residual,
                'residual_risk_level' => $risk->residual_risk_level,
                'risk_reduction' => $risk->risk_reduction,
                'validation_status' => $risk->validation_status,
                'validation_status_label' => $risk->validation_status_label,
                'created_at' => $risk->created_at->format('d/m/Y'),
            ];
        });
    }

    private function calculateRiskLevels($risks)
    {
        $levels = [
            'Sangat Rendah' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-green-500'],
            'Rendah' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-yellow-300'],
            'Sedang' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-orange-400'],
            'Tinggi' => ['inheren' => 0, 'residual' => 0, 'color' => 'bg-red-500'],
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

        return collect($levels)->map(function($data, $tingkat) {
            return [
                'tingkat' => $tingkat,
                'inheren' => $data['inheren'],
                'residual' => $data['residual'],
                'color' => $data['color']
            ];
        })->values()->toArray();
    }

    private function getStatistikLaporan($risks)
    {
        $total = $risks->count();
        
        return [
            'total_risks' => $total,
            'high_risks' => $risks->where('level', '>=', 17)->count(),
            'medium_risks' => $risks->whereBetween('level', [9, 16])->count(),
            'low_risks' => $risks->whereBetween('level', [3, 8])->count(),
            'very_low_risks' => $risks->whereBetween('level', [1, 2])->count(),
            'by_unit' => $risks->groupBy('unit_kerja')->map->count()->sortDesc()->take(10),
            'by_kategori' => $risks->groupBy('kategori_risiko')->map->count()->sortDesc(),
            'by_validation_status' => $risks->groupBy('validation_status')->map->count(),
            'mitigation_effectiveness' => $this->calculateMitigationEffectiveness($risks)
        ];
    }

    private function getDetailStatistik($risks)
    {
        $collection = collect($risks->items());
        
        return [
            'total_records' => $risks->total(),
            'current_page_count' => $collection->count(),
            'avg_inherent_level' => round($collection->avg('level'), 2),
            'avg_residual_level' => round($collection->avg('level_residual'), 2),
            'highest_risk' => $collection->sortByDesc('level')->first(),
            'most_improved' => $collection->sortByDesc('risk_reduction')->first()
        ];
    }

    private function calculateMitigationEffectiveness($risks)
    {
        $risksWithMitigation = $risks->filter(function($risk) {
            return $risk->level && $risk->level_residual;
        });

        if ($risksWithMitigation->isEmpty()) {
            return ['percentage' => 0, 'average_reduction' => 0];
        }

        $totalReduction = $risksWithMitigation->sum('risk_reduction');
        $averageReduction = $totalReduction / $risksWithMitigation->count();

        return [
            'percentage' => round(($risksWithMitigation->where('risk_reduction', '>', 0)->count() / $risksWithMitigation->count()) * 100, 1),
            'average_reduction' => round($averageReduction, 1),
            'total_risks_mitigated' => $risksWithMitigation->count()
        ];
    }

    private function getLaporanSummary()
    {
        return [
            'total_risks' => IdentifyRisk::count(),
            'approved_risks' => IdentifyRisk::approved()->count(),
            'high_risks' => IdentifyRisk::where('level', '>=', 17)->count(),
            'last_updated' => IdentifyRisk::latest('updated_at')->first()?->updated_at?->format('d/m/Y H:i'),
        ];
    }

    private function getFilterOptions()
    {
        return [
            'units' => IdentifyRisk::distinct()->whereNotNull('unit_kerja')->pluck('unit_kerja')->filter()->sort()->values(),
            'kategoris' => IdentifyRisk::distinct()->whereNotNull('kategori_risiko')->pluck('kategori_risiko')->filter()->sort()->values(),
            'tahuns' => IdentifyRisk::distinct()->whereNotNull('tahun')->pluck('tahun')->filter()->sort()->values(),
            'validation_statuses' => [
                'draft' => 'Draft',
                'pending' => 'Menunggu Validasi',
                'approved' => 'Disetujui',
                'rejected' => 'Ditolak'
            ]
        ];
    }

    private function getPeriodeText($start, $end)
    {
        if (!$start && !$end) return 'Semua Periode';
        if ($start && !$end) return 'Sejak ' . Carbon::parse($start)->format('d/m/Y');
        if (!$start && $end) return 'Hingga ' . Carbon::parse($end)->format('d/m/Y');
        return Carbon::parse($start)->format('d/m/Y') . ' - ' . Carbon::parse($end)->format('d/m/Y');
    }
}
