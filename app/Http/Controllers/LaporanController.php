<?php

namespace App\Http\Controllers;

use App\Models\IdentifyRisk;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Exports\RiskReportExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class LaporanController extends Controller
{
    /**
     * Menampilkan halaman laporan utama.
     */
    public function index(Request $request)
    {
        $unitFilter = $request->query('unit');
        $kategoriFilter = $request->query('kategori');
        $tahunFilter = $request->query('tahun');

        // Ambil data risiko yang sudah disetujui (approved) dengan relasi yang dibutuhkan
        // Eager loading untuk performa yang lebih baik
        $risksQuery = IdentifyRisk::with([
            'user.unit',          // Untuk mendapatkan Pemilik Risiko dan Unit
            'penangananRisiko',   // Untuk mendapatkan list Penanganan Risiko
            'mitigasis' => function ($query) {
                // Ambil mitigasi yang relevan (misal, yang sudah disetujui juga)
                $query->where('validation_status', 'approved')->latest();
            }
        ])->where('validation_status', 'approved');

        $risksQuery->when($unitFilter, function ($query, $unitName) {
            $query->whereHas('user.unit', function ($subQuery) use ($unitName) {
                $subQuery->where('nama_unit', $unitName);
            });
        });

        $risksQuery->when($kategoriFilter, function ($query, $kategori) {
            $query->where('risk_category', $kategori);
        });

        $risksQuery->when($tahunFilter, function ($query, $tahun) {
            $query->where('tahun', $tahun);
        });
            
        // Lakukan paginasi
        $paginatedRisks = $risksQuery->paginate(50)->withQueryString();

        // Transformasi data agar sesuai dengan format yang diinginkan frontend
        $paginatedRisks->getCollection()->transform(function ($risk) {
            // Ambil mitigasi pertama yang terkait (jika ada)
            $mitigasi = $risk->mitigasis->first();

            // Biaya
            $biayaRencana = (float) $risk->biaya_penangan;
            $biayaRealisasi = $mitigasi ? (float) $mitigasi->biaya_mitigasi : 0;

            // Hitung Varian Biaya
            $varian = 'N/A';
            if ($biayaRencana > 0) {
                $selisih = $biayaRencana - $biayaRealisasi;
                $persentase = ($selisih / $biayaRencana) * 100;
                $varian = round($persentase, 2) . '%';
            }

            return [
                'id' => $risk->id,
                'id_identify' => $risk->id_identify,
                'nama_risiko' => $risk->description,
                'penanganan' => $risk->penangananRisiko->pluck('description')->toArray(),
                'jadwal_mulai' => Carbon::parse($risk->identification_date_start)->isoFormat('D MMM YYYY'),
                'jadwal_selesai' => $mitigasi ? Carbon::parse($mitigasi->target_selesai)->isoFormat('D MMM YYYY') : '-',
                'rencana' => number_format($biayaRencana, 0, ',', '.'),
                'realisasi' => number_format($biayaRealisasi, 0, ',', '.'),
                'varian' => $varian,
                'status' => $mitigasi ? $mitigasi->status_label : 'Belum ada mitigasi',
                'pemilik' => $risk->user?->name ?? 'Tidak diketahui',
                'unit' => $risk->user?->unit?->nama_unit ?? $risk->user?->unit ?? $risk->unit_kerja ?? 'Tidak Diketahui',
                'rekomendasi' => $mitigasi ? $mitigasi->rekomendasi_lanjutan : '-',
                // Kolom-kolom lain dari frontend yang mungkin belum ter-map
                'kode' => $risk->id_identify,
                'deskripsi' => $risk->description,
                'jadwal' => Carbon::parse($risk->identification_date_start)->isoFormat('D MMM YYYY'), // Fallback jika perlu
                'ket' => $mitigasi ? Carbon::parse($mitigasi->target_selesai)->isoFormat('D MMM YYYY') : '-', // Fallback jika perlu
            ];
        });

        return Inertia::render('laporan/index', [
            'risks' => $paginatedRisks,
            'filterOptions' => [
                // (LOGIKA UNTUK MENGAMBIL OPSI FILTER BISA DITAMBAHKAN DI SINI NANTINYA)
                'units' => Unit::where('status', 'aktif')->pluck('nama_unit')->toArray(),
                'kategoris' => IdentifyRisk::distinct()->pluck('risk_category')->toArray(),
                'tahuns' => IdentifyRisk::distinct()->pluck('tahun')->toArray(),
            ],
            'filters' => $request->all(['search', 'unit', 'kategori', 'tahun']),
            'metaData' => [
                'generated_at' => now()->isoFormat('D MMMM YYYY, HH:mm:ss'),
                'generated_by' => auth()->user()->name,
            ],
        ]);
    }

    public function exportPdf(Request $request)
    {
        // PERBAIKAN UTAMA DI SINI
        $requestData = $request->input('data', []);
        $signature = [
            'jabatan' => $requestData['jabatan'] ?? '',
            'nama' => $requestData['nama'] ?? '',       
            'nip' => $requestData['nip'] ?? '',         
        ];

        $risks = $this->getReportData($request, false);

        $data = [
            'risks' => $risks,
            'signature' => $signature,
            'tanggal' => now()->isoFormat('D MMMM YYYY'),
        ];

        $pdf = Pdf::loadView('laporan.pdf', $data)->setPaper('a4', 'landscape');
        return $pdf->download('laporan-risiko-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Menangani ekspor ke Excel.
     */
    public function exportExcel(Request $request)
    {
        // PERBAIKAN UTAMA DI SINI
        $requestData = $request->input('data', []);
        $signature = [
            'jabatan' => $requestData['jabatan'] ?? '',
            'nama' => $requestData['nama'] ?? '',
            'nip' => $requestData['nip'] ?? '',
        ];
        
        $risks = $this->getReportData($request, false);
        
        return Excel::download(new RiskReportExport($risks, $signature), 'laporan-risiko-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Method private untuk mengambil dan memformat data laporan.
     */
    private function getReportData(Request $request, bool $paginate = false)
    {
        $requestData = $paginate ? $request->query() : $request->input('data', []);

        $unitFilter = $requestData['unit'] ?? null;
        $kategoriFilter = $requestData['kategori'] ?? null;
        $tahunFilter = $requestData['tahun'] ?? null;

        $risksQuery = IdentifyRisk::with([
            'user.unit',
            'penangananRisiko',
            'mitigasis' => fn($q) => $q->where('validation_status', 'approved')->latest(),
        ])
        ->where('validation_status', 'approved')
        ->when($unitFilter, fn($q, $unit) => $q->whereHas('user.unit', fn($sq) => $sq->where('nama_unit', $unit)))
        ->when($kategoriFilter, fn($q, $kategori) => $q->where('risk_category', $kategori))
        ->when($tahunFilter, fn($q, $tahun) => $q->where('tahun', $tahun));

        $results = $paginate ? $risksQuery->paginate(50)->withQueryString() : $risksQuery->get();
        
        $collection = $paginate ? $results->getCollection() : $results;

        $collection->transform(function ($risk) {
            $mitigasi = $risk->mitigasis->first();
            $biayaRencana = (float) $risk->biaya_penangan;
            $biayaRealisasi = $mitigasi ? (float) $mitigasi->biaya_mitigasi : 0;
            $varian = 'N/A';
            if ($biayaRencana > 0) {
                $selisih = $biayaRencana - $biayaRealisasi;
                $persentase = ($selisih / $biayaRencana) * 100;
                $varian = round($persentase, 2) . '%';
            }

            return (object) [
                'no' => 0,
                'kode_risiko' => $risk->id_identify,
                'deskripsi' => $risk->description,
                'penanganan' => $risk->penangananRisiko->pluck('description')->implode("\n"),
                'jadwal_mulai' => Carbon::parse($risk->identification_date_start)->isoFormat('D/MM/YY'),
                'jadwal_selesai' => $mitigasi ? Carbon::parse($mitigasi->target_selesai)->isoFormat('D/MM/YY') : '-',
                'rencana' => $biayaRencana,
                'realisasi' => $biayaRealisasi,
                'varian' => $varian,
                'status' => $mitigasi ? $mitigasi->status_label : 'Belum ada mitigasi',
                'pemilik' => $risk->user?->name ?? 'N/A',
                'unit' => $risk->user?->unit?->nama_unit ?? $risk->user?->unit ?? $risk->unit_kerja ?? 'N/A',
                'rekomendasi' => $mitigasi ? $mitigasi->rekomendasi_lanjutan : '-',
            ];
        });

        return $results;
    }
}