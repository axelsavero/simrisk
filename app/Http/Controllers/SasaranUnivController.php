<?php

namespace App\Http\Controllers;

use App\Models\SasaranUniv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'sasaranUniv' => $sasaranUniv
        ]);
    }

    public function update(Request $request, SasaranUniv $sasaranUniv)
    {
        $validated = $request->validate([
            'kategori' => 'required|string|max:255',
            'nama_dokumen' => 'nullable|string|max:255',
            'nomor_dokumen' => 'nullable|string|max:255',
            'tanggal_dokumen' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('file')) {
            if ($sasaranUniv->file_path) {
                Storage::disk('public')->delete($sasaranUniv->file_path);
            }
            
            $filePath = $request->file('file')->store('dokumen-sasaran', 'public');
            $validated['file_path'] = $filePath;
        }

        $sasaranUniv->update($validated);

        return redirect()->route('sasaran-univ.index')
                         ->with('success', 'Data berhasil diperbarui');
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
