<?php
// app/Http/Controllers/SasaranUnivController.php (UPDATE YANG SUDAH ADA)

namespace App\Http\Controllers;

use App\Models\SasaranUniv;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\{Redirect, Storage, Auth};
use Illuminate\Validation\Rule;

class SasaranUnivController extends Controller
{
    // Update method store untuk handle dokumen
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Data sasaran existing
            'kode_sasaran' => 'required|string|unique:sasaran_univ,kode_sasaran|max:20',
            'nama_sasaran' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'target_capaian' => 'nullable|numeric',
            'satuan_target' => 'nullable|string|max:50',
            'periode_tahun' => 'required|integer|min:2000|max:2100',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'bobot_penilaian' => 'nullable|numeric|min:0|max:100',
            'prioritas' => 'required|string|in:tinggi,sedang,rendah',
            'kategori' => 'nullable|string|in:akademik,penelitian,pengabdian,kemahasiswaan,keuangan,infrastruktur',
            'status' => 'required|string|in:aktif,non-aktif,selesai,ditunda',
            'pic_sasaran' => 'nullable|string|max:255',
            
            // 🔥 TAMBAHAN: Dokumen validation (sesuai form di gambar)
            'nama_dokumen' => 'nullable|string|max:255',
            'nomor_dokumen' => 'nullable|string|max:100',
            'tanggal_dokumen' => 'nullable|date',
            'dokumen_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'keterangan' => 'nullable|string',
        ]);

        try {
            // Buat sasaran (exclude dokumen fields)
            $sasaranData = collect($validated)->except([
                'nama_dokumen', 'nomor_dokumen', 'tanggal_dokumen', 
                'dokumen_file', 'keterangan'
            ])->toArray();

            $sasaran = SasaranUniv::create($sasaranData);

            // 🔥 Handle upload dokumen jika ada (sesuai form di gambar)
            if ($request->hasFile('dokumen_file')) {
                $this->uploadDokumenToJSON($request, $sasaran);
            }

            return Redirect::route('sasaran-univ.index')
                ->with('success', 'Sasaran universitas berhasil dibuat.');

        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->with('error', 'Gagal menyimpan: ' . $e->getMessage());
        }
    }

    // 🔥 Method baru untuk upload dokumen ke JSON
    private function uploadDokumenToJSON(Request $request, SasaranUniv $sasaran)
    {
        $file = $request->file('dokumen_file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('dokumen-sasaran', $fileName, 'public');

        $dokumenData = [
            'nama_dokumen' => $request->nama_dokumen ?: $file->getClientOriginalName(),
            'nomor_dokumen' => $request->nomor_dokumen,
            'tanggal_dokumen' => $request->tanggal_dokumen,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_extension' => strtolower($file->getClientOriginalExtension()),
            'keterangan' => $request->keterangan,
            'uploaded_by' => Auth::user()->name ?? 'System',
        ];

        $sasaran->addDokumen($dokumenData);
    }

    // 🔥 Method baru untuk download dokumen
    public function downloadDokumen(SasaranUniv $sasaranUniv, string $dokumenId)
    {
        $dokumen = $sasaranUniv->getDokumen($dokumenId);
        
        if (!$dokumen) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        if (!Storage::disk('public')->exists($dokumen['file_path'])) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $dokumen['file_path'],
            $dokumen['file_name']
        );
    }

    // Update method show untuk include dokumen
    public function show(SasaranUniv $sasaranUniv)
    {
        return Inertia::render('sasaran/sasaranuniv/show', [
            'sasaranUniv' => [
                // Existing data
                'id_sasaran_univ' => $sasaranUniv->id_sasaran_univ,
                'kode_sasaran' => $sasaranUniv->kode_sasaran,
                'nama_sasaran' => $sasaranUniv->nama_sasaran,
                'deskripsi' => $sasaranUniv->deskripsi,
                'target_capaian' => $sasaranUniv->target_capaian,
                'satuan_target' => $sasaranUniv->satuan_target,
                'periode_tahun' => $sasaranUniv->periode_tahun,
                'prioritas' => $sasaranUniv->prioritas,
                'kategori' => $sasaranUniv->kategori,
                'status' => $sasaranUniv->status,
                'pic_sasaran' => $sasaranUniv->pic_sasaran,
                
                // 🔥 TAMBAHAN: Dokumen data formatted
                'dokumen_list' => $sasaranUniv->dokumen_formatted,
                'total_dokumen' => $sasaranUniv->total_dokumen,
            ]
        ]);
    }

    // Method lainnya tetap sama...
    public function index(Request $request)
    {
        $query = SasaranUniv::query();
        
        // Existing filter logic...
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('kode_sasaran', 'like', "%{$request->search}%")
                  ->orWhere('nama_sasaran', 'like', "%{$request->search}%");
            });
        }
        
        $sasaranUnivs = $query->latest()->paginate(10)
            ->appends($request->query())
            ->through(fn($sasaran) => [
                // Existing data mapping
                'id_sasaran_univ' => $sasaran->id_sasaran_univ,
                'kode_sasaran' => $sasaran->kode_sasaran,
                'nama_sasaran' => $sasaran->nama_sasaran,
                'kategori' => $sasaran->kategori,
                'periode_tahun' => $sasaran->periode_tahun,
                'prioritas' => $sasaran->prioritas,
                'status' => $sasaran->status,
                'pic_sasaran' => $sasaran->pic_sasaran,
                'total_dokumen' => $sasaran->total_dokumen, // 🔥 TAMBAHAN
            ]);

        return Inertia::render('sasaran/sasaranuniv/index', [
            'sasaranUnivs' => $sasaranUnivs,
            'filters' => $request->only(['status', 'search']),
        ]);
    }
}
