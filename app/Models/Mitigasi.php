<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mitigasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'mitigasis';

    protected $fillable = [
        'identify_risk_id',
        'judul_mitigasi',
        'deskripsi_mitigasi',
        'strategi_mitigasi',
        'pic_mitigasi',
        'target_selesai',
        'biaya_mitigasi',
        'status_mitigasi',
        'progress_percentage',
        'probability', // TAMBAHAN
        'impact',      // TAMBAHAN
        'catatan_progress',
        'bukti_implementasi',
        'evaluasi_efektivitas',
        'rekomendasi_lanjutan',
        'validation_status',
        'validation_processed_at',
        'validation_processed_by',
        'rejection_reason',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'target_selesai' => 'date',
        'biaya_mitigasi' => 'decimal:2',
        'progress_percentage' => 'integer',
        'probability' => 'integer', // TAMBAHAN
        'impact' => 'integer',      // TAMBAHAN
        'bukti_implementasi' => 'array',
        'validation_processed_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = ['status_label', 'strategi_label'];

    // ... (Konstanta tidak berubah)

    // Status constants
    const STATUS_BELUM_DIMULAI = 'belum_dimulai';
    const STATUS_SEDANG_BERJALAN = 'sedang_berjalan';
    const STATUS_SELESAI = 'selesai';
    const STATUS_TERTUNDA = 'tertunda';
    const STATUS_DIBATALKAN = 'dibatalkan';

    // Validation status constants
    const VALIDATION_STATUS_DRAFT = 'draft';
    const VALIDATION_STATUS_SUBMITTED = 'submitted';
    const VALIDATION_STATUS_PENDING = 'pending';
    const VALIDATION_STATUS_APPROVED = 'approved';
    const VALIDATION_STATUS_REJECTED = 'rejected';

    // Strategi constants
    const STRATEGI_AVOID = 'avoid';      // Menghindari
    const STRATEGI_REDUCE = 'reduce';    // Mengurangi
    const STRATEGI_TRANSFER = 'transfer';// Mentransfer
    const STRATEGI_ACCEPT = 'accept';    // Menerima

    // ... (Relasi tidak berubah)
    /**
     * Get the identify risk that owns the mitigasi.
     */
    public function identifyRisk(): BelongsTo
    {
        return $this->belongsTo(IdentifyRisk::class);
    }

    /**
     * Get the user who created this mitigasi.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this mitigasi.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the user who processed the validation.
     */
    public function validationProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validation_processed_by');
    }


    // ... (Scopes tidak berubah)
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_mitigasi', $status);
    }

    // Validation status scopes
    public function scopeDraft($query)
    {
        return $query->where('validation_status', self::VALIDATION_STATUS_DRAFT);
    }

    public function scopeSubmitted($query)
    {
        return $query->whereIn('validation_status', [self::VALIDATION_STATUS_SUBMITTED, self::VALIDATION_STATUS_PENDING]);
    }

    public function scopePendingValidation($query)
    {
        return $query->whereIn('validation_status', [self::VALIDATION_STATUS_SUBMITTED, self::VALIDATION_STATUS_PENDING]);
    }

    public function scopeApproved($query)
    {
        return $query->where('validation_status', self::VALIDATION_STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('validation_status', self::VALIDATION_STATUS_REJECTED);
    }

    public function scopeByStrategi($query, $strategi)
    {
        return $query->where('strategi_mitigasi', $strategi);
    }

    public function scopeOverdue($query)
    {
        return $query->where('target_selesai', '<', now())
            ->whereNotIn('status_mitigasi', [self::STATUS_SELESAI, self::STATUS_DIBATALKAN]);
    }

    public function scopeUpcoming($query, $days = 7)
    {
        return $query->whereBetween('target_selesai', [now(), now()->addDays($days)])
            ->whereNotIn('status_mitigasi', [self::STATUS_SELESAI, self::STATUS_DIBATALKAN]);
    }

    // ... (Accessors tidak berubah)
    // Accessors
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status_mitigasi) {
            self::STATUS_BELUM_DIMULAI => 'Belum Dimulai',
            self::STATUS_SEDANG_BERJALAN => 'Sedang Berjalan',
            self::STATUS_SELESAI => 'Selesai',
            self::STATUS_TERTUNDA => 'Tertunda',
            self::STATUS_DIBATALKAN => 'Dibatalkan',
            default => 'Status Tidak Dikenal'
        };
    }

    public function getStrategiLabelAttribute(): string
    {
        return match ($this->strategi_mitigasi) {
            self::STRATEGI_AVOID => 'Menghindari (Avoid)',
            self::STRATEGI_REDUCE => 'Mengurangi (Reduce)',
            self::STRATEGI_TRANSFER => 'Mentransfer (Transfer)',
            self::STRATEGI_ACCEPT => 'Menerima (Accept)',
            default => 'Strategi Tidak Dikenal'
        };
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->target_selesai < now() &&
            !in_array($this->status_mitigasi, [self::STATUS_SELESAI, self::STATUS_DIBATALKAN]);
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->target_selesai >= now() &&
            $this->target_selesai <= now()->addDays(7) &&
            !in_array($this->status_mitigasi, [self::STATUS_SELESAI, self::STATUS_DIBATALKAN]);
    }

    public function getDaysRemainingAttribute(): int
    {
        if ($this->status_mitigasi === self::STATUS_SELESAI) {
            return 0;
        }

        return max(0, now()->diffInDays($this->target_selesai, false));
    }


    // ... (Methods tidak berubah)
    // Methods
    public function canBeEdited(): bool
    {
        return !in_array($this->status_mitigasi, [self::STATUS_SELESAI, self::STATUS_DIBATALKAN]) &&
            in_array($this->validation_status, [self::VALIDATION_STATUS_DRAFT, self::VALIDATION_STATUS_REJECTED]);
    }

    public function canBeDeleted(): bool
    {
        return $this->status_mitigasi === self::STATUS_BELUM_DIMULAI &&
            $this->validation_status === self::VALIDATION_STATUS_DRAFT;
    }

    public function canBeSubmitted(): bool
    {
        return in_array($this->validation_status, [
            self::VALIDATION_STATUS_DRAFT,
            self::VALIDATION_STATUS_REJECTED
        ]);
    }

    public function isDraft(): bool
    {
        return $this->validation_status === self::VALIDATION_STATUS_DRAFT;
    }

    public function isApproved(): bool
    {
        return $this->validation_status === self::VALIDATION_STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->validation_status === self::VALIDATION_STATUS_REJECTED;
    }

    public function isPending(): bool
    {
        return in_array($this->validation_status, [self::VALIDATION_STATUS_SUBMITTED, self::VALIDATION_STATUS_PENDING]);
    }

    public function updateProgress(int $percentage, string $catatan = null): bool
    {
        $this->progress_percentage = min(100, max(0, $percentage));

        if ($catatan) {
            $this->catatan_progress = $catatan;
        }

        // Auto update status based on progress
        if ($percentage === 0) {
            $this->status_mitigasi = self::STATUS_BELUM_DIMULAI;
        } elseif ($percentage === 100) {
            $this->status_mitigasi = self::STATUS_SELESAI;
        } else {
            $this->status_mitigasi = self::STATUS_SEDANG_BERJALAN;
        }

        return $this->save();
    }


    // Static methods
    public static function getStatusOptions(): array
    {
        return [
            'belum_dimulai' => 'Belum Dimulai',
            'sedang_berjalan' => 'Sedang Berjalan',
            'selesai' => 'Selesai',
            'tertunda' => 'Tertunda',
            'dibatalkan' => 'Dibatalkan',
        ];
    }

    public static function getStrategiOptions(): array
    {
        return [
            self::STRATEGI_AVOID => 'Menghindari (Avoid)',
            self::STRATEGI_REDUCE => 'Mengurangi (Reduce)',
            self::STRATEGI_TRANSFER => 'Mentransfer (Transfer)',
            self::STRATEGI_ACCEPT => 'Menerima (Accept)',
        ];
    }

    public static function getValidationRules(): array
    {
        return [
            'identify_risk_id' => 'required|exists:identify_risks,id',
            'judul_mitigasi' => 'required|string|max:255',
            'deskripsi_mitigasi' => 'required|string',
            'strategi_mitigasi' => 'required|in:avoid,reduce,transfer,accept',
            'pic_mitigasi' => 'required|string|max:255',
            'target_selesai' => 'required|date|after_or_equal:today', // Mengizinkan hari ini
            'biaya_mitigasi' => 'nullable|numeric|min:0',
            'status_mitigasi' => 'required|in:belum_dimulai,sedang_berjalan,selesai,tertunda,dibatalkan',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'probability' => 'required|integer|min:1|max:5', // TAMBAHAN
            'impact' => 'required|integer|min:1|max:5',      // TAMBAHAN
            'catatan_progress' => 'nullable|string',
            'evaluasi_efektivitas' => 'nullable|string',
            'rekomendasi_lanjutan' => 'nullable|string',
        ];
    }

    public static function getValidationStatusOptions(): array
    {
        return [
            self::VALIDATION_STATUS_DRAFT => 'Draft',
            self::VALIDATION_STATUS_PENDING => 'Menunggu Persetujuan',
            self::VALIDATION_STATUS_APPROVED => 'Disetujui',
            self::VALIDATION_STATUS_REJECTED => 'Butuh Revisi',
        ];
    }

    // ... (Boot method tidak berubah)
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->status_mitigasi) {
                $model->status_mitigasi = self::STATUS_BELUM_DIMULAI;
            }

            if (!$model->progress_percentage) {
                $model->progress_percentage = 0;
            }
        });
    }
}