<?php

namespace App\Http\Controllers;

use App\Models\IdentityRisk;
use App\Models\Penyebab;
use App\Models\DampakKualitatif;
use App\Models\PenangananRisiko;
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
        // hanya 'super-admin' atau 'risk-manager'
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
        $query = IdentityRisk::with(['penyebab', 'dampakKualitatif', 'penangananRisiko'])->latest(); 

        $user = Auth::user();
        
        // 🔥 PERBAIKAN: Gunakan nama role yang konsisten
        if ($user->hasRole('super-admin')) {
            // Super admin melihat semua data
        } elseif ($user->hasAnyRole(['risk-manager', 'owner-risk'])) { // Konsisten dengan seeder
            // Risk manager/owner melihat data sesuai preferensi status[2]
            $query = $query->where('status', true);
        } elseif ($user->hasRole('pimpinan')) {
            // Pimpinan melihat data yang sudah approved
            $query = $query->approved()->where('status', true);
        } else {
            // User lain hanya melihat yang sudah approved dan aktif
            $query = $query->approved()->where('status', true);
        }

        $identityRisks = $query->paginate(10)->through(fn ($risk) => [
            'id' => $risk->id,
            'id_identity' => $risk->id_identity,
            'status' => $risk->status,
            'risk_category' => $risk->risk_category,
            'identification_date_start' => $risk->identification_date_start->format('Y-m-d'),
            'identification_date_end' => $risk->identification_date_end->format('Y-m-d'),
            'description' => $risk->description,
            'nama_risiko' => $risk->nama_risiko,
            'jabatan_risiko' => $risk->jabatan_risiko,
            'no_kontak' => $risk->no_kontak,
            'strategi' => $risk->strategi,
            'pengendalian_internal' => $risk->pengendalian_internal,
            'biaya_penangan' => $risk->biaya_penangan, // 🔥 TAMBAH FIELD INI
            'probability' => $risk->probability,
            'impact' => $risk->impact,
            'level' => $risk->level,
            'validation_status' => $risk->validation_status, 
            'validation_processed_at' => $risk->validation_processed_at ? $risk->validation_processed_at->format('Y-m-d H:i') : null, 
            'rejection_reason' => $risk->rejection_reason,
            'penyebab' => $risk->penyebab->map(fn($p) => [
                'id' => $p->id,
                'description' => $p->description
            ])->toArray(),
            'dampak_kualitatif' => $risk->dampakKualitatif->map(fn($d) => [
                'id' => $d->id,
                'description' => $d->description
            ])->toArray(),
            'penanganan_risiko' => $risk->penangananRisiko->map(fn($pr) => [
                'id' => $pr->id,
                'description' => $pr->description
            ])->toArray(),
        ]);

                $canManage = $user->hasRole('super-admin') || 
                $user->hasRole('risk-manager') || 
                $user->hasRole('owner-risk');

        return Inertia::render('identityrisk/index', [
            'identityRisks' => $identityRisks,
            'canValidate' => $user->canValidateRisks(),
            'canManage' => $user->canManageRisks(),
            'userRole' => $user->getRoleNames(),
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
            'nama_risiko' => 'nullable|string|max:255',
            'jabatan_risiko' => 'nullable|string|max:255',
            'no_kontak' => 'nullable|string|max:255',
            'strategi' => 'nullable|string|max:255',
            'pengendalian_internal' => 'nullable|string|max:255',
            'biaya_penangan' => 'nullable|numeric|min:0',
            'probability' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
            'penyebab' => 'required|array|min:1',
            'penyebab.*.description' => 'required|string|max:1000',
            'dampak_kualitatif' => 'required|array|min:1', 
            'dampak_kualitatif.*.description' => 'required|string|max:1000',
            'penanganan_risiko' => 'required|array|min:1',
            'penanganan_risiko.*.description' => 'required|string|max:1000',
        ]);

        $validated['level'] = (int)$validated['probability'] * (int)$validated['impact'];
        $validated['validation_status'] = 'pending';

        $penyebabData = $validated['penyebab'] ?? [];
        $dampakData = $validated['dampak_kualitatif'] ?? [];
        $penangananData = $validated['penanganan_risiko'] ?? [];

        $identityRiskData = collect($validated)->except(['penyebab', 'dampak_kualitatif', 'penanganan_risiko'])->toArray();

        // Buat IdentityRisk dulu
        $identityRisk = IdentityRisk::create($identityRiskData);

        // Lalu buat semua relasi
        if (!empty($penyebabData)) {
            $identityRisk->penyebab()->createMany($penyebabData);
        }

        if (!empty($dampakData)) {
            $identityRisk->dampakKualitatif()->createMany($dampakData);
        }

        if (!empty($penangananData)) {
            $identityRisk->penangananRisiko()->createMany($penangananData);
        }

        return Redirect::route('identity-risk.index')
            ->with('success', 'Identifikasi Risiko berhasil dibuat dan menunggu validasi.');
    }

    public function edit(IdentityRisk $identityRisk)
    {
        $identityRisk->load(['penyebab', 'dampakKualitatif', 'penangananRisiko']);

        return Inertia::render('identityrisk/form', [
            'identityRisk' => [
                'id' => $identityRisk->id,
                'id_identity' => $identityRisk->id_identity,
                'status' => $identityRisk->status,
                'risk_category' => $identityRisk->risk_category,
                'identification_date_start' => $identityRisk->identification_date_start->format('Y-m-d'),
                'identification_date_end' => $identityRisk->identification_date_end->format('Y-m-d'),
                'description' => $identityRisk->description,
                'nama_risiko' => $identityRisk->nama_risiko,
                'jabatan_risiko' => $identityRisk->jabatan_risiko,
                'no_kontak' => $identityRisk->no_kontak,
                'strategi' => $identityRisk->strategi,
                'pengendalian_internal' => $identityRisk->pengendalian_internal,
                'biaya_penangan' => $identityRisk->biaya_penangan,
                'probability' => $identityRisk->probability,
                'impact' => $identityRisk->impact,
                'level' => $identityRisk->level,
                'penyebab' => $identityRisk->penyebab->map(fn($p) => [
                    'description' => $p->description
                ])->toArray() ?: [['description' => '']],
                'dampak_kualitatif' => $identityRisk->dampakKualitatif->map(fn($d) => [
                    'description' => $d->description
                ])->toArray() ?: [['description' => '']],
                'penanganan_risiko' => $identityRisk->penangananRisiko->map(fn($pr) => [
                    'description' => $pr->description
                ])->toArray() ?: [['description' => '']],
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
            'nama_risiko' => 'nullable|string|max:255',
            'jabatan_risiko' => 'nullable|string|max:255',
            'no_kontak' => 'nullable|string|max:255',
            'strategi' => 'nullable|string|max:255',
            'pengendalian_internal' => 'nullable|string|max:255',
            'biaya_penangan' => 'nullable|numeric|min:0',
            'probability' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
            'penyebab' => 'required|array|min:1',
            'penyebab.*.description' => 'required|string|max:1000',
            'dampak_kualitatif' => 'required|array|min:1', 
            'dampak_kualitatif.*.description' => 'required|string|max:1000',
            'penanganan_risiko' => 'required|array|min:1',
            'penanganan_risiko.*.description' => 'required|string|max:1000',
        ]);

        $validated['level'] = (int)$validated['probability'] * (int)$validated['impact'];

        
        $penyebabData = $validated['penyebab'] ?? [];
        $dampakData = $validated['dampak_kualitatif'] ?? [];
        $penangananData = $validated['penanganan_risiko'] ?? [];

        $identityRiskData = collect($validated)->except(['penyebab', 'dampak_kualitatif', 'penanganan_risiko'])->toArray();

        // Update data IdentityRisk
        $identityRisk->update($identityRiskData);

        
        $identityRisk->penyebab()->delete();
        $identityRisk->dampakKualitatif()->delete();
        $identityRisk->penangananRisiko()->delete();
        
        // Buat relasi baru
        if (!empty($penyebabData)) {
            $identityRisk->penyebab()->createMany($penyebabData);
        }

        if (!empty($dampakData)) {
            $identityRisk->dampakKualitatif()->createMany($dampakData);
        }

        if (!empty($penangananData)) {
            $identityRisk->penangananRisiko()->createMany($penangananData);
        }

        return Redirect::route('identity-risk.index')
            ->with('success', 'Identifikasi Risiko berhasil diperbarui.');
    }

    public function destroy(IdentityRisk $identityRisk)
    {
        $identityRisk->delete(); // Cascade delete akan menghapus semua relasi
        
        return Redirect::route('identity-risk.index')
            ->with('success', 'Identifikasi Risiko berhasil dihapus.');
    }

    public function approve(Request $request, IdentityRisk $identityRisk)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403, 'Hanya Super Admin yang dapat menyetujui risiko.');
        }

        if ($identityRisk->validation_status === 'approved') {
            return Redirect::route('identity-risk.index')
                ->with('error', 'Risiko ini sudah disetujui sebelumnya.');
        }

        $identityRisk->update([
            'validation_status' => 'approved',
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => null,
        ]);

        return Redirect::route('identity-risk.index')
            ->with('success', "Risiko '{$identityRisk->id_identity}' berhasil disetujui.");
    }

    public function reject(Request $request, IdentityRisk $identityRisk)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403, 'Hanya Super Admin yang dapat menolak risiko.');
        }

        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        if ($identityRisk->validation_status === 'rejected') {
            return Redirect::route('identity-risk.index')
                ->with('error', 'Risiko ini sudah ditolak sebelumnya.');
        }
        
        if ($identityRisk->validation_status === 'approved') {
            return Redirect::route('identity-risk.index')
                ->with('error', 'Risiko yang sudah disetujui tidak bisa ditolak lagi dengan cara ini.');
        }

        $identityRisk->update([
            'validation_status' => 'rejected',
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return Redirect::route('identity-risk.index')
            ->with('success', "Risiko '{$identityRisk->id_identity}' berhasil ditolak.");
    }
}
