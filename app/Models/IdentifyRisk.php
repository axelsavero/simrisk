<?php

namespace App\Models;

use App\Models\User;
use App\Models\Penyebab;
use App\Models\DampakKualitatif;
use App\Models\PenangananRisiko;
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
        'status',
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
    ];

    protected $casts = [
        'status' => 'boolean',
        'identification_date_start' => 'date',
        'identification_date_end' => 'date',
        'probability' => 'integer',
        'impact' => 'integer',
        'level' => 'integer',
        'validation_processed_at' => 'datetime',
        'deleted_at' => 'datetime',
        'biaya_penangan' => 'decimal:2', 
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

    public function validationProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validation_processed_by');
    }

    // 🔥 OPSI 3: Enhanced Scopes untuk handle submitted = pending

    /**
     * Scope untuk risiko draft
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('validation_status', self::STATUS_DRAFT);
    }

    /**
     * Scope untuk risiko yang sudah dikirim (submitted/pending)
     * 🔥 OPSI 3: Include both submitted dan pending
     */
    public function scopeSubmitted(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * Scope untuk risiko menunggu validasi
     * 🔥 OPSI 3: Unified scope untuk pending (include submitted)
     */
    public function scopePendingValidation(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * 🔥 OPSI 3: New scope - Awaiting Validation (alias untuk pendingValidation)
     */
    public function scopeAwaitingValidation(Builder $query): Builder
    {
        return $query->whereIn('validation_status', [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * 🔥 OPSI 3: New scope - In Process (for super admin to see all non-draft)
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
        return $query->where('status', true);
    }

    /**
     * 🔥 OPSI 3: New scope - By Status (flexible status filtering)
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
     * 🔥 OPSI 3: New scope - For Dashboard Stats
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

    // STATUS CHECK METHODS

    /**
     * Cek apakah risiko masih draft
     */
    public function isDraft(): bool
    {
        return $this->validation_status === self::STATUS_DRAFT;
    }

    /**
     * 🔥 OPSI 3: Enhanced - Cek apakah risiko sudah dikirim (submitted atau pending)
     */
    public function isSubmitted(): bool
    {
        return in_array($this->validation_status, [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * 🔥 OPSI 3: New method - Cek apakah awaiting validation
     */
    public function isAwaitingValidation(): bool
    {
        return in_array($this->validation_status, [self::STATUS_SUBMITTED, self::STATUS_PENDING]);
    }

    /**
     * Cek apakah bisa dikirim (hanya draft)
     */
    public function canBeSubmitted(): bool
    {
        return $this->validation_status === self::STATUS_DRAFT;
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

    // 🔥 OPSI 3: Enhanced Accessors

    /**
     * Get validation status label dengan unified pending
     */
    public function getValidationStatusLabelAttribute(): string
    {
        return match($this->validation_status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_SUBMITTED => 'Menunggu Validasi', // Treat as pending
            self::STATUS_PENDING => 'Menunggu Validasi',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_REJECTED => 'Ditolak',
            default => 'Status Tidak Dikenal'
        };
    }

    /**
     * 🔥 OPSI 3: Get display status untuk UI (unified pending)
     */
    public function getDisplayStatusAttribute(): string
    {
        if (in_array($this->validation_status, [self::STATUS_SUBMITTED, self::STATUS_PENDING])) {
            return 'pending';
        }
        return $this->validation_status;
    }

    /**
     * Get risk level text
     */
    public function getRiskLevelTextAttribute(): string
    {
        $level = $this->level ?? ($this->probability * $this->impact);
        
        return match(true) {
            $level >= 20 => 'Kritis',
            $level >= 15 => 'Tinggi', 
            $level >= 8 => 'Sedang',
            default => 'Rendah'
        };
    }

    // 🔥 OPSI 3: Enhanced Static Methods

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

    // MUTATORS
    public function setProbabilityAttribute($value)
    {
        $this->attributes['probability'] = $value;
        $this->calculateLevel();
    }

    public function setImpactAttribute($value)
    {
        $this->attributes['impact'] = $value;
        $this->calculateLevel();
    }

    protected function calculateLevel(): void
    {
        if (isset($this->attributes['probability']) && isset($this->attributes['impact'])) {
            $this->attributes['level'] = (int)$this->attributes['probability'] * (int)$this->attributes['impact'];
        }
    }

    // BOOT METHOD
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->probability && $model->impact) {
                $model->level = $model->probability * $model->impact;
            }
            
            if (!$model->validation_status) {
                $model->validation_status = self::STATUS_DRAFT;
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('probability') || $model->isDirty('impact')) {
                $model->level = $model->probability * $model->impact;
            }
        });
    }
}
