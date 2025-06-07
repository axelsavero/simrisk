<?php

// app/Models/IdentyRisk.php
namespace App\Models;

use App\Models\Penyebab;
use App\Models\DampakKualitatif;
use App\Models\PenangananRisiko;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder; 
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IdentityRisk extends Model
{
    use HasFactory , SoftDeletes; 

    protected $fillable = [
        'id_identity',
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

    // Casts untuk tipe data
    protected $casts = [
        'status' => 'boolean',
        'identification_date_start' => 'date',
        'identification_date_end' => 'date',
        'probability' => 'integer',
        'impact' => 'integer',
        'level' => 'integer',
        'validation_processed_at' => 'datetime',
        'biaya_penangan' => 'decimal:2', 
        
    ];

public function penyebab(): HasMany
{
    return $this->hasMany(Penyebab::class);
}

public function dampakKualitatif(): HasMany
    {
        return $this->hasMany(DampakKualitatif::class);
    }

public function penangananRisiko(): HasMany
{
    return $this->hasMany(PenangananRisiko::class);
}




 public function validationProcessor()
    {
        return $this->belongsTo(User::class, 'validation_processed_by');
    }

    // Scopes
    public function scopePendingValidation(Builder $query): Builder
    {
        return $query->where('validation_status', 'pending');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('validation_status', 'approved');
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('validation_status', 'rejected');
    }


    // public function penyebab() { return $this->hasMany(Penyebab::class); }
    // public function penanganan() { return $this->hasMany(Penanganan::class); }
    // public function dampakKualitatif() { return $this->hasMany(DampakKualitatif::class); }
}