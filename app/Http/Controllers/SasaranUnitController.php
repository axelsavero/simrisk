<?php

namespace App\Http\Controllers;

use App\Models\SasaranUnit;
use App\Models\SasaranUniv;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SasaranUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SasaranUnit::with(['sasaranUniv', 'unit']);

        // Filter berdasarkan sasaran universitas
        if ($request->filled('sasaran_univ_id')) {
            $query->where('id_sasaran_univ', $request->sasaran_univ_id);
        }

        // Filter berdasarkan unit
        if ($request->filled('unit_id')) {
            $query->where('id_unit', $request->unit_id);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_pelaksanaan', $request->status);
        }

        // Filter berdasarkan progress
        if ($request->filled('progress_min')) {
            $query->where('progress_persen', '>=', $request->progress_min);
        }
        if ($request->filled('progress_max')) {
            $query->where('progress_persen', '<=', $request->progress_max);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('pic_unit', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('sasaranUniv', function ($q) use ($search) {
                      $q->where('kategori', 'like', "%{$search}%")
                        ->orWhere('nama_dokumen', 'like', "%{$search}%");
                  })
                  ->orWhereHas('unit', function ($q) use ($search) {
                      $q->where('nama_unit', 'like', "%{$search}%")
                        ->orWhere('kode_unit', 'like', "%{$search}%");
                  });
            });
        }

        $sasaranUnits = $query->latest()->paginate(10)->withQueryString();

        // Data untuk filter dropdowns
        $sasaranUnivs = SasaranUniv::select('id_sasaran_univ', 'kategori', 'nama_dokumen')
                                   ->orderBy('kategori')
                                   ->get();
        
        $units = Unit::active()
                    ->select('id_unit', 'kode_unit', 'nama_unit')
                    ->orderBy('nama_unit')
                    ->get();

        return Inertia::render('sasaran/sasaranunit/index', [
            'sasaranUnits' => $sasaranUnits,
            'sasaranUnivs' => $sasaranUnivs,
            'units' => $units,
            'filters' => $request->only(['sasaran_univ_id', 'unit_id', 'status', 'progress_min', 'progress_max', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $sasaranUnivs = SasaranUniv::select('id_sasaran_univ', 'kategori', 'nama_dokumen')
                                   ->orderBy('kategori')
                                   ->get();
        
        $units = Unit::active()
                    ->select('id_unit', 'kode_unit', 'nama_unit')
                    ->orderBy('nama_unit')
                    ->get();

        return Inertia::render('sasaran/sasaranunit/create', [
            'sasaranUnivs' => $sasaranUnivs,
            'units' => $units
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_sasaran_univ' => 'required|exists:sasaran_univ,id_sasaran_univ',
            'id_unit' => 'required|exists:unit,id_unit',
            'nama_dokumen' => 'required|string|max:255',
            'nomor_dokumen' => 'required|string|max:255',
            'tanggal_dokumen' => 'required|date',
            'file_dokumen' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'metadata' => 'nullable|array'
        ], [
            'id_sasaran_univ.required' => 'Sasaran Universitas harus dipilih',
            'id_sasaran_univ.exists' => 'Sasaran Universitas tidak valid',
            'id_unit.required' => 'Unit harus dipilih',
            'id_unit.exists' => 'Unit tidak valid',
            'nama_dokumen.required' => 'Nama dokumen harus diisi',
            'nomor_dokumen.required' => 'Nomor dokumen harus diisi',
            'tanggal_dokumen.required' => 'Tanggal dokumen harus diisi',
            'file_dokumen.required' => 'File dokumen harus diupload',
            'file_dokumen.mimes' => 'File harus berformat PDF, DOC, DOCX, XLS, XLSX, PPT, atau PPTX',
            'file_dokumen.max' => 'Ukuran file maksimal 10MB',
            'unique' => 'Kombinasi Sasaran Universitas dan Unit sudah ada'
        ]);

        // Validasi unique combination
        $exists = SasaranUnit::where('id_sasaran_univ', $validated['id_sasaran_univ'])
                             ->where('id_unit', $validated['id_unit'])
                             ->exists();

        if ($exists) {
            return back()->withErrors([
                'id_unit' => 'Kombinasi Sasaran Universitas dan Unit sudah ada'
            ])->withInput();
        }

        try {
            // Handle file upload
            if ($request->hasFile('file_dokumen')) {
                $file = $request->file('file_dokumen');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('sasaran-unit', $fileName, 'public');
                $validated['file_path'] = $filePath;
            }

            // Remove file_dokumen from validated data as it's not in fillable
            unset($validated['file_dokumen']);

            SasaranUnit::create($validated);

            return redirect()->route('sasaran-unit.index')
                           ->with('success', 'Sasaran Unit berhasil ditambahkan');

        } catch (\Exception $e) {
            Log::error('Gagal menyimpan sasaran unit', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);

            return back()->withErrors([
                'error' => 'Gagal menyimpan data. Silakan coba lagi.'
            ])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SasaranUnit $sasaranUnit)
    {
        $sasaranUnit->load(['sasaranUniv', 'unit']);

        return Inertia::render('sasaran/sasaranunit/show', [
            'sasaranUnit' => $sasaranUnit
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SasaranUnit $sasaranUnit)
    {
        $sasaranUnit->load(['sasaranUniv', 'unit']);
        
        $sasaranUnivs = SasaranUniv::select('id_sasaran_univ', 'kategori', 'nama_dokumen')
                                   ->orderBy('kategori')
                                   ->get();
        
        $units = Unit::active()
                    ->select('id_unit', 'kode_unit', 'nama_unit')
                    ->orderBy('nama_unit')
                    ->get();

        return Inertia::render('sasaran/sasaranunit/edit', [
            'sasaranUnit' => [
                'id_sasaran_unit' => $sasaranUnit->id_sasaran_unit,
                'id_sasaran_univ' => $sasaranUnit->id_sasaran_univ,
                'id_unit' => $sasaranUnit->id_unit,
                'nama_dokumen' => $sasaranUnit->nama_dokumen,
                'nomor_dokumen' => $sasaranUnit->nomor_dokumen,
                'tanggal_dokumen' => $sasaranUnit->tanggal_dokumen?->format('Y-m-d'),
                'file_path' => $sasaranUnit->file_path,
                'metadata' => $sasaranUnit->metadata,
                'sasaran_univ' => $sasaranUnit->sasaranUniv,
                'unit' => $sasaranUnit->unit,
                'created_at' => $sasaranUnit->created_at,
                'updated_at' => $sasaranUnit->updated_at,
            ],
            'sasaranUnivs' => $sasaranUnivs,
            'units' => $units
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SasaranUnit $sasaranUnit)
    {
        $validated = $request->validate([
            'id_sasaran_univ' => 'required|exists:sasaran_univ,id_sasaran_univ',
            'id_unit' => [
                'required',
                'exists:unit,id_unit',
                Rule::unique('sasaran_unit', 'id_unit')
                    ->where('id_sasaran_univ', $request->id_sasaran_univ)
                    ->ignore($sasaranUnit->id_sasaran_unit, 'id_sasaran_unit')
            ],
            'nama_dokumen' => 'required|string|max:255',
            'nomor_dokumen' => 'required|string|max:255',
            'tanggal_dokumen' => 'required|date',
            'file_dokumen' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'metadata' => 'nullable|array'
        ], [
            'id_sasaran_univ.required' => 'Sasaran Universitas harus dipilih',
            'id_sasaran_univ.exists' => 'Sasaran Universitas tidak valid',
            'id_unit.required' => 'Unit harus dipilih',
            'id_unit.exists' => 'Unit tidak valid',
            'id_unit.unique' => 'Kombinasi Sasaran Universitas dan Unit sudah ada',
            'nama_dokumen.required' => 'Nama dokumen harus diisi',
            'nomor_dokumen.required' => 'Nomor dokumen harus diisi',
            'tanggal_dokumen.required' => 'Tanggal dokumen harus diisi',
            'file_dokumen.mimes' => 'File harus berformat PDF, DOC, DOCX, XLS, XLSX, PPT, atau PPTX',
            'file_dokumen.max' => 'Ukuran file maksimal 10MB'
        ]);

        try {
            // Handle file upload
            if ($request->hasFile('file_dokumen')) {
                // Delete old file if exists
                if ($sasaranUnit->file_path && Storage::disk('public')->exists($sasaranUnit->file_path)) {
                    Storage::disk('public')->delete($sasaranUnit->file_path);
                }
                
                $file = $request->file('file_dokumen');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('sasaran-unit', $fileName, 'public');
                $validated['file_path'] = $filePath;
            }

            // Remove file_dokumen from validated data as it's not in fillable
            unset($validated['file_dokumen']);

            $sasaranUnit->update($validated);

            return redirect()->route('sasaran-unit.index')
                           ->with('success', 'Sasaran Unit berhasil diperbarui');

        } catch (\Exception $e) {
            Log::error('Gagal mengupdate sasaran unit', [
                'id' => $sasaranUnit->id_sasaran_unit,
                'error' => $e->getMessage(),
                'data' => $validated
            ]);

            return back()->withErrors([
                'error' => 'Gagal memperbarui data. Silakan coba lagi.'
            ])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SasaranUnit $sasaranUnit)
    {
        try {
            $sasaranUnit->delete();

            return redirect()->route('sasaran-unit.index')
                           ->with('success', 'Sasaran Unit berhasil dihapus');

        } catch (\Exception $e) {
            Log::error('Gagal menghapus sasaran unit', [
                'id' => $sasaranUnit->id_sasaran_unit,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Gagal menghapus data. Silakan coba lagi.');
        }
    }

    /**
     * Update progress for specific sasaran unit
     */
    public function updateProgress(Request $request, SasaranUnit $sasaranUnit)
    {
        $validated = $request->validate([
            'progress_persen' => 'required|numeric|min:0|max:100',
            'capaian_saat_ini' => 'nullable|numeric|min:0',
            'status_pelaksanaan' => 'nullable|in:belum_mulai,sedang_berjalan,selesai,terhenti,ditunda'
        ]);

        // Auto set status based on progress
        if ($validated['progress_persen'] == 0) {
            $validated['status_pelaksanaan'] = 'belum_mulai';
        } elseif ($validated['progress_persen'] == 100) {
            $validated['status_pelaksanaan'] = 'selesai';
        } elseif ($validated['progress_persen'] > 0 && $validated['progress_persen'] < 100) {
            $validated['status_pelaksanaan'] = 'sedang_berjalan';
        }

        try {
            $sasaranUnit->update($validated);

            return response()->json([
                'message' => 'Progress berhasil diperbarui',
                'data' => $sasaranUnit->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Gagal update progress sasaran unit', [
                'id' => $sasaranUnit->id_sasaran_unit,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Gagal memperbarui progress'
            ], 500);
        }
    }

    /**
     * Get statistics for dashboard
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total' => SasaranUnit::count(),
                'belum_mulai' => SasaranUnit::where('status_pelaksanaan', 'belum_mulai')->count(),
                'sedang_berjalan' => SasaranUnit::where('status_pelaksanaan', 'sedang_berjalan')->count(),
                'selesai' => SasaranUnit::where('status_pelaksanaan', 'selesai')->count(),
                'terhenti' => SasaranUnit::where('status_pelaksanaan', 'terhenti')->count(),
                'ditunda' => SasaranUnit::where('status_pelaksanaan', 'ditunda')->count(),
                'rata_rata_progress' => SasaranUnit::avg('progress_persen') ?? 0
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Gagal mengambil statistik sasaran unit', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Gagal mengambil statistik'
            ], 500);
        }
    }
}