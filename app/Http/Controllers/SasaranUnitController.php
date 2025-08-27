<?php
// app/Http/Controllers/SasaranUnitController.php

namespace App\Http\Controllers;

use App\Models\SasaranUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SasaranUnitController extends Controller
{
    public function index()
    {
        $sasaranUnits = SasaranUnit::latest()->paginate(10);

        return Inertia::render('sasaran/sasaranunit/index', [
            'sasaranUnits' => $sasaranUnits,
        ]);
    }

    public function create()
    {
        return Inertia::render('sasaran/sasaranunit/create');
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

        SasaranUnit::create($validated);

        return redirect()->route('sasaran-unit.index')
                         ->with('success', 'Data berhasil ditambahkan');
    }

    public function show(SasaranUnit $sasaranUnit)
    {
        return Inertia::render('sasaran/sasaranunit/show', [
            'sasaranUnit' => $sasaranUnit
        ]);
    }

    public function edit(SasaranUnit $sasaranUnit)
    {
        return Inertia::render('sasaran/sasaranunit/edit', [
            'sasaranUnit' => [
                'id_sasaran_unit' => $sasaranUnit->id_sasaran_unit,
                'kategori' => $sasaranUnit->kategori,
                'nama_dokumen' => $sasaranUnit->nama_dokumen,
                'nomor_dokumen' => $sasaranUnit->nomor_dokumen,
                'tanggal_dokumen' => $sasaranUnit->tanggal_dokumen,
                'file_path' => $sasaranUnit->file_path,
                'created_at' => $sasaranUnit->created_at,
                'updated_at' => $sasaranUnit->updated_at,
            ]
        ]);
    }

    public function update(Request $request, SasaranUnit $sasaranUnit)
    {
        try {
            Log::info('Update method called', [
                'id' => $sasaranUnit->id_sasaran_unit,
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

            if ($request->hasFile('file')) {
                if ($sasaranUnit->file_path && Storage::disk('public')->exists($sasaranUnit->file_path)) {
                    Storage::disk('public')->delete($sasaranUnit->file_path);
                }

                $filePath = $request->file('file')->store('dokumen-sasaran', 'public');
                $validated['file_path'] = $filePath;
            }

            $sasaranUnit->update($validated);

            return redirect()->route('sasaran-unit.index')
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

    public function destroy(SasaranUnit $sasaranUnit)
    {
        if ($sasaranUnit->file_path) {
            Storage::disk('public')->delete($sasaranUnit->file_path);
        }

        $sasaranUnit->delete();

        return redirect()->route('sasaran-unit.index')
                         ->with('success', 'Data berhasil dihapus');
    }
}
