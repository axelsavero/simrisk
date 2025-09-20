<?php

namespace App\Models;

use App\Models\User;
use App\Models\Penyebab;
use App\Models\DampakKualitatif;
use App\Models\PenangananRisiko;
use App\Models\Mitigasi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IdentifyRisk extends Model
{
    use HasFactory, SoftDeletes;

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'id_identify',
        'is_active',
        'risk_category',
        'identification_date_start',
        'identification_date_end',
        'description',
        'nama_risiko',
        'jabatan_risiko',
        'no_kontak',
        'strategi',
        'pengendalian_internal',
        'biaya_penangan',
        'probability',
        'impact',
        'level',
        'validation_status',
        'validation_processed_by',
        'validation_processed_at',
        'rejection_reason',
        'bukti_files',
        'unit_kerja',
        'kategori_risiko',
        'tahun',
        'probability_residual',
        'impact_residual',
        'level_residual',
        'status_mitigasi',
        'pemilik_risiko',
        'rencana_mitigasi',
        'target_mitigasi',
        'created_by',
        'user_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'identification_date_start' => 'date',
        'identification_date_end' => 'date',
        'probability' => 'integer',
        'impact' => 'integer',
        'level' => 'integer',
        'probability_residual' => 'integer',
        'impact_residual' => 'integer',
        'level_residual' => 'integer',
        'validation_processed_at' => 'datetime',
        'target_mitigasi' => 'date',
        'deleted_at' => 'datetime',
        'biaya_penangan' => 'decimal:2',
        'bukti_files' => 'array',
    ];

    // RELATIONSHIPS
    public function penyebab(): HasMany
    {
        return $this->hasMany(Penyebab::class, 'identify_risk_id');
    }

    public function dampakKualitatif(): HasMany
    {
        return $this->hasMany(DampakKualitatif::class, 'identify_risk_id');
    }

    public function penangananRisiko(): HasMany
    {
        return $this->hasMany(PenangananRisiko::class, 'identify_risk_id');
    }

    public function mitigasis(): HasMany
    {
        return $this->hasMany(Mitigasi::class, 'identify_risk_id');
    }

    public function validationProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validation_processed_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // SCOPES FOR VALIDATION STATUS

    /**
     * Scope untuk risiko draft
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('validation_status', self::STATUS_DRAFT);
    }

    /**
     * Scope untuk risiko yang sudah dikirim (submitted/pending)
     * Include both submitted dan pending
     */
    public function scopeSubmitted(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * Scope untuk risiko menunggu validasi
     * Unified scope untuk pending (include submitted)
     */
    public function scopePendingValidation(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * New scope - Awaiting Validation (alias untuk pendingValidation)
     */
    public function scopeAwaitingValidation(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * New scope - In Process (for super admin to see all non-draft)
     */
    public function scopeInProcess(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [
            self::STATUS_SUBMITTED,
            self::STATUS_PENDING,
            self::STATUS_APPROVED,
            self::STATUS_REJECTED
        ]);
    }

    /**
     * Scope untuk risiko yang disetujui
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('validation_status', self::STATUS_APPROVED);
    }

    /**
     * Scope untuk risiko yang ditolak
     */
    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('validation_status', self::STATUS_REJECTED);
    }

    /**
     * Scope untuk risiko aktif
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * New scope - By Status (flexible status filtering)
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        // Handle 'pending' to include both submitted and pending
        if ($status === 'pending') {
            return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
        }

        return $query->where('validation_status', $status);
    }

    /**
     * New scope - For Dashboard Stats
     */
    public function scopeForStats(Builder $query): Builder
    {
        return $query->select('validation_status')
                     ->selectRaw('
                         CASE
                             WHEN validation_status IN ("submitted", "pending") THEN "pending"
                             ELSE validation_status
                         END as display_status
                     ');
    }

    // SCOPES FOR DASHBOARD FILTERING

    /**
     * Filter by status mitigasi
     */
    public function scopeByStatusMitigasi(Builder $query, ?string $status): Builder
    {
        if ($status) {
            return $query->where('status_mitigasi', $status);
        }
        return $query;
    }

    /**
     * Filter by unit kerja
     */
    public function scopeByUnit(Builder $query, ?string $unit): Builder
    {
        if ($unit) {
            return $query->where('unit_kerja', $unit);
        }
        return $query;
    }

    /**
     * Filter by kategori risiko
     */
    public function scopeByKategori(Builder $query, ?string $kategori): Builder
    {
        if ($kategori) {
            return $query->where('risk_category', $kategori);
        }
        return $query;  
    }

    /**
     * Filter by tahun
     */
    public function scopeByTahun(Builder $query, ?string $tahun): Builder
    {
        if ($tahun) {
            return $query->where('tahun', $tahun);
        }
        return $query;
    }

    /**
     * Filter by risk level range
     */
    public function scopeByRiskLevel(Builder $query, string $level): Builder
    {
    return match($level) {
        'high' => $query->where('level', '>=', 17),           // 17-25
        'medium' => $query->whereBetween('level', [9, 16]),   // 9-16
        'low' => $query->whereBetween('level', [3, 8]),       // 3-8
        'very_low' => $query->whereBetween('level', [1, 2]),  // 1-2
        default => $query
    };
    }

    // STATUS CHECK METHODS

    /**
     * Cek apakah risiko masih draft
     */
    public function isDraft(): bool
    {
        return $this->validation_status === self::STATUS_DRAFT;
    }

    /**
     * Enhanced - Cek apakah risiko sudah dikirim (submitted atau pending)
     */
    public function isSubmitted(): bool
    {
        return in_array($this->validation_status, [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * New method - Cek apakah awaiting validation
     */
    public function isAwaitingValidation(): bool
    {
        return in_array($this->validation_status, [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * Cek apakah bisa dikirim (draft atau rejected)
     */
    public function canBeSubmitted(): bool
    {
        return in_array($this->validation_status, [self::STATUS_DRAFT, self::STATUS_REJECTED]);
    }

    /**
     * Cek apakah bisa diedit (draft atau rejected)
     */
    public function canBeEdited(): bool
    {
        return in_array($this->validation_status, [self::STATUS_DRAFT, self::STATUS_REJECTED]);
    }

    /**
     * Cek apakah bisa dihapus (hanya draft)
     */
    public function canBeDeleted(): bool
    {
        return $this->validation_status === self::STATUS_DRAFT;
    }

    /**
     * Cek apakah sudah disetujui
     */
    public function isApproved(): bool
    {
        return $this->validation_status === self::STATUS_APPROVED;
    }

    /**
     * Cek apakah ditolak
     */
    public function isRejected(): bool
    {
        return $this->validation_status === self::STATUS_REJECTED;
    }

    // ACCESSORS FOR DASHBOARD

    /**
     * Get validation status label dengan unified pending
     */
    public function getValidationStatusLabelAttribute(): string
    {
        return match($this->validation_status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_SUBMITTED => 'Menunggu Validasi',
            self::STATUS_PENDING => 'Menunggu Validasi',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_REJECTED => 'Ditolak',
            default => 'Status Tidak Dikenal'
        };
    }

    /**
     * Get display status untuk UI (unified pending)
     */
    public function getDisplayStatusAttribute(): string
    {
        if (in_array($this->validation_status, [self::STATUS_SUBMITTED, self::STATUS_PENDING])) {
            return 'pending';
        }
        return $this->validation_status;
    }

    /**
     * Get risk level text - unified method
     */
    public function getRiskLevelTextAttribute(): string
    {
        $level = $this->level ?? ($this->probability * $this->impact);
        return $this->getRiskLevel($level);
    }

    /**
     * Get inherent risk level
     */
    public function getInherentRiskLevelAttribute(): string
    {
        return $this->getRiskLevel($this->level);
    }

    /**
     * Get residual risk level
     */
    public function getResidualRiskLevelAttribute(): string
    {
        return $this->getRiskLevel($this->level_residual);
    }

    /**
     * Get risk reduction value
     */
    public function getRiskReductionAttribute(): int
    {
        if ($this->level && $this->level_residual) {
            return $this->level - $this->level_residual;
        }
        return 0;
    }

    /**
     * Get risk reduction percentage
     */
    public function getRiskReductionPercentageAttribute(): float
    {
        if ($this->level && $this->level_residual && $this->level > 0) {
            return round((($this->level - $this->level_residual) / $this->level) * 100, 1);
        }
        return 0;
    }

    /**
     * Unified risk level calculation method
     */
    private function getRiskLevel(?int $score): string
{
    if (!$score) {
        return 'Tidak Diketahui';
    }

    return match(true) {
        $score >= 17 => 'Tinggi',        // 17-25 (was >= 20)
        $score >= 9 => 'Sedang',         // 9-16 (was >= 8)
        $score >= 3 => 'Rendah',         // 3-8 (was >= 4)
        default => 'Sangat Rendah'       // 1-2 (was default)
    };
}

    // STATIC METHODS FOR DASHBOARD

    /**
     * Get count by status dengan unified pending
     */
    public static function getCountByStatus(): array
    {
        $counts = self::selectRaw('
                CASE
                    WHEN validation_status IN ("submitted", "pending") THEN "pending"
                    ELSE validation_status
                END as display_status,
                COUNT(*) as count
            ')
            ->groupBy('display_status')
            ->pluck('count', 'display_status')
            ->toArray();

        // Ensure all statuses are present
        return array_merge([
            'draft' => 0,
            'pending' => 0,
            'approved' => 0,
            'rejected' => 0,
        ], $counts);
    }

    /**
     * Get risk distribution by category
     */
    public static function getRiskDistributionByCategory(): array
    {
        return self::selectRaw('risk_category, COUNT(*) as count')
                   ->groupBy('risk_category')
                   ->pluck('count', 'risk_category')
                   ->toArray();
    }

    /**
     * Get dashboard statistics
     */
    public static function getDashboardStats(): array
    {
    return [
        'total_risks' => self::count(),
        'draft_risks' => self::draft()->count(),
        'pending_risks' => self::pendingValidation()->count(),
        'approved_risks' => self::approved()->count(),
        'rejected_risks' => self::rejected()->count(),
        'high_risks' => self::where('level', '>=', 17)->count(),        // 17-25
        'medium_risks' => self::whereBetween('level', [9, 16])->count(), // 9-16
        'low_risks' => self::whereBetween('level', [3, 8])->count(),     // 3-8
        'very_low_risks' => self::whereBetween('level', [1, 2])->count() // 1-2
    ];
    }

    /**
     * Get validation rules for this model
     */
    public static function validationRules(): array
    {
        return [
            'id_identify' => 'required|string|unique:identify_risks,id_identify',
            'risk_category' => 'required|string|max:255',
            'unit_kerja' => 'nullable|string|max:255',
            'kategori_risiko' => 'required|string|max:255',
            'tahun' => 'nullable|integer|min:2020|max:' . (date('Y') + 5),
            'description' => 'required|string',
            'nama_risiko' => 'required|string|max:255',
            'probability' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
            'probability_residual' => 'nullable|integer|min:1|max:5',
            'impact_residual' => 'nullable|integer|min:1|max:5',
            'validation_status' => 'in:draft,submitted,pending,approved,rejected',
            'status_mitigasi' => 'in:belum_dimulai,sedang_berjalan,selesai',
        ];
    }

    // MUTATORS
    public function setProbabilityAttribute($value): void
    {
        $this->attributes['probability'] = $value;
        $this->calculateLevel();
    }

    public function setImpactAttribute($value): void
    {
        $this->attributes['impact'] = $value;
        $this->calculateLevel();
    }

    public function setProbabilityResidualAttribute($value): void
    {
        $this->attributes['probability_residual'] = $value;
        $this->calculateResidualLevel();
    }

    public function setImpactResidualAttribute($value): void
    {
        $this->attributes['impact_residual'] = $value;
        $this->calculateResidualLevel();
    }

    /**
     * Calculate inherent risk level
     */
    protected function calculateLevel(): void
    {
        if (isset($this->attributes['probability']) && isset($this->attributes['impact'])) {
            $this->attributes['level'] = (int)$this->attributes['probability'] * (int)$this->attributes['impact'];
        }
    }

    /**
     * Calculate residual risk level
     */
    protected function calculateResidualLevel(): void
    {
        if (isset($this->attributes['probability_residual']) && isset($this->attributes['impact_residual'])) {
            $this->attributes['level_residual'] = (int)$this->attributes['probability_residual'] * (int)$this->attributes['impact_residual'];
        }
    }

    // BOOT METHOD
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            // Auto-calculate level on create
            if ($model->probability && $model->impact) {
                $model->level = $model->probability * $model->impact;
            }

            if ($model->probability_residual && $model->impact_residual) {
                $model->level_residual = $model->probability_residual * $model->impact_residual;
            }

            // Set default validation status
            if (!$model->validation_status) {
                $model->validation_status = self::STATUS_DRAFT;
            }

            // Set default tahun
            if (!$model->tahun) {
                $model->tahun = date('Y');
            }

            // Set default status mitigasi
            if (!$model->status_mitigasi) {
                $model->status_mitigasi = 'belum_dimulai';
            }
        });

        static::updating(function ($model) {
            // Recalculate level if probability or impact changed
            if ($model->isDirty('probability') || $model->isDirty('impact')) {
                $model->level = $model->probability * $model->impact;
            }

            // Recalculate residual level if residual values changed
            if ($model->isDirty('probability_residual') || $model->isDirty('impact_residual')) {
                if ($model->probability_residual && $model->impact_residual) {
                    $model->level_residual = $model->probability_residual * $model->impact_residual;
                }
            }
        });
    }
}