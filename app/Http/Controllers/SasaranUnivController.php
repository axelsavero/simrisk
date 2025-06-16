<?php

namespace App\Http\Controllers;

use App\Models\SasaranUniv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SasaranUnivController extends Controller
{
    public function index()
    {
        $sasaranUnivs = SasaranUniv::latest()->paginate(10);

        return Inertia::render('sasaran/sasaranuniv/index', [
            'sasaranUnivs' => $sasaranUnivs,
        ]);
    }

    public function create()
    {
        return Inertia::render('sasaran/sasaranuniv/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'required|string|max:255',
            'nama_dokumen' => 'nullable|string|max:255',
            'nomor_dokumen' => 'nullable|string|max:255',
            'tanggal_dokumen' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('dokumen-sasaran', 'public');
            $validated['file_path'] = $filePath;
        }

        SasaranUniv::create($validated);

        return redirect()->route('sasaran-univ.index')
                         ->with('success', 'Data berhasil ditambahkan');
    }

    public function show(SasaranUniv $sasaranUniv)
    {
        return Inertia::render('sasaran/sasaranuniv/show', [
            'sasaranUniv' => $sasaranUniv
        ]);
    }

    public function edit(SasaranUniv $sasaranUniv)
    {
        
        return Inertia::render('sasaran/sasaranuniv/edit', [
            'sasaranUniv' => [
                'id_sasaran_univ' => $sasaranUniv->id_sasaran_univ,
                'kategori' => $sasaranUniv->kategori,
                'nama_dokumen' => $sasaranUniv->nama_dokumen,
                'nomor_dokumen' => $sasaranUniv->nomor_dokumen,
                'tanggal_dokumen' => $sasaranUniv->tanggal_dokumen,
                'file_path' => $sasaranUniv->file_path,
                'created_at' => $sasaranUniv->created_at,
                'updated_at' => $sasaranUniv->updated_at,
            ]
        ]);
    }

   public function update(Request $request, SasaranUniv $sasaranUniv)
    {
        try {
            // 🔥 Laravel otomatis handle _method spoofing
            Log::info('Update method called', [
                'id' => $sasaranUniv->id_sasaran_univ,
                'method' => $request->method(),
                'has_file' => $request->hasFile('file'),
                'request_data' => $request->except(['file'])
            ]);

            $validated = $request->validate([
                'kategori' => 'required|string|max:255',
                'nama_dokumen' => 'nullable|string|max:255',
                'nomor_dokumen' => 'nullable|string|max:255',
                'tanggal_dokumen' => 'nullable|date',
                'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240',
            ]);

            // Handle file upload
            if ($request->hasFile('file')) {
                if ($sasaranUniv->file_path && Storage::disk('public')->exists($sasaranUniv->file_path)) {
                    Storage::disk('public')->delete($sasaranUniv->file_path);
                }
                
                $filePath = $request->file('file')->store('dokumen-sasaran', 'public');
                $validated['file_path'] = $filePath;
            }

            $sasaranUniv->update($validated);

            return redirect()->route('sasaran-univ.index')
                            ->with('success', 'Data berhasil diperbarui');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Update failed', ['error' => $e->getMessage()]);
            
            return redirect()->back()
                            ->withInput()
                            ->with('error', 'Gagal memperbarui data: ' . $e->getMessage());
        }
    }


    public function destroy(SasaranUniv $sasaranUniv)
    {
        if ($sasaranUniv->file_path) {
            Storage::disk('public')->delete($sasaranUniv->file_path);
        }

        $sasaranUniv->delete();

        return redirect()->route('sasaran-univ.index')
                         ->with('success', 'Data berhasil dihapus');
    }
}
