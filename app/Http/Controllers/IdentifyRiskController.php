<?php

namespace App\Http\Controllers;

use App\Models\IdentifyRisk;
use App\Models\Penyebab;
use App\Models\DampakKualitatif;
use App\Models\PenangananRisiko;
use App\Models\Mitigasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IdentifyRiskController extends Controller
{
    public function __construct()
    {
        // Middleware untuk hak akses sesuai preferensi kontrol akses yang tepat
        /*
        $this->middleware(function ($request, $next) {
            if (!Auth::check() || (!Auth::user()->hasRole('super-admin') && !Auth::user()->hasRole('owner-risk'))) {
                 abort(403, 'AKSES DITOLAK: Anda tidak memiliki izin untuk fitur ini.');
            }
            return $next($request);
        })->except(['index']);
        */
    }

    public function index()
    {
        $query = IdentifyRisk::with(['penyebab', 'dampakKualitatif', 'penangananRisiko'])->oldest('id');

        // Terapkan scope akses data
        $query = $this->applyRoleScope($query, [
            'userColumn' => 'user_id',
            'unitColumn' => null,
            'unitViaUser' => true,
            'userRelation' => 'user',
        ])->where('is_active', true);

        $paginatedRisks = $query->paginate(10);

        $identifyRisks = $paginatedRisks->through(function ($risk, $key) use ($paginatedRisks) {
            return [
                'no' => $paginatedRisks->firstItem() + $key,
                'id' => $risk->id,
                'id_identify' => $risk->id_identify,
                'status' => $risk->status,
                'is_active' => $risk->is_active,
                'risk_category' => $risk->risk_category,
                'identification_date_start' => $risk->identification_date_start->format('Y-m-d'),
                'identification_date_end' => $risk->identification_date_end->format('Y-m-d'),
                'description' => $risk->description,
                'nama_risiko' => $risk->nama_risiko,
                'jabatan_risiko' => $risk->jabatan_risiko,
                'no_kontak' => $risk->no_kontak,
                'strategi' => $risk->strategi,
                'pengendalian_internal' => $risk->pengendalian_internal,
                'biaya_penangan' => $risk->biaya_penangan,
                'probability' => $risk->probability,
                'impact' => $risk->impact,
                'level' => $risk->level,
                'validation_status' => $risk->validation_status,
                'validation_processed_at' => $risk->validation_processed_at ? $risk->validation_processed_at->format('Y-m-d H:i') : null,
                'rejection_reason' => $risk->rejection_reason,

                // Status flags
                'can_be_submitted' => $risk->canBeSubmitted(),
                'can_be_edited' => $risk->canBeEdited(),
                'is_draft' => $risk->isDraft(),

                // Relationships
                'penyebab' => $risk->penyebab->map(fn($p) => ['id' => $p->id, 'description' => $p->description])->toArray(),
                'dampak_kualitatif' => $risk->dampakKualitatif->map(fn($d) => ['id' => $d->id, 'description' => $d->description])->toArray(),
                'penanganan_risiko' => $risk->penangananRisiko->map(fn($pr) => ['id' => $pr->id, 'description' => $pr->description])->toArray(),
            ];
        });

        return Inertia::render('identifyrisk/index', [
            'identifyRisks' => $identifyRisks,
            'permissions' => [
                'canCreate' => Auth::user()->hasAnyRole(['super-admin', 'owner-risk']),
                'canEdit' => Auth::user()->hasAnyRole(['super-admin', 'owner-risk']),
                'canDelete' => Auth::user()->hasAnyRole(['super-admin', 'owner-risk']),
                'canSubmit' => Auth::user()->hasRole('owner-risk'),
                'canValidate' => Auth::user()->hasRole('super-admin'),
                'canApprove' => Auth::user()->hasRole('super-admin'),
                'canReject' => Auth::user()->hasRole('super-admin'),
            ],
            'userRole' => Auth::user()->getRoleNames(),
        ]);
    }

    public function create()
    {
        return Inertia::render('identifyrisk/form', [
            'identifyRisk' => null,
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input dengan field yang konsisten
        $validated = $request->validate([
            'id_identify' => 'required|string|unique:identify_risks,id_identify|max:255',
            'is_active' => 'required|boolean',
            'risk_category' => 'required|string|max:255',
            'identification_date_start' => 'required|date',
            'identification_date_end' => 'required|date|after_or_equal:identification_date_start',
            'description' => 'required|string',
            'nama_risiko' => 'required|string|max:255',
            'jabatan_risiko' => 'required|string|max:255',
            'no_kontak' => 'required|string|max:255',
            'strategi' => 'required|string|max:255',
            'pengendalian_internal' => 'required|string|max:255',
            'biaya_penangan' => 'nullable|numeric|min:0',
            'probability' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
            'penyebab' => 'required|array|min:1',
            'penyebab.*.description' => 'required|string|max:1000',
            'dampak_kualitatif' => 'required|array|min:1',
            'dampak_kualitatif.*.description' => 'required|string|max:1000',
            'penanganan_risiko' => 'required|array|min:1',
            'penanganan_risiko.*.description' => 'required|string|max:1000',
            'bukti_risiko_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240',
            'bukti_risiko_nama' => 'nullable|string|max:255',
            'unit_kerja' => 'nullable|string|max:255',
            'kategori_risiko' => 'nullable|string|max:255',
            'tahun' => 'nullable|integer|min:2020|max:' . (date('Y') + 5),
            'probability_residual' => 'nullable|integer|min:1|max:5',
            'impact_residual' => 'nullable|integer|min:1|max:5',
        ]);

        // Calculate risk level
        $validated['level'] = (int)$validated['probability'] * (int)$validated['impact'];

        // Set status berdasarkan role dengan logic yang tepat
        if (Auth::user()->hasRole('owner-risk')) {
            $validated['validation_status'] = IdentifyRisk::STATUS_DRAFT; // Draft untuk owner-risk
        } else {
            $validated['validation_status'] = IdentifyRisk::STATUS_SUBMITTED; // Langsung submitted untuk super-admin
        }

        // Pisahkan data untuk relationships
        $penyebabData = $validated['penyebab'] ?? [];
        $dampakData = $validated['dampak_kualitatif'] ?? [];
        $penangananData = $validated['penanganan_risiko'] ?? [];

        // Data untuk tabel utama
        $identifyRiskData = collect($validated)->except([
            'penyebab', 'dampak_kualitatif', 'penanganan_risiko',
            'bukti_risiko_file', 'bukti_risiko_nama'
        ])->toArray();

        // Tambahkan user_id
        $identifyRiskData['user_id'] = Auth::id();

        // Buat IdentifyRisk
        $identifyRisk = IdentifyRisk::create($identifyRiskData);

        // Buat relationships
        if (!empty($penyebabData)) {
            $identifyRisk->penyebab()->createMany($penyebabData);
        }

        if (!empty($dampakData)) {
            $identifyRisk->dampakKualitatif()->createMany($dampakData);
        }

        if (!empty($penangananData)) {
            $identifyRisk->penangananRisiko()->createMany($penangananData);
        }

        if ($request->hasFile('bukti_risiko_file')) {
            try {
                $file = $request->file('bukti_risiko_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('bukti-risiko', $fileName, 'public');

                $buktiFileData = [
                    'nama_bukti' => $validated['bukti_risiko_nama'] ?? $file->getClientOriginalName(),
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'file_extension' => strtolower($file->getClientOriginalExtension()),
                    'uploaded_by' => Auth::user()->name ?? 'System',
                    'uploaded_at' => now()->toDateTimeString(),
                ];

                // Update bukti_files JSON column
                $identifyRisk->update(['bukti_files' => [$buktiFileData]]);

            } catch (\Exception $e) {
                // Handle error dan cleanup
                if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }

                return Redirect::back()
                    ->withInput()
                    ->with('error', 'Gagal mengupload bukti: ' . $e->getMessage());
            }
        }

        // Message sesuai role dan status
        $message = Auth::user()->hasRole('owner-risk')
            ? 'Risiko berhasil disimpan sebagai draft. Klik "Kirim" untuk mengirim ke validator.'
            : 'Identifikasi Risiko berhasil dibuat dan menunggu validasi.';

        return Redirect::route('identify-risk.index')->with('success', $message);
    }

    public function show(IdentifyRisk $identifyRisk)
    {
        // Load semua relationships untuk detail view
        $identifyRisk->load(['penyebab', 'dampakKualitatif', 'penangananRisiko', 'validationProcessor']);

        return Inertia::render('identifyrisk/show', [
            'identifyRisk' => [
                'id' => $identifyRisk->id,
                'id_identify' => $identifyRisk->id_identify,
                'is_active' => $identifyRisk->is_active,
                'risk_category' => $identifyRisk->risk_category,
                'identification_date_start' => $identifyRisk->identification_date_start->format('Y-m-d'),
                'identification_date_end' => $identifyRisk->identification_date_end->format('Y-m-d'),
                'description' => $identifyRisk->description,
                'nama_risiko' => $identifyRisk->nama_risiko,
                'jabatan_risiko' => $identifyRisk->jabatan_risiko,
                'no_kontak' => $identifyRisk->no_kontak,
                'strategi' => $identifyRisk->strategi,
                'pengendalian_internal' => $identifyRisk->pengendalian_internal,
                'biaya_penangan' => $identifyRisk->biaya_penangan,
                'probability' => $identifyRisk->probability,
                'impact' => $identifyRisk->impact,
                'level' => $identifyRisk->level,
                'validation_status' => $identifyRisk->validation_status,
                'validation_processed_at' => $identifyRisk->validation_processed_at?->format('Y-m-d H:i'),
                'rejection_reason' => $identifyRisk->rejection_reason,
                'created_at' => $identifyRisk->created_at->format('Y-m-d H:i'),
                'updated_at' => $identifyRisk->updated_at->format('Y-m-d H:i'),

                'bukti_files' => $identifyRisk->bukti_files ?? [],

                // Status flags
                'can_be_submitted' => $identifyRisk->canBeSubmitted(),
                'can_be_edited' => $identifyRisk->canBeEdited(),
                'is_draft' => $identifyRisk->isDraft(),

                // Validation processor info
                'validation_processor' => $identifyRisk->validationProcessor ? [
                    'id' => $identifyRisk->validationProcessor->id,
                    'name' => $identifyRisk->validationProcessor->name,
                ] : null,

                // Relationships
                'penyebab' => $identifyRisk->penyebab->map(fn($p) => [
                    'id' => $p->id,
                    'description' => $p->description
                ])->toArray(),
                'dampak_kualitatif' => $identifyRisk->dampakKualitatif->map(fn($d) => [
                    'id' => $d->id,
                    'description' => $d->description
                ])->toArray(),
                'penanganan_risiko' => $identifyRisk->penangananRisiko->map(fn($pr) => [
                    'id' => $pr->id,
                    'description' => $pr->description
                ])->toArray(),
            ],
        ]);
    }

    public function edit(IdentifyRisk $identifyRisk)
    {
        // Load semua relationships
        $identifyRisk->load(['penyebab', 'dampakKualitatif', 'penangananRisiko']);

        return Inertia::render('identifyrisk/form', [
            'identifyRisk' => [
                'id' => $identifyRisk->id,
                'id_identify' => $identifyRisk->id_identify,
                'is_active' => $identifyRisk->is_active,
                'risk_category' => $identifyRisk->risk_category,
                'identification_date_start' => $identifyRisk->identification_date_start->format('Y-m-d'),
                'identification_date_end' => $identifyRisk->identification_date_end->format('Y-m-d'),
                'description' => $identifyRisk->description,
                'nama_risiko' => $identifyRisk->nama_risiko,
                'jabatan_risiko' => $identifyRisk->jabatan_risiko,
                'no_kontak' => $identifyRisk->no_kontak,
                'strategi' => $identifyRisk->strategi,
                'pengendalian_internal' => $identifyRisk->pengendalian_internal,
                'biaya_penangan' => $identifyRisk->biaya_penangan,
                'probability' => $identifyRisk->probability,
                'impact' => $identifyRisk->impact,
                'level' => $identifyRisk->level,
                'validation_status' => $identifyRisk->validation_status,

                // Status flags untuk edit form
                'can_be_submitted' => $identifyRisk->canBeSubmitted(),
                'can_be_edited' => $identifyRisk->canBeEdited(),
                'is_draft' => $identifyRisk->isDraft(),

                // Relationships data untuk form
                'penyebab' => $identifyRisk->penyebab->map(fn($p) => [
                    'description' => $p->description
                ])->toArray() ?: [['description' => '']],
                'dampak_kualitatif' => $identifyRisk->dampakKualitatif->map(fn($d) => [
                    'description' => $d->description
                ])->toArray() ?: [['description' => '']],
                'penanganan_risiko' => $identifyRisk->penangananRisiko->map(fn($pr) => [
                    'description' => $pr->description
                ])->toArray() ?: [['description' => '']],
            ],
        ]);
    }

    public function update(Request $request, IdentifyRisk $identifyRisk)
    {
        if (!$identifyRisk->canBeEdited()) {
            return Redirect::back()->with('error', 'Risiko ini tidak dapat diedit karena statusnya.');
        }

        DB::beginTransaction();
        try {
            // Validasi untuk update
            $validated = $request->validate([
                'id_identify' => ['required', 'string', 'max:255', Rule::unique('identify_risks', 'id_identify')->ignore($identifyRisk->id)],
                'is_active' => 'required|boolean',
                'risk_category' => 'required|string|max:255',
                'identification_date_start' => 'required|date',
                'identification_date_end' => 'required|date|after_or_equal:identification_date_start',
                'description' => 'required|string',
                'nama_risiko' => 'required|string|max:255',
                'jabatan_risiko' => 'required|string|max:255',
                'no_kontak' => 'required|string|max:255',
                'strategi' => 'required|string|max:255',
                'pengendalian_internal' => 'required|string|max:255',
                'biaya_penangan' => 'required|numeric|min:0',
                'probability' => 'required|integer|min:1|max:5',
                'impact' => 'required|integer|min:1|max:5',
                'penyebab' => 'required|array|min:1',
                'penyebab.*.description' => 'required|string|max:1000',
                'dampak_kualitatif' => 'required|array|min:1',
                'dampak_kualitatif.*.description' => 'required|string|max:1000',
                'penanganan_risiko' => 'required|array|min:1',
                'penanganan_risiko.*.description' => 'required|string|max:1000',
                'bukti_risiko_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240',
                'bukti_risiko_nama' => 'nullable|string|max:255',
                'unit_kerja' => 'nullable|string|max:255',
                'kategori_risiko' => 'nullable|string|max:255',
                'tahun' => 'nullable|integer|min:2020|max:' . (date('Y') + 5),
                'probability_residual' => 'nullable|integer|min:1|max:5',
                'impact_residual' => 'nullable|integer|min:1|max:5',
            ]);

            // Recalculate level
            $validated['level'] = (int)$validated['probability'] * (int)$validated['impact'];

            // Pisahkan data relationships
            $penyebabData = $validated['penyebab'] ?? [];
            $dampakData = $validated['dampak_kualitatif'] ?? [];
            $penangananData = $validated['penanganan_risiko'] ?? [];

            // Data untuk update main record
            $identifyRiskData = collect($validated)->except([
                'penyebab', 'dampak_kualitatif', 'penanganan_risiko',
                'bukti_risiko_file', 'bukti_risiko_nama'
            ])->toArray();

            // Update main record
            $identifyRisk->update($identifyRiskData);

            //  Handle file upload di update
            if ($request->hasFile('bukti_risiko_file')) {
                try {
                    $file = $request->file('bukti_risiko_file');
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('bukti-risiko', $fileName, 'public');

                    $buktiFileData = [
                        'nama_bukti' => $validated['bukti_risiko_nama'] ?? $file->getClientOriginalName(),
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $filePath,
                        'file_size' => $file->getSize(),
                        'file_extension' => strtolower($file->getClientOriginalExtension()),
                        'uploaded_by' => Auth::user()->name ?? 'System',
                        'uploaded_at' => now()->toDateTimeString(),
                    ];

                    // Append ke existing bukti files atau buat baru
                    $existingBukti = $identifyRisk->bukti_files ?? [];
                    $existingBukti[] = $buktiFileData;
                    $identifyRisk->update(['bukti_files' => $existingBukti]);

                } catch (\Exception $e) {
                    DB::rollBack();
                    return Redirect::back()
                        ->withInput()
                        ->with('error', 'Gagal mengupload bukti: ' . $e->getMessage());
                }
            }

            // if ($validated['probability_residual'] && $validated['impact_residual']) {
            // $validated['level_residual'] = (int)$validated['probability_residual'] * (int)$validated['impact_residual'];
            //  }

            // Update relationships - hapus lama, buat baru
            $identifyRisk->penyebab()->delete();
            $identifyRisk->dampakKualitatif()->delete();
            $identifyRisk->penangananRisiko()->delete();

            // Buat relationships baru
            if (!empty($penyebabData)) {
                $identifyRisk->penyebab()->createMany($penyebabData);
            }

            if (!empty($dampakData)) {
                $identifyRisk->dampakKualitatif()->createMany($dampakData);
            }

            if (!empty($penangananData)) {
                $identifyRisk->penangananRisiko()->createMany($penangananData);
            }

            DB::commit();
            return Redirect::route('identify-risk.index')
                ->with('success', 'Identifikasi Risiko berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()
                ->withInput()
                ->with('error', 'Gagal memperbarui risiko: ' . $e->getMessage());
        }
    }

    public function destroy(IdentifyRisk $identifyRisk)
    {
        // Cek apakah bisa dihapus (hanya draft)
        if (!$identifyRisk->canBeDeleted()) {
            return Redirect::route('identify-risk.index')
                ->with('error', 'Hanya risiko dengan status draft yang dapat dihapus.');
        }

        //  Hapus file bukti jika ada
        if ($identifyRisk->bukti_files) {
            foreach ($identifyRisk->bukti_files as $bukti) {
                if (Storage::disk('public')->exists($bukti['file_path'])) {
                    Storage::disk('public')->delete($bukti['file_path']);
                }
            }
        }

        // Soft delete with cascade relationships
        $identifyRisk->delete();

        return Redirect::route('identify-risk.index')
            ->with('success', 'Identifikasi Risiko berhasil dihapus.');
    }

    // Method submit untuk workflow draft → submitted/pending
    public function submit(IdentifyRisk $identifyRisk)
    {
        // Cek permission sesuai kontrol akses yang tepat
        if (!Auth::user()->hasRole('owner-risk') && !Auth::user()->hasRole('super-admin')) {
            abort(403, 'Anda tidak memiliki izin untuk mengirim risiko.');
        }

        // Cek apakah risiko bisa dikirim (draft atau rejected)
        if (!$identifyRisk->canBeSubmitted()) {
            return Redirect::route('identify-risk.index')
                ->with('error', 'Risiko ini tidak dapat dikirim karena sudah dalam proses validasi.');
        }

        // Update status menjadi pending dan bersihkan rejection jika ada
        $identifyRisk->update([
            'validation_status' => IdentifyRisk::STATUS_PENDING,
            'validation_processed_at' => null,
            'validation_processed_by' => null,
            'rejection_reason' => null,
        ]);

        return Redirect::route('identify-risk.index')
            ->with('success', "Risiko '{$identifyRisk->id_identify}' berhasil dikirim untuk validasi.");
    }

    public function approve(Request $request, IdentifyRisk $identifyRisk)
    {
        // Cek permission super-admin
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403, 'Hanya Super Admin yang dapat menyetujui risiko.');
        }

        // Cek status saat ini
        if ($identifyRisk->validation_status === IdentifyRisk::STATUS_APPROVED) {
            return Redirect::route('identify-risk.index')
                ->with('error', 'Risiko ini sudah disetujui sebelumnya.');
        }

        // Update status ke approved
        $identifyRisk->update([
            'validation_status' => IdentifyRisk::STATUS_APPROVED,
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => null, // Clear rejection reason
        ]);

        // Buat draft mitigasi otomatis
        Mitigasi::create([
            'identify_risk_id' => $identifyRisk->id,
            'judul_mitigasi' => 'Draft Mitigasi untuk ' . $identifyRisk->id_identify,
            'deskripsi_mitigasi' => 'Silakan isi deskripsi mitigasi untuk risiko ini',
            'strategi_mitigasi' => 'reduce',
            'pic_mitigasi' => $identifyRisk->user?->name ?? 'Owner Risk',
            'target_selesai' => now()->addMonths(3)->format('Y-m-d'),
            'status_mitigasi' => 'belum_dimulai',
            'validation_status' => Mitigasi::VALIDATION_STATUS_DRAFT,
        ]);

        return Redirect::route('identify-risk.index')
            ->with('success', "Risiko '{$identifyRisk->id_identify}' berhasil disetujui dan draft mitigasi telah dibuat.");
    }

    public function reject(Request $request, IdentifyRisk $identifyRisk)
    {
        // Cek permission super-admin
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403, 'Hanya Super Admin yang dapat menolak risiko.');
        }

        // Validasi alasan penolakan
        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        // Cek status saat ini
        // if ($identifyRisk->validation_status === IdentifyRisk::STATUS_REJECTED) {
        //     return Redirect::route('identify-risk.index')
        //         ->with('error', 'Risiko ini sudah ditolak sebelumnya.');
        // }

        // Update status ke rejected
        $identifyRisk->update([
            'validation_status' => IdentifyRisk::STATUS_REJECTED,
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return Redirect::route('identify-risk.index')
            ->with('success', "Risiko '{$identifyRisk->id_identify}' berhasil ditolak.");
    }

    //  Download bukti method
    public function downloadBukti(IdentifyRisk $identifyRisk)
    {
        $buktiFiles = $identifyRisk->bukti_files ?? [];

        if (empty($buktiFiles)) {
            abort(404, 'Tidak ada bukti file yang ditemukan');
        }

        // Jika hanya ada satu file, download langsung
        if (count($buktiFiles) === 1) {
            $bukti = $buktiFiles[0];

            if (!Storage::disk('public')->exists($bukti['file_path'])) {
                abort(404, 'File tidak ditemukan');
            }

            return Storage::disk('public')->download(
                $bukti['file_path'],
                $bukti['file_name']
            );
        }

        // Jika lebih dari satu file, download file pertama saja (untuk sekarang)
        $bukti = $buktiFiles[0];

        if (!Storage::disk('public')->exists($bukti['file_path'])) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $bukti['file_path'],
            $bukti['file_name']
        );
    }

    // Method untuk export/report
    public function export()
    {
        // Implementasi export Excel/PDF
        return response()->download(storage_path('app/exports/identify-risks.xlsx'));
    }

    // Method untuk statistics/dashboard
    public function statistics()
    {
        $stats = IdentifyRisk::getCountByStatus();
        $distribution = IdentifyRisk::getRiskDistributionByCategory();

        return response()->json([
            'status_counts' => $stats,
            'category_distribution' => $distribution,
        ]);
    }
}