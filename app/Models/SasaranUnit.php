<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SasaranUnit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sasaran_unit';
    protected $primaryKey = 'id_sasaran_unit';
    
    protected $fillable = [
        'id_sasaran_univ',
        'id_unit',
        'nama_dokumen',
        'nomor_dokumen',
        'tanggal_dokumen',
        'file_path',
        'metadata'
    ];

    protected $casts = [
        'tanggal_dokumen' => 'date',
        'metadata' => 'array'
    ];

    // Route key untuk custom primary key
    public function getRouteKeyName()
    {
        return 'id_sasaran_unit';
    }

    /**
     * Relasi ke Sasaran Universitas
     */
    public function sasaranUniv(): BelongsTo
    {
        return $this->belongsTo(SasaranUniv::class, 'id_sasaran_univ', 'id_sasaran_univ');
    }

    /**
     * Relasi ke Unit (jika ada model Unit)
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_pelaksanaan', $status);
    }

    /**
     * Scope untuk filter berdasarkan progress
     */
    public function scopeByProgress($query, $minProgress = null, $maxProgress = null)
    {
        if ($minProgress !== null) {
            $query->where('progress_persen', '>=', $minProgress);
        }
        if ($maxProgress !== null) {
            $query->where('progress_persen', '<=', $maxProgress);
        }
        return $query;
    }

    /**
     * Accessor untuk status pelaksanaan dalam bahasa Indonesia
     */
    public function getStatusPelaksanaanLabelAttribute()
    {
        $statusLabels = [
            'belum_mulai' => 'Belum Mulai',
            'sedang_berjalan' => 'Sedang Berjalan',
            'selesai' => 'Selesai',
            'terhenti' => 'Terhenti',
            'ditunda' => 'Ditunda'
        ];

        return $statusLabels[$this->status_pelaksanaan] ?? 'Unknown';
    }

    /**
     * Accessor untuk badge class berdasarkan status
     */
    public function getStatusBadgeClassAttribute()
    {
        $badgeClasses = [
            'belum_mulai' => 'bg-gray-100 text-gray-800',
            'sedang_berjalan' => 'bg-blue-100 text-blue-800',
            'selesai' => 'bg-green-100 text-green-800',
            'terhenti' => 'bg-red-100 text-red-800',
            'ditunda' => 'bg-yellow-100 text-yellow-800'
        ];

        return $badgeClasses[$this->status_pelaksanaan] ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Mutator untuk progress persen
     */
    public function setProgressPersenAttribute($value)
    {
        $this->attributes['progress_persen'] = max(0, min(100, $value));
    }
}