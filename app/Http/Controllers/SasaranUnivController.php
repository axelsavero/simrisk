<?php

namespace App\Http\Controllers;

use App\Models\SasaranUniv;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\{Redirect, Storage, Auth};
use Illuminate\Validation\Rule;

class SasaranUnivController extends Controller
{
    /**
     * Display a listing of sasaran universitas
     */
    public function index(Request $request)
    {
        $query = SasaranUniv::query();
        
        // Filter berdasarkan status
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        // Filter berdasarkan periode
        if ($request->periode) {
            $query->where('periode_tahun', $request->periode);
        }
        
        // Filter berdasarkan kategori
        if ($request->kategori) {
            $query->where('kategori', $request->kategori);
        }
        
        // Search berdasarkan kode atau nama sasaran
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('kode_sasaran', 'like', "%{$request->search}%")
                  ->orWhere('nama_sasaran', 'like', "%{$request->search}%");
            });
        }
        
        $sasaranUnivs = $query->latest()->paginate(10)
            ->appends($request->query())
            ->through(fn($sasaran) => [
                'id_sasaran_univ' => $sasaran->id_sasaran_univ,
                'kode_sasaran' => $sasaran->kode_sasaran,
                'nama_sasaran' => $sasaran->nama_sasaran,
                'deskripsi' => $sasaran->deskripsi,
                'kategori' => $sasaran->kategori,
                'periode_tahun' => $sasaran->periode_tahun,
                'target_capaian' => $sasaran->target_capaian,
                'satuan_target' => $sasaran->satuan_target,
                'prioritas' => $sasaran->prioritas,
                'status' => $sasaran->status,
                'pic_sasaran' => $sasaran->pic_sasaran,
                'total_dokumen' => $sasaran->total_dokumen,
                'tanggal_mulai' => $sasaran->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $sasaran->tanggal_selesai?->format('Y-m-d'),
                'created_at' => $sasaran->created_at->format('d/m/Y'),
            ]);

        return Inertia::render('sasaran/sasaranuniv/index', [
            'sasaranUnivs' => $sasaranUnivs,
            'filters' => $request->only(['status', 'periode', 'kategori', 'search']),
            'dropdownOptions' => $this->getDropdownOptions(),
        ]);
    }

    /**
     */
    public function create()
    {
        return Inertia::render('sasaran/sasaranuniv/form', [
            'sasaranUniv' => null,
            'dropdownOptions' => $this->getDropdownOptions(),
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created sasaran in storage
     */
    public function store(Request $request)
    {
        // Validation lengkap sesuai form di search results [1]
        $validated = $request->validate([
            // Data sasaran utama
            'kode_sasaran' => 'required|string|unique:sasaran_univ,kode_sasaran|max:20',
            'nama_sasaran' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'target_capaian' => 'nullable|numeric|min:0',
            'satuan_target' => 'nullable|string|max:50',
            'periode_tahun' => 'required|integer|min:2000|max:2100',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'bobot_penilaian' => 'nullable|numeric|min:0|max:100',
            'prioritas' => 'required|string|in:tinggi,sedang,rendah',
            'kategori' => 'nullable|string|in:akademik,penelitian,pengabdian,kemahasiswaan,keuangan,infrastruktur',
            'status' => 'required|string|in:aktif,non-aktif,selesai,ditunda',
            'pic_sasaran' => 'nullable|string|max:255',
            
            'nama_dokumen' => 'nullable|string|max:255',
            'nomor_dokumen' => 'nullable|string|max:100',
            'tanggal_dokumen' => 'nullable|date',
            'dokumen_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
        ], [
            'kode_sasaran.unique' => 'Kode sasaran sudah digunakan.',
            'kode_sasaran.required' => 'Kode sasaran wajib diisi.',
            'nama_sasaran.required' => 'Nama sasaran wajib diisi.',
            'periode_tahun.required' => 'Periode tahun wajib diisi.',
            'prioritas.required' => 'Prioritas wajib dipilih.',
            'status.required' => 'Status wajib dipilih.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
            'dokumen_file.mimes' => 'File harus berformat PDF, DOC, DOCX, XLS, XLSX, PPT, atau PPTX.',
            'dokumen_file.max' => 'Ukuran file maksimal 10MB.',
        ]);

        try {
            // Pisahkan data sasaran dari data dokumen
            $sasaranData = collect($validated)->except([
                'nama_dokumen', 'nomor_dokumen', 'tanggal_dokumen', 'dokumen_file'
            ])->toArray();

            // Buat sasaran baru
            $sasaran = SasaranUniv::create($sasaranData);

            if ($request->hasFile('dokumen_file')) {
                $this->uploadDokumenToJSON($request, $sasaran);
            }

            return Redirect::route('sasaran-univ.index')
                ->with('success', 'Sasaran universitas berhasil dibuat.');

        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->with('error', 'Gagal menyimpan sasaran: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified sasaran
     */
    public function show(SasaranUniv $sasaranUniv)
    {
        return Inertia::render('sasaran/sasaranuniv/show', [
            'sasaranUniv' => [
                'id_sasaran_univ' => $sasaranUniv->id_sasaran_univ,
                'kode_sasaran' => $sasaranUniv->kode_sasaran,
                'nama_sasaran' => $sasaranUniv->nama_sasaran,
                'deskripsi' => $sasaranUniv->deskripsi,
                'target_capaian' => $sasaranUniv->target_capaian,
                'satuan_target' => $sasaranUniv->satuan_target,
                'periode_tahun' => $sasaranUniv->periode_tahun,
                'tanggal_mulai' => $sasaranUniv->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $sasaranUniv->tanggal_selesai?->format('Y-m-d'),
                'bobot_penilaian' => $sasaranUniv->bobot_penilaian,
                'prioritas' => $sasaranUniv->prioritas,
                'kategori' => $sasaranUniv->kategori,
                'status' => $sasaranUniv->status,
                'pic_sasaran' => $sasaranUniv->pic_sasaran,
                'dokumen_list' => $sasaranUniv->dokumen_formatted,
                'total_dokumen' => $sasaranUniv->total_dokumen,
                'created_at' => $sasaranUniv->created_at->format('d/m/Y H:i'),
                'updated_at' => $sasaranUniv->updated_at->format('d/m/Y H:i'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified sasaran
     */
    public function edit(SasaranUniv $sasaranUniv)
    {
        return Inertia::render('sasaran/sasaranuniv/form', [
            'sasaranUniv' => [
                'id_sasaran_univ' => $sasaranUniv->id_sasaran_univ,
                'kode_sasaran' => $sasaranUniv->kode_sasaran,
                'nama_sasaran' => $sasaranUniv->nama_sasaran,
                'deskripsi' => $sasaranUniv->deskripsi,
                'target_capaian' => $sasaranUniv->target_capaian,
                'satuan_target' => $sasaranUniv->satuan_target,
                'periode_tahun' => $sasaranUniv->periode_tahun,
                'tanggal_mulai' => $sasaranUniv->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $sasaranUniv->tanggal_selesai?->format('Y-m-d'),
                'bobot_penilaian' => $sasaranUniv->bobot_penilaian,
                'prioritas' => $sasaranUniv->prioritas,
                'kategori' => $sasaranUniv->kategori,
                'status' => $sasaranUniv->status,
                'pic_sasaran' => $sasaranUniv->pic_sasaran,
                'dokumen_list' => $sasaranUniv->dokumen_formatted,
            ],
            'dropdownOptions' => $this->getDropdownOptions(),
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified sasaran in storage
     */
    public function update(Request $request, SasaranUniv $sasaranUniv)
    {
        $validated = $request->validate([
            'kode_sasaran' => [
                'required',
                'string',
                'max:20',
                Rule::unique('sasaran_univ')->ignore($sasaranUniv->id_sasaran_univ, 'id_sasaran_univ')
            ],
            'nama_sasaran' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'target_capaian' => 'nullable|numeric|min:0',
            'satuan_target' => 'nullable|string|max:50',
            'periode_tahun' => 'required|integer|min:2000|max:2100',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'bobot_penilaian' => 'nullable|numeric|min:0|max:100',
            'prioritas' => 'required|string|in:tinggi,sedang,rendah',
            'kategori' => 'nullable|string|in:akademik,penelitian,pengabdian,kemahasiswaan,keuangan,infrastruktur',
            'status' => 'required|string|in:aktif,non-aktif,selesai,ditunda',
            'pic_sasaran' => 'nullable|string|max:255',
            
            // Dokumen validation untuk update
            'nama_dokumen' => 'nullable|string|max:255',
            'nomor_dokumen' => 'nullable|string|max:100',
            'tanggal_dokumen' => 'nullable|date',
            'dokumen_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
        ]);

        try {
            // Update data sasaran
            $sasaranData = collect($validated)->except([
                'nama_dokumen', 'nomor_dokumen', 'tanggal_dokumen', 'dokumen_file'
            ])->toArray();

            $sasaranUniv->update($sasaranData);

            // Handle upload dokumen baru jika ada
            if ($request->hasFile('dokumen_file')) {
                $this->uploadDokumenToJSON($request, $sasaranUniv);
            }

            return Redirect::route('sasaran-univ.index')
                ->with('success', 'Sasaran universitas berhasil diperbarui.');

        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->with('error', 'Gagal memperbarui sasaran: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified sasaran from storage
     */
    public function destroy(SasaranUniv $sasaranUniv)
    {
        try {
            // Cek apakah sasaran bisa dihapus
            if ($sasaranUniv->sasaranUnits()->count() > 0) {
                return Redirect::back()
                    ->with('error', 'Tidak dapat menghapus sasaran yang sudah memiliki assignment ke unit.');
            }

            // Hapus file dokumen dari storage
            if ($sasaranUniv->dokumen_data) {
                foreach ($sasaranUniv->dokumen_data as $dokumen) {
                    if (isset($dokumen['file_path']) && Storage::disk('public')->exists($dokumen['file_path'])) {
                        Storage::disk('public')->delete($dokumen['file_path']);
                    }
                }
            }

            $sasaranUniv->delete();

            return Redirect::route('sasaran-univ.index')
                ->with('success', 'Sasaran universitas berhasil dihapus.');

        } catch (\Exception $e) {
            return Redirect::back()
                ->with('error', 'Gagal menghapus sasaran: ' . $e->getMessage());
        }
    }

    /**
     */
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
            'uploaded_by' => Auth::user()->name ?? 'System',
        ];

        $sasaran->addDokumen($dokumenData);
    }

    /**
     * Download dokumen
     */
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

    /**
     * Hapus dokumen
     */
    public function deleteDokumen(Request $request, SasaranUniv $sasaranUniv, string $dokumenId)
    {
        try {
            $dokumen = $sasaranUniv->getDokumen($dokumenId);
            
            if (!$dokumen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen tidak ditemukan'
                ], 404);
            }

            // Hapus file dari storage
            if (Storage::disk('public')->exists($dokumen['file_path'])) {
                Storage::disk('public')->delete($dokumen['file_path']);
            }

            // Remove dari JSON
            $sasaranUniv->removeDokumen($dokumenId);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus dokumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown options untuk form (sesuai memory entry [5] - desain UI)
     */
    private function getDropdownOptions(): array
    {
        return [
            'kategori' => [
                'akademik' => 'Akademik',
                'penelitian' => 'Penelitian',
                'pengabdian' => 'Pengabdian',
                'kemahasiswaan' => 'Kemahasiswaan',
                'keuangan' => 'Keuangan',
                'infrastruktur' => 'Infrastruktur',
            ],
            'prioritas' => [
                'tinggi' => 'Tinggi',
                'sedang' => 'Sedang',
                'rendah' => 'Rendah',
            ],
            'status' => [
                'aktif' => 'Aktif',
                'non-aktif' => 'Non-Aktif',
                'selesai' => 'Selesai',
                'ditunda' => 'Ditunda',
            ],
        ];
    }

    /**
     * Get sasaran list untuk dropdown di form lain
     */
    public function getSasaranList()
    {
        $sasaranList = SasaranUniv::aktif()
            ->select('id_sasaran_univ', 'kode_sasaran', 'nama_sasaran')
            ->orderBy('kode_sasaran')
            ->get()
            ->map(fn($sasaran) => [
                'value' => $sasaran->id_sasaran_univ,
                'label' => "{$sasaran->kode_sasaran} - {$sasaran->nama_sasaran}"
            ]);

        return response()->json($sasaranList);
    }
}
