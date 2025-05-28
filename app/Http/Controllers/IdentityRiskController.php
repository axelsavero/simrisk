<?php

namespace App\Http\Controllers;

use App\Models\IdentityRisk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class IdentityRiskController extends Controller
{
    public function __construct()
    {
        // Middleware untuk hak akses, sesuaikan dengan peran yang berhak.
        // Misalnya, hanya 'super-admin' atau 'risk-manager'
        /*
        $this->middleware(function ($request, $next) {
            if (!Auth::check() || (!Auth::user()->hasRole('super-admin') && !Auth::user()->hasRole('admin'))) {
                 abort(403, 'AKSES DITOLAK: Anda tidak memiliki izin untuk fitur ini.');
            }
            return $next($request);
        })->except(['index']); // 'index' mungkin bisa dilihat lebih banyak peran
        */
    }

    public function index()
    {
        $identityRisks = IdentityRisk::latest()->paginate(10)->through(fn ($risk) => [
            'id' => $risk->id,
            'id_identity' => $risk->id_identity,
            'status' => $risk->status,
            'risk_category' => $risk->risk_category,
            'identification_date_start' => $risk->identification_date_start->format('Y-m-d'),
            'identification_date_end' => $risk->identification_date_end->format('Y-m-d'),
            'description' => $risk->description,
            'probability' => $risk->probability,
            'impact' => $risk->impact,
            'level' => $risk->level,
        ]);

        return Inertia::render('identityrisk/index', [
            'identityRisks' => $identityRisks,
        ]);
    }

    public function create()
    {
        return Inertia::render('identityrisk/form', [
            'identityRisk' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_identity' => 'required|string|unique:identity_risks,id_identity|max:255',
            'status' => 'required|boolean',
            'risk_category' => 'required|string|max:255',
            'identification_date_start' => 'required|date',
            'identification_date_end' => 'required|date|after_or_equal:identification_date_start',
            'description' => 'required|string',
            'probability' => 'required|integer|min:1|max:5', // Asumsi skala
            'impact' => 'required|integer|min:1|max:5',      // Asumsi skala
        ]);

        $validated['level'] = (int)$validated['probability'] * (int)$validated['impact'];

        IdentityRisk::create($validated);

        return Redirect::route('identity-risk.index')->with('success', 'Identifikasi Risiko berhasil dibuat.');
    }

    public function edit(IdentityRisk $identityRisk)
    {
        return Inertia::render('identityrisk/form', [
            'identityRisk' => [
                'id' => $identityRisk->id,
                'id_identity' => $identityRisk->id_identity,
                'status' => $identityRisk->status,
                'risk_category' => $identityRisk->risk_category,
                'identification_date_start' => $identityRisk->identification_date_start->format('Y-m-d'),
                'identification_date_end' => $identityRisk->identification_date_end->format('Y-m-d'),
                'description' => $identityRisk->description,
                'probability' => $identityRisk->probability,
                'impact' => $identityRisk->impact,
                'level' => $identityRisk->level,
            ],
        ]);
    }

    public function update(Request $request, IdentityRisk $identityRisk)
    {
        $validated = $request->validate([
            'id_identity' => ['required', 'string', 'max:255', Rule::unique('identity_risks')->ignore($identityRisk->id)],
            'status' => 'required|boolean',
            'risk_category' => 'required|string|max:255',
            'identification_date_start' => 'required|date',
            'identification_date_end' => 'required|date|after_or_equal:identification_date_start',
            'description' => 'required|string',
            'probability' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
        ]);

        $validated['level'] = (int)$validated['probability'] * (int)$validated['impact'];
        
        $identityRisk->update($validated);

        return Redirect::route('identity-risk.index')->with('success', 'Identifikasi Risiko berhasil diperbarui.');
    }

    public function destroy(IdentityRisk $identityRisk)
    {
        // TODO: Tambahkan logika untuk menghapus data terkait (penyebab, penanganan, dampak_kualitatif)
        // jika tidak menggunakan ON DELETE CASCADE di foreign key constraint database.
        // Atau, jika menggunakan SoftDeletes, panggil $identityRisk->forceDelete() jika diperlukan.
        $identityRisk->delete();
        return Redirect::route('identity-risk.index')->with('success', 'Identifikasi Risiko berhasil dihapus.');
    }
}