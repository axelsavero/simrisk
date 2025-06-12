<?php

namespace App\Http\Controllers;

use App\Models\SasaranUniv;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class SasaranUnivController extends Controller
{
    // Tampilkan daftar sasaran universitas
    public function index()
    {
        $sasaranUnivs = SasaranUniv::paginate(10);

        return Inertia::render('sasaranuniv/index', [
            'sasaranUnivs' => $sasaranUnivs
        ]);
    }

    // Tampilkan form buat sasaran baru
    public function create()
    {
        return Inertia::render('sasaranuniv/form', [
            'sasaranUniv' => null,
        ]);
    }

    // Simpan sasaran baru
    public function store(Request $request)
    {
        $validated = $request->validate([
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
        ]);

        SasaranUniv::create($validated);

        return Redirect::route('sasaran-univ.index')->with('success', 'Sasaran universitas berhasil dibuat.');
    }

    // Tampilkan detail sasaran
    public function show(SasaranUniv $sasaranUniv)
    {
        return Inertia::render('sasaranuniv/show', [
            'sasaranUniv' => $sasaranUniv
        ]);
    }

    // Tampilkan form edit
    public function edit(SasaranUniv $sasaranUniv)
    {
        return Inertia::render('sasaranuniv/form', [
            'sasaranUniv' => $sasaranUniv,
        ]);
    }

    // Update data sasaran
    public function update(Request $request, SasaranUniv $sasaranUniv)
    {
        $validated = $request->validate([
            'kode_sasaran' => 'required|string|max:20|unique:sasaran_univ,kode_sasaran,' . $sasaranUniv->id_sasaran_univ . ',id_sasaran_univ',
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
        ]);

        $sasaranUniv->update($validated);

        return Redirect::route('sasaran-univ.index')->with('success', 'Sasaran universitas berhasil diperbarui.');
    }

    // Hapus sasaran
    public function destroy(SasaranUniv $sasaranUniv)
    {
        $sasaranUniv->delete();

        return Redirect::route('sasaran-univ.index')->with('success', 'Sasaran universitas berhasil dihapus.');
    }
}
