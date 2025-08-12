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
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\MitigationSubmitted; // Asumsi kita buat ini nanti
use Illuminate\Support\Facades\Log;

class MitigasiController extends Controller
{
    /**
     * Display a listing of mitigasi.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $query = Mitigasi::with(['identifyRisk', 'identifyRisk.user', 'validationProcessor']);
    
        // Filter berdasarkan role
        if ($user->hasRole('super-admin')) {
            // Super admin melihat mitigasi yang sudah submitted atau lebih tinggi
            $query->whereNotIn('validation_status', [Mitigasi::VALIDATION_STATUS_DRAFT]);
        } elseif ($user->hasRole('owner-risk')) {
            // Owner risk hanya bisa melihat mitigasi dari risiko yang mereka buat
            $query->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->hasRole('pimpinan')) {
            // Pimpinan bisa melihat semua mitigasi dari unit kerja mereka
            $query->whereHas('identifyRisk', function ($q) use ($user) {
                $q->where('unit_kerja', $user->unit_kerja);
            });
        }
        // Super admin bisa melihat semua mitigasi

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
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
                      $subQ->where('judul_risiko', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $mitigasis = $query->orderBy('created_at', 'desc')->paginate(10);

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

        // Log::debug('Showing ' . $mitigasis->count() . ' mitigations for user ' . $user->id . ' with role ' . $user->getRoleNames()->first());
        // Get filter options
        $statusOptions = [
            'belum_dimulai' => 'Belum Dimulai',
            'sedang_berjalan' => 'Sedang Berjalan',
            'selesai' => 'Selesai',
            'tertunda' => 'Tertunda',
            'dibatalkan' => 'Dibatalkan'
        ];

        $validationStatusOptions = [
            Mitigasi::VALIDATION_STATUS_DRAFT => 'Draft',
            Mitigasi::VALIDATION_STATUS_SUBMITTED => 'Submitted',
            Mitigasi::VALIDATION_STATUS_PENDING => 'Pending Approval',
            Mitigasi::VALIDATION_STATUS_APPROVED => 'Approved',
            Mitigasi::VALIDATION_STATUS_REJECTED => 'Rejected'
        ];

        $strategiOptions = [
            'menghindari' => 'Menghindari',
            'mengurangi' => 'Mengurangi',
            'mentransfer' => 'Mentransfer',
            'menerima' => 'Menerima'
        ];

        // Get identify risks for filter (based on user role)
        $identifyRisksQuery = IdentifyRisk::query();
        if ($user->hasRole('owner-risk')) {
            $identifyRisksQuery->where('user_id', $user->id);
        } elseif ($user->hasRole('pimpinan')) {
            $identifyRisksQuery->where('unit_kerja', $user->unit_kerja);
        }
        $identifyRisks = $identifyRisksQuery->get();

        return Inertia::render('mitigasi/index', [
            'mitigasis' => $mitigasis,
            'filters' => $request->only(['status', 'validation_status', 'strategi_mitigasi', 'identify_risk_id', 'search']),
            'statusOptions' => $statusOptions,
            'validationStatusOptions' => $validationStatusOptions,
            'strategiOptions' => $strategiOptions,
            'identifyRisks' => $identifyRisks,
        ]);
    }

    /**
     * Show the form for creating a new mitigasi.
     */
    public function create(Request $request): Response
    {
        $user = Auth::user();
        $riskId = $request->get('risk_id');
        $identifyRisk = null;
        
        if ($riskId) {
            $identifyRisk = IdentifyRisk::findOrFail($riskId);
        }

        $identifyRisksQuery = IdentifyRisk::select('id', 'id_identify', 'description')
                                         ->where('validation_status', 'approved');
        
        // Filter berdasarkan role
        if ($user->hasRole('owner-risk')) {
            // Owner risk hanya bisa membuat mitigasi dari risiko yang mereka buat dan sudah approved
            $identifyRisksQuery->where('user_id', $user->id);
        } elseif ($user->hasRole('pimpinan')) {
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
        if ($request->hasFile('bukti_files')) {
            foreach ($request->file('bukti_files') as $file) {
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
                        ->with('success', 'Mitigasi berhasil dibuat.');
    }

    /**
     * Display the specified mitigasi.
     */
    public function show(Mitigasi $mitigasi): Response
    {
        $mitigasi->load(['identifyRisk', 'creator', 'updater']);

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
        
        $identifyRisks = IdentifyRisk::select('id', 'id_identify', 'description')
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
        // Make identify_risk_id not required for update
        $rules['identify_risk_id'] = 'sometimes|exists:identify_risks,id';
        
        $validated = $request->validate($rules);
        
        // Handle file uploads
        $existingFiles = $mitigasi->bukti_implementasi ?? [];
        
        if ($request->hasFile('bukti_files')) {
            foreach ($request->file('bukti_files') as $file) {
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

    /**
     * Remove the specified mitigasi from storage.
     */
    public function destroy(Mitigasi $mitigasi): RedirectResponse
    {
        if (!$mitigasi->canBeDeleted()) {
            return redirect()->back()
                           ->with('error', 'Mitigasi tidak dapat dihapus karena sudah dalam proses atau selesai.');
        }

        // Delete associated files
        if ($mitigasi->bukti_implementasi) {
            foreach ($mitigasi->bukti_implementasi as $file) {
                if (Storage::disk('public')->exists($file['file_path'])) {
                    Storage::disk('public')->delete($file['file_path']);
                }
            }
        }

        $mitigasi->delete();

        return redirect()->route('mitigasi.index')
                        ->with('success', 'Mitigasi berhasil dihapus.');
    }

    /**
     * Submit mitigasi for approval
     */
    public function submit(Mitigasi $mitigasi): RedirectResponse
    {
        // Check permission
        if (!Auth::user()->hasRole('owner-risk') && !Auth::user()->hasRole('super-admin')) {
            abort(403, 'Anda tidak memiliki izin untuk mengirim mitigasi.');
        }

        // Check if mitigasi can be submitted
        if (!$mitigasi->canBeSubmitted()) {
            return redirect()->back()
                           ->with('error', 'Mitigasi ini tidak dapat dikirim karena sudah dalam proses validasi.');
        }

        // Update status to pending
        $mitigasi->update([
            'validation_status' => Mitigasi::VALIDATION_STATUS_PENDING,
        ]);

        // Kirim notifikasi ke SuperAdmins
        $superAdmins = User::role('super-admin')->get();
        foreach ($superAdmins as $admin) {
            Mail::to($admin->email)->send(new MitigationSubmitted($mitigasi));
        }

        return redirect()->route('mitigasi.index')
                        ->with('success', "Mitigasi '{$mitigasi->judul_mitigasi}' berhasil dikirim untuk validasi.");
    }

    /**
     * Approve mitigasi
     */
    public function approve(Request $request, Mitigasi $mitigasi): RedirectResponse
    {
        // Check permission - only super-admin can approve
        if (!Auth::user()->hasRole('super-admin')) {
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
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403, 'Hanya Super Admin yang dapat menolak mitigasi.');
        }

        // Validate rejection reason
        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        // Check current status
        if ($mitigasi->validation_status === Mitigasi::VALIDATION_STATUS_REJECTED) {
            return redirect()->back()
                           ->with('error', 'Mitigasi ini sudah ditolak sebelumnya.');
        }

        // Update status to rejected
        $mitigasi->update([
            'validation_status' => Mitigasi::VALIDATION_STATUS_REJECTED,
            'validation_processed_at' => now(),
            'validation_processed_by' => Auth::id(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return redirect()->route('mitigasi.index')
                        ->with('success', "Mitigasi '{$mitigasi->judul_mitigasi}' berhasil ditolak.");
    }

    /**
     * Update progress of mitigasi.
     */
    public function updateProgress(Request $request, Mitigasi $mitigasi): JsonResponse
    {
        $validated = $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
            'catatan_progress' => 'nullable|string',
        ]);

        $mitigasi->updateProgress(
            $validated['progress_percentage'],
            $validated['catatan_progress'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Progress berhasil diperbarui.',
            'data' => [
                'progress_percentage' => $mitigasi->progress_percentage,
                'status_mitigasi' => $mitigasi->status_mitigasi,
                'status_label' => $mitigasi->status_label,
            ]
        ]);
    }

    /**
     * Download bukti file.
     */
    public function downloadBukti(Mitigasi $mitigasi, Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse|RedirectResponse
    {
        $fileIndex = $request->get('file_index', 0);
        $buktiFiles = $mitigasi->bukti_implementasi ?? [];
        
        if (!isset($buktiFiles[$fileIndex])) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }
        
        $file = $buktiFiles[$fileIndex];
        $filePath = storage_path('app/public/' . $file['file_path']);
        
        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File tidak ditemukan di server.');
        }
        
        return response()->download($filePath, $file['original_name']);
    }

    /**
     * Remove bukti file.
     */
    public function removeBukti(Mitigasi $mitigasi, Request $request): JsonResponse
    {
        $fileIndex = $request->get('file_index');
        $buktiFiles = $mitigasi->bukti_implementasi ?? [];
        
        if (!isset($buktiFiles[$fileIndex])) {
            return response()->json(['success' => false, 'message' => 'File tidak ditemukan.'], 404);
        }
        
        $file = $buktiFiles[$fileIndex];
        
        // Delete file from storage
        if (isset($file['file_path'])) {
            Storage::disk('public')->delete($file['file_path']);
        }
        
        // Remove from array
        unset($buktiFiles[$fileIndex]);
        $buktiFiles = array_values($buktiFiles); // Re-index array
        
        $mitigasi->update([
            'bukti_implementasi' => $buktiFiles,
            'updated_by' => Auth::id(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'File berhasil dihapus.',
            'data' => $buktiFiles
        ]);
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
                                 ->orderBy('created_at', 'desc')
                                 ->get();

        return response()->json($mitigasis);
    }

    /**
     * Check if user can edit mitigasi
     */
    private function canEdit(Mitigasi $mitigasi, $user): bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }

        if ($user->hasRole('owner-risk')) {
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
        if ($user->hasRole('super-admin')) {
            return true;
        }

        if ($user->hasRole('owner-risk')) {
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
        if ($user->hasRole('owner-risk')) {
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
        return $user->hasRole('super-admin') && 
               in_array($mitigasi->validation_status, [Mitigasi::VALIDATION_STATUS_SUBMITTED, Mitigasi::VALIDATION_STATUS_PENDING]);
    }

    /**
     * Check if user can reject mitigasi
     */
    private function canReject(Mitigasi $mitigasi, $user): bool
    {
        return $user->hasRole('super-admin') && 
               in_array($mitigasi->validation_status, [Mitigasi::VALIDATION_STATUS_SUBMITTED, Mitigasi::VALIDATION_STATUS_PENDING]);
    }
}