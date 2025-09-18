<?php

namespace App\Http\Controllers;

use App\Models\Mitigasi;
use App\Models\IdentifyRisk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\MitigationSubmitted;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class MitigasiController extends Controller
{
    private const VALIDATION_STATUS_DRAFT = 'draft';
    private const VALIDATION_STATUS_PENDING = 'pending';
    private const VALIDATION_STATUS_SUBMITTED = 'submitted';
    private const VALIDATION_STATUS_APPROVED = 'approved';
    private const VALIDATION_STATUS_REJECTED = 'rejected';

    /**
     * Check if user has specific role
     */
    protected function hasRole($user, $role): bool
    {
        if (!$user) {
            return false;
        }

        // Ensure roles are loaded
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        if (!$user->roles) {
            return false;
        }

        // If roles is a Collection, convert it to array
        $roles = $user->roles instanceof \Illuminate\Support\Collection
            ? $user->roles->pluck('name')->toArray()
            : (is_array($user->roles) ? $user->roles : []);

        return in_array($role, $roles);
    }

    /**
     * Check if user is admin
     */
    protected function isAdmin($user): bool
    {
        return $this->hasRole($user, 'admin');
    }

    /**
     * Check if user is super admin
     */
    protected function isSuperAdmin($user): bool
    {
        return $this->hasRole($user, 'super-admin');
    }

    /**
     * Check if user is owner risk
     */
    protected function isOwnerRisk($user): bool
    {
        return $this->hasRole($user, 'owner-risk');
    }

    /**
     * Check if user is pimpinan
     */
    protected function isPimpinan($user): bool
    {
        return $this->hasRole($user, 'pimpinan');
    }

    /**
     * Display a listing of mitigasi.
     */
    public function index(Request $request): Response
    {
        // Ensure user and roles are loaded
        $user = Auth::user();
        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        $query = Mitigasi::with(['identifyRisk', 'identifyRisk.user', 'validationProcessor']);

        // Terapkan aturan akses generik
        if ($this->isOwnerRisk($user)) {
            // Owner Risk melihat semua mitigasi miliknya, termasuk draft.
            $query->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } else {
            // Role lain (Super Admin, Admin, Pimpinan) hanya melihat yang BUKAN draft.
            $query->where('validation_status', '!=', self::VALIDATION_STATUS_DRAFT);
            
            // Batasi view untuk Admin dan Pimpinan berdasarkan unit kerja
            if ($this->isAdmin($user) || $this->isPimpinan($user)) {
                $query->whereHas('identifyRisk', function ($q) use ($user) {
                    $q->where('unit_kerja', $user->unit_kerja);
                });
            }
        }

        // Filter berdasarkan status
        if ($request->filled('status_mitigasi')) { // <--- BENAR
            $query->where('status_mitigasi', $request->status_mitigasi);
        }

        // Filter berdasarkan validation status
        if ($request->filled('validation_status')) {
            $query->where('validation_status', $request->validation_status);
        }

        // Filter berdasarkan strategi mitigasi
        if ($request->filled('strategi_mitigasi')) {
            $query->where('strategi_mitigasi', $request->strategi_mitigasi);
        }

        // Filter berdasarkan ID risiko
        if ($request->filled('identify_risk_id')) {
            $query->where('identify_risk_id', $request->identify_risk_id);
        }

        // Search functionality
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('judul_mitigasi', 'like', "%{$searchTerm}%")
                    ->orWhere('deskripsi_mitigasi', 'like', "%{$searchTerm}%")
                    ->orWhere('strategi_mitigasi', 'like', "%{$searchTerm}%")
                    ->orWhereHas('identifyRisk', function ($subQ) use ($searchTerm) {
                        $subQ->where('description', 'like', "%{$searchTerm}%"); // Changed from judul_risiko to description
                    });
            });
        }

        $mitigasis = $query->orderBy('created_at', 'asc')->paginate(10);

        // Add permissions to each mitigasi
        $mitigasis->getCollection()->transform(function ($mitigasi) use ($user) {
            $mitigasi->permissions = [
                'canEdit' => $this->canEdit($mitigasi, $user),
                'canDelete' => $this->canDelete($mitigasi, $user),
                'canSubmit' => $this->canSubmit($mitigasi, $user),
                'canApprove' => $this->canApprove($mitigasi, $user),
                'canReject' => $this->canReject($mitigasi, $user),
            ];
            return $mitigasi;
        });

        // Use model methods for consistency
        $statusOptions = Mitigasi::getStatusOptions();
        $validationStatusOptions = Mitigasi::getValidationStatusOptions();
        $strategiOptions = Mitigasi::getStrategiOptions();

        // Get identify risks for filter (based on user role)
        $identifyRisksQuery = IdentifyRisk::select('id', 'id_identify', 'description');
        if ($this->isAdmin($user)) {
            $identifyRisksQuery->where('unit_kerja', $user->unit_kerja);
        } elseif ($this->isOwnerRisk($user)) {
            $identifyRisksQuery->where('user_id', $user->id);
        }
        $identifyRisks = $identifyRisksQuery->get();

        return Inertia::render('mitigasi/index', [
            'mitigasis' => $mitigasis,
            'filters' => $request->only(['status_mitigasi', 'validation_status', 'strategi_mitigasi', 'identify_risk_id', 'search']),
            'statusOptions' => $statusOptions,
            'validationStatusOptions' => $validationStatusOptions,
            'strategiOptions' => $strategiOptions,
        ]);
    }
    
    /**
     * Display dashboard with risk matrix and mitigation data.
     */
    public function dashboard(Request $request): Response
    {
        $user = Auth::user();

        // --- MITIGASI DATA FOR MATRIX ---
        $mitigasiQuery = Mitigasi::query()->with('identifyRisk')
            ->where('validation_status', self::VALIDATION_STATUS_APPROVED);

        // Apply role-based filtering
        if ($this->isOwnerRisk($user)) {
            $mitigasiQuery->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($this->isAdmin($user) || $this->isPimpinan($user)) {
            $mitigasiQuery->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('unit_kerja', $user->unit_kerja);
            });
        }
        
        // Apply dashboard filters
        if ($request->filled('unit')) {
             $mitigasiQuery->whereHas('identifyRisk', function ($q) use ($request) {
                $q->where('unit_kerja', $request->unit);
            });
        }
        if ($request->filled('kategori')) {
            $mitigasiQuery->whereHas('identifyRisk', function ($q) use ($request) {
                $q->where('risk_category', $request->kategori);
            });
        }
        if ($request->filled('tahun')) {
            $mitigasiQuery->whereYear('created_at', $request->tahun);
        }
        
        $mitigasis = $mitigasiQuery->get();

        $mitigasiPoints = $mitigasis->map(function ($mitigasi) {
            $level = ($mitigasi->probability ?: 1) * ($mitigasi->impact ?: 1);
            $levelText = 'Sangat Rendah';
            if ($level >= 20) $levelText = 'Tinggi';
            elseif ($level >= 9) $levelText = 'Sedang';
            elseif ($level >= 3) $levelText = 'Rendah';

            return [
                'id' => $mitigasi->id,
                'x' => $mitigasi->probability,
                'y' => $mitigasi->impact,
                'label' => $mitigasi->identifyRisk->id_identify ?? 'N/A',
                'judul_mitigasi' => $mitigasi->judul_mitigasi,
                'kode_risiko' => $mitigasi->identifyRisk->id_identify ?? 'N/A',
                'nama_risiko' => $mitigasi->identifyRisk->description ?? 'N/A',
                'strategi_mitigasi' => $mitigasi->strategi_mitigasi,
                'status_mitigasi' => $mitigasi->status_mitigasi,
                'progress_percentage' => $mitigasi->progress_percentage,
                'pic_mitigasi' => $mitigasi->pic_mitigasi,
                'target_selesai' => $mitigasi->target_selesai ? $mitigasi->target_selesai->toDateString() : null,
                'unit_kerja' => $mitigasi->identifyRisk->unit_kerja ?? 'N/A',
                'level' => $level,
                'level_text' => $levelText,
            ];
        });

        $statusStats = $mitigasis->countBy('status_mitigasi');
        $strategiStats = $mitigasis->countBy('strategi_mitigasi');
        $totalMitigasi = $mitigasis->count();
        $completedCount = $statusStats->get(Mitigasi::STATUS_SELESAI, 0);

        $mitigasiMatrixData = [
            'mitigasiPoints' => $mitigasiPoints,
            'totalMitigasi' => $totalMitigasi,
            'statusStats' => $statusStats,
            'strategiStats' => $strategiStats,
            'completionRate' => $totalMitigasi > 0 ? round(($completedCount / $totalMitigasi) * 100) : 0,
            'averageProgress' => round($mitigasis->avg('progress_percentage') ?? 0),
        ];

        return Inertia::render('dashboard/index', [
            'mitigasiMatrixData' => $mitigasiMatrixData,
            // You may need to add riskMatrixData and filterOptions here as well
            // 'riskMatrixData' => ... ,
            // 'filterOptions' => ... ,
            'filters' => $request->only(['unit', 'kategori', 'tahun']),
        ]);
    }

    /**
     * Show the form for creating a new mitigasi.
     */
    public function create(Request $request): Response
    {
        $user = Auth::user();
        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        $riskId = $request->get('risk_id');
        $identifyRisk = null;

        if ($riskId) {
            $identifyRisk = IdentifyRisk::findOrFail($riskId);
        }
        
        // 🔥 PERUBAHAN: Sekarang mengambil semua field yang dibutuhkan
        $identifyRisksQuery = IdentifyRisk::select('id', 'id_identify', 'description', 'probability', 'impact')
            ->where('validation_status', 'approved');

        // Filter berdasarkan role
        if ($this->isOwnerRisk($user)) {
            // Owner risk hanya bisa membuat mitigasi dari risiko yang mereka buat dan sudah approved
            $identifyRisksQuery->where('user_id', $user->id);
        } elseif ($this->isPimpinan($user)) {
            // Pimpinan bisa membuat mitigasi dari risiko di unit kerja mereka yang sudah approved
            $identifyRisksQuery->where('unit_kerja', $user->unit_kerja);
        }
        // Super admin bisa membuat mitigasi dari semua risiko yang sudah approved

        $identifyRisks = $identifyRisksQuery->orderBy('id_identify')->get();

        return Inertia::render('mitigasi/form', [
            'identifyRisks' => $identifyRisks,
            'selectedRisk' => $identifyRisk,
            'statusOptions' => Mitigasi::getStatusOptions(),
            'strategiOptions' => Mitigasi::getStrategiOptions(),
        ]);
    }


    /**
     * Store a newly created mitigasi in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(Mitigasi::getValidationRules());

        // Handle file uploads
        $buktiFiles = [];
        if ($request->hasFile('bukti_implementasi')) {
            foreach ($request->file('bukti_implementasi') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('mitigasi-bukti', $fileName, 'public');

                $buktiFiles[] = [
                    'original_name' => $file->getClientOriginalName(),
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'file_extension' => strtolower($file->getClientOriginalExtension()),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }

        $validated['bukti_implementasi'] = $buktiFiles;
        $validated['created_by'] = Auth::id();
        $validated['updated_by'] = Auth::id();
        $validated['validation_status'] = Mitigasi::VALIDATION_STATUS_DRAFT;

        $mitigasi = Mitigasi::create($validated);

        return redirect()->route('mitigasi.show', $mitigasi)
            ->with('success', 'Mitigasi berhasil dibuat sebagai draft.');
    }


    /**
     * Display the specified mitigasi.
     */
    public function show(Mitigasi $mitigasi): Response
    {
        $user = Auth::user();
        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        // Authorization logic remains the same
        if ($this->isSuperAdmin($user) || $this->isPimpinan($user)) {
            // Full access
        } elseif ($this->isOwnerRisk($user)) {
            if ($mitigasi->identifyRisk->user_id !== $user->id) {
                abort(403, 'Unauthorized');
            }
        } elseif ($this->isAdmin($user)) {
            if ($mitigasi->identifyRisk->unit_kerja !== $user->unit_kerja) {
                abort(403, 'Unauthorized');
            }
        } else {
            abort(403, 'Unauthorized');
        }

        $mitigasi->load(['identifyRisk', 'creator', 'updater']);

        // The 'probability' and 'impact' fields are already part of the $mitigasi model object
        // because we added them to the database and the $fillable array.
        // No extra action is needed here to pass them to the view.

        return Inertia::render('mitigasi/show', [
            'mitigasi' => $mitigasi,
            'statusOptions' => Mitigasi::getStatusOptions(),
            'strategiOptions' => Mitigasi::getStrategiOptions(),
        ]);
    }


    /**
     * Show the form for editing the specified mitigasi.
     */
    public function edit(Mitigasi $mitigasi): Response
    {
        $mitigasi->load('identifyRisk');

        // 🔥 PERUBAHAN: Juga mengambil probability dan impact untuk auto-fill jika risiko diubah
        $identifyRisks = IdentifyRisk::select('id', 'id_identify', 'description', 'probability', 'impact')
            ->where('validation_status', 'approved')
            ->orderBy('id_identify')
            ->get();

        return Inertia::render('mitigasi/form', [
            'mitigasi' => $mitigasi,
            'identifyRisks' => $identifyRisks,
            'statusOptions' => Mitigasi::getStatusOptions(),
            'strategiOptions' => Mitigasi::getStrategiOptions(),
        ]);
    }

    /**
     * Update the specified mitigasi in storage.
     */
    public function update(Request $request, Mitigasi $mitigasi): RedirectResponse
    {
        $rules = Mitigasi::getValidationRules();
        
        $validated = $request->validate($rules);

        // Handle file uploads
        $existingFiles = $mitigasi->bukti_implementasi ?? [];

        if ($request->hasFile('bukti_implementasi')) {
            foreach ($request->file('bukti_implementasi') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('mitigasi-bukti', $fileName, 'public');

                $existingFiles[] = [
                    'original_name' => $file->getClientOriginalName(),
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'file_extension' => strtolower($file->getClientOriginalExtension()),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }

        $validated['bukti_implementasi'] = $existingFiles;
        $validated['updated_by'] = Auth::id();

        $mitigasi->update($validated);

        return redirect()->route('mitigasi.show', $mitigasi)
            ->with('success', 'Mitigasi berhasil diperbarui.');
    }

    // ... (sisa controller tidak berubah)

    /**
     * Remove the specified mitigasi from storage.
     */
    public function destroy(Mitigasi $mitigasi): RedirectResponse
    {
        try {
            $user = Auth::user();
            if ($user && !$user->relationLoaded('roles')) {
                $user->load('roles');
            }

            // Check if user has permission to delete
            if (!$this->canDelete($mitigasi, $user)) {
                return redirect()->back()
                    ->with('error', 'Anda tidak memiliki izin untuk menghapus mitigasi ini.');
            }

            // Check if mitigasi can be deleted based on its status
            if ($mitigasi->validation_status !== self::VALIDATION_STATUS_DRAFT) {
                return redirect()->back()
                    ->with('error', 'Mitigasi tidak dapat dihapus karena sudah dalam proses validasi atau telah disetujui.');
            }

            // Delete associated files
            if ($mitigasi->bukti_implementasi) {
                foreach ($mitigasi->bukti_implementasi as $file) {
                    if (isset($file['file_path']) && Storage::disk('public')->exists($file['file_path'])) {
                        Storage::disk('public')->delete($file['file_path']);
                    }
                }
            }

            // Delete the mitigasi
            $mitigasi->delete();

            return redirect()->route('mitigasi.index')
                ->with('success', 'Mitigasi berhasil dihapus.');
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error deleting mitigasi: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus mitigasi. Silakan coba lagi.');
        }
    }

    /**
     * Submit mitigasi for approval
     */
    public function submit(Mitigasi $mitigasi): RedirectResponse
    {
        // Check permission
        $user = Auth::user();
        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        if (!$this->isOwnerRisk($user) && !$this->isSuperAdmin($user)) {
            abort(403, 'Anda tidak memiliki izin untuk mengirim mitigasi.');
        }

        // Check if mitigasi can be submitted
        if (!$mitigasi->canBeSubmitted()) {
            return redirect()->back()
                ->with('error', 'Mitigasi ini tidak dapat dikirim karena sudah dalam proses validasi.');
        }

        // Update status to pending and clear rejection reason if exists
        $mitigasi->update([
            'validation_status' => Mitigasi::VALIDATION_STATUS_PENDING,
            'rejection_reason' => null
        ]);

        return redirect()->route('mitigasi.index')
            ->with('success', "Mitigasi '{$mitigasi->judul_mitigasi}' berhasil dikirim untuk validasi.");
    }

    /**
     * Approve mitigasi
     */
    public function approve(Request $request, Mitigasi $mitigasi): RedirectResponse
    {
        // Check permission - only super-admin can approve
        $user = Auth::user();
        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        if (!$this->isSuperAdmin($user)) {
            abort(403, 'Hanya Super Admin yang dapat menyetujui mitigasi.');
        }

        // Check current status
        if ($mitigasi->validation_status === Mitigasi::VALIDATION_STATUS_APPROVED) {
            return redirect()->back()
                ->with('error', 'Mitigasi ini sudah disetujui sebelumnya.');
        }

        // Update status to approved
        $mitigasi->update([
            'validation_status' => Mitigasi::VALIDATION_STATUS_APPROVED,
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => null, // Clear rejection reason
        ]);

        return redirect()->route('mitigasi.index')
            ->with('success', "Mitigasi '{$mitigasi->judul_mitigasi}' berhasil disetujui.");
    }

    /**
     * Reject mitigasi
     */
    public function reject(Request $request, Mitigasi $mitigasi): RedirectResponse
    {
        // Check permission - only super-admin can reject
        $user = Auth::user();
        if ($user && !$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        if (!$this->isSuperAdmin($user)) {
            abort(403, 'Hanya Super Admin yang dapat menolak mitigasi.');
        }

        // Validate rejection reason
        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        // Check current status
        if ($mitigasi->validation_status === Mitigasi::VALIDATION_STATUS_REJECTED) {
            return redirect()->back()
                ->with('error', 'Mitigasi ini sudah direvisi sebelumnya.');
        }

        // Update status to rejected
        $mitigasi->update([
            'validation_status' => Mitigasi::VALIDATION_STATUS_REJECTED,
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return redirect()->route('mitigasi.index')
            ->with('success', "Mitigasi '{$mitigasi->judul_mitigasi}' berhasil direvisi.");
    }

    /**
     * Update progress of mitigasi.
     */
    public function updateProgress(Request $request, Mitigasi $mitigasi): RedirectResponse
    {
        $validated = $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
            'catatan_progress' => 'nullable|string',
        ]);

        $mitigasi->updateProgress(
            $validated['progress_percentage'],
            $validated['catatan_progress'] ?? null
        );

        return redirect()->back();
    }

    /**
     * Download bukti file.
     */
    public function downloadBukti(Mitigasi $mitigasi, $filename): \Symfony\Component\HttpFoundation\BinaryFileResponse|RedirectResponse
    {
        $buktiFiles = $mitigasi->bukti_implementasi ?? [];

        $fileData = collect($buktiFiles)->first(function ($file) use ($filename) {
            return $file['file_name'] === $filename || $file['original_name'] === $filename;
        });

        if (!$fileData) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        $filePath = storage_path('app/public/' . $fileData['file_path']);

        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File tidak ditemukan di server.');
        }

        return response()->download($filePath, $fileData['original_name']);
    }

    /**
     * Remove bukti file.
     */
    public function removeBukti(Mitigasi $mitigasi, $filename): RedirectResponse
    {
        $buktiFiles = $mitigasi->bukti_implementasi ?? [];

        $fileIndex = collect($buktiFiles)->search(function ($file) use ($filename) {
            return $file['file_name'] === $filename || $file['original_name'] === $filename;
        });

        if ($fileIndex === false) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        $file = $buktiFiles[$fileIndex];

        // Delete file from storage
        if (isset($file['file_path'])) {
            Storage::disk('public')->delete($file['file_path']);
        }

        // Remove from array
        array_splice($buktiFiles, $fileIndex, 1);

        $mitigasi->update([
            'bukti_implementasi' => $buktiFiles,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'File berhasil dihapus.');
    }


    /**
     * Get mitigasi statistics for dashboard.
     */
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'total' => Mitigasi::count(),
            'by_status' => Mitigasi::selectRaw('status_mitigasi, COUNT(*) as count')
                ->groupBy('status_mitigasi')
                ->pluck('count', 'status_mitigasi')
                ->toArray(),
            'by_strategi' => Mitigasi::selectRaw('strategi_mitigasi, COUNT(*) as count')
                ->groupBy('strategi_mitigasi')
                ->pluck('count', 'strategi_mitigasi')
                ->toArray(),
            'overdue' => Mitigasi::overdue()->count(),
            'upcoming' => Mitigasi::upcoming()->count(),
            'avg_progress' => Mitigasi::where('status_mitigasi', '!=', 'dibatalkan')
                ->avg('progress_percentage') ?? 0,
        ];

        return response()->json($stats);
    }

    /**
     * Get mitigasi by risk ID.
     */
    public function getByRisk(IdentifyRisk $identifyRisk): JsonResponse
    {
        $mitigasis = $identifyRisk->mitigasis()
            ->with(['creator', 'updater'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($mitigasis);
    }

    /**
     * Check if user can edit mitigasi
     */
    private function canEdit(Mitigasi $mitigasi, $user): bool
    {
        // Safety check - ensure user exists and has roles loaded
        if (!$user || !$user->relationLoaded('roles')) {
            return false;
        }

        // FIX: Change $user->hasRole to $this->hasRole to use controller's custom method
        if ($this->hasRole($user, 'super-admin')) {
            return true;
        }

        // FIX: Same for owner-risk
        if ($this->hasRole($user, 'owner-risk')) {
            return $mitigasi->identifyRisk->user_id === $user->id &&
                in_array($mitigasi->validation_status, [Mitigasi::VALIDATION_STATUS_DRAFT, Mitigasi::VALIDATION_STATUS_REJECTED]);
        }

        return false;
    }

    /**
     * Check if user can delete mitigasi
     */
    private function canDelete(Mitigasi $mitigasi, $user): bool
    {
        // Safety check - ensure user exists and has roles loaded
        if (!$user || !$user->relationLoaded('roles')) {
            return false;
        }

        // FIX: Change $user->hasRole to $this->hasRole
        if ($this->hasRole($user, 'super-admin')) {
            return true;
        }

        // FIX: Same for owner-risk
        if ($this->hasRole($user, 'owner-risk')) {
            return $mitigasi->identifyRisk->user_id === $user->id &&
                $mitigasi->validation_status === Mitigasi::VALIDATION_STATUS_DRAFT;
        }

        return false;
    }

    /**
     * Check if user can submit mitigasi
     */
    private function canSubmit(Mitigasi $mitigasi, $user): bool
    {
        // Safety check - ensure user exists and has roles loaded
        if (!$user || !$user->relationLoaded('roles')) {
            return false;
        }

        // FIX: Change $user->hasRole to $this->hasRole
        if ($this->hasRole($user, 'owner-risk')) {
            return $mitigasi->identifyRisk->user_id === $user->id &&
                in_array($mitigasi->validation_status, [Mitigasi::VALIDATION_STATUS_DRAFT, Mitigasi::VALIDATION_STATUS_REJECTED]);
        }

        return false;
    }

    /**
     * Check if user can approve mitigasi
     */
    private function canApprove(Mitigasi $mitigasi, $user): bool
    {
        // Safety check - ensure user exists and has roles loaded
        if (!$user || !$user->relationLoaded('roles')) {
            return false;
        }

        // FIX: Change $user->hasRole to $this->hasRole
        return $this->hasRole($user, 'super-admin') &&
            in_array($mitigasi->validation_status, [Mitigasi::VALIDATION_STATUS_SUBMITTED, Mitigasi::VALIDATION_STATUS_PENDING]);
    }

    /**
     * Check if user can reject mitigasi
     */
    private function canReject(Mitigasi $mitigasi, $user): bool
    {
        // Safety check - ensure user exists and has roles loaded
        if (!$user || !$user->relationLoaded('roles')) {
            return false;
        }

        // FIX: Change $user->hasRole to $this->hasRole
        return $this->hasRole($user, 'super-admin') &&
            in_array($mitigasi->validation_status, [Mitigasi::VALIDATION_STATUS_SUBMITTED, Mitigasi::VALIDATION_STATUS_PENDING]);
    }
}