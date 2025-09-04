<?php
// app/Http/Controllers/SasaranUnitController.php

namespace App\Http\Controllers;

use App\Models\SasaranUnit;
use App\Models\SasaranUniv;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SasaranUnitController extends Controller
{
	public function index()
	{
		$user = auth()->user();
		if (!$user || !$user->hasRole('admin')) {
			return redirect()->route('home');
		}

		$sasaranUnits = SasaranUnit::where('id_unit', $user->unit_id)
			->latest()
			->paginate(10);

		return Inertia::render('sasaran/sasaranunit/index', [
			'sasaranUnits' => $sasaranUnits,
		]);
	}

	public function create()
	{
		$user = auth()->user();
		if (!$user || !$user->hasRole('admin')) {
			return redirect()->route('home');
		}

		$sasaranUnivs = SasaranUniv::orderBy('id_sasaran_univ', 'desc')
			->get(['id_sasaran_univ', 'kategori', 'nama_dokumen']);

		return Inertia::render('sasaran/sasaranunit/create', [
			'sasaranUnivs' => $sasaranUnivs,
		]);
	}


	public function store(Request $request)
	{
		$user = auth()->user();
		if (!$user || !$user->hasRole('admin')) {
			return redirect()->route('home');
		}

		$validated = $request->validate([
			'id_sasaran_univ' => 'required|integer|exists:sasaran_univ,id_sasaran_univ',
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

		// LOGIKA TAMBAHAN: pastikan unit sudah ada di tabel unit
		Unit::firstOrCreate(
			['id_unit' => $user->unit_id],
			['nama_unit' => $user->unit]
		);

		$payload = array_merge($validated, [
			'id_unit' => $user->unit_id,
		]);

		SasaranUnit::create($payload);

		return redirect()->route('sasaran-unit.index')
			->with('success', 'Data berhasil ditambahkan');
	}

	public function show(SasaranUnit $sasaranUnit)
	{
		$user = auth()->user();
		if (!$user || !$user->hasRole('admin')) {
			return redirect()->route('home');
		}

		if ((int) $sasaranUnit->id_unit !== (int) $user->unit_id) {
			return redirect()->route('home');
		}

		return Inertia::render('sasaran/sasaranunit/show', [
			'sasaranUnit' => $sasaranUnit,
		]);
	}

	public function edit(SasaranUnit $sasaranUnit)
	{
		$user = auth()->user();
		if (!$user || !$user->hasRole('admin')) {
			return redirect()->route('home');
		}

		if ((int) $sasaranUnit->id_unit !== (int) $user->unit_id) {
			return redirect()->route('home');
		}

		$sasaranUnivs = SasaranUniv::orderBy('id_sasaran_univ', 'desc')
			->get(['id_sasaran_univ', 'kategori', 'nama_dokumen']);

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
				'id_sasaran_univ' => $sasaranUnit->id_sasaran_univ,
			],
			'sasaranUnivs' => $sasaranUnivs,
		]);
	}

	public function update(Request $request, SasaranUnit $sasaranUnit)
	{
		try {
			$user = auth()->user();
			if (!$user || !$user->hasRole('admin')) {
				return redirect()->route('home');
			}

			if ((int) $sasaranUnit->id_unit !== (int) $user->unit_id) {
				return redirect()->route('home');
			}

			Log::info('Update method called', [
				'id' => $sasaranUnit->id_sasaran_unit,
				'method' => $request->method(),
				'has_file' => $request->hasFile('file'),
				'request_data' => $request->except(['file'])
			]);

			$validated = $request->validate([
				'id_sasaran_univ' => 'required|integer|exists:sasaran_univ,id_sasaran_univ',
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

			$payload = array_merge($validated, [
				'id_unit' => $user->unit_id,
			]);

			$sasaranUnit->update($payload);

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
		$user = auth()->user();
		if (!$user || !$user->hasRole('admin')) {
			return redirect()->route('home');
		}

		if ((int) $sasaranUnit->id_unit !== (int) $user->unit_id) {
			return redirect()->route('home');
		}

		if ($sasaranUnit->file_path) {
			Storage::disk('public')->delete($sasaranUnit->file_path);
		}

		$sasaranUnit->delete();

		return redirect()->route('sasaran-unit.index')
			->with('success', 'Data berhasil dihapus');
	}
}