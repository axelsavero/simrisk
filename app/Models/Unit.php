<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'unit';
    protected $primaryKey = 'id_unit';
    
    protected $fillable = [
        'kode_unit',
        'nama_unit',
        'jenis_unit',
        'level_unit',
        'parent_unit_id',
        'kepala_unit',
        'email',
        'telepon',
        'alamat',
        'visi',
        'misi',
        'status'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    // Route key untuk custom primary key
    public function getRouteKeyName()
    {
        return 'id_unit';
    }

    /**
     * Relasi ke parent unit
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'parent_unit_id', 'id_unit');
    }

    /**
     * Relasi ke child units
     */
    public function children(): HasMany
    {
        return $this->hasMany(Unit::class, 'parent_unit_id', 'id_unit');
    }

    /**
     * Relasi ke sasaran unit
     */
    public function sasaranUnits(): HasMany
    {
        return $this->hasMany(SasaranUnit::class, 'id_unit', 'id_unit');
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope untuk filter berdasarkan jenis unit
     */
    public function scopeByJenis($query, $jenis)
    {
        return $query->where('jenis_unit', $jenis);
    }

    /**
     * Scope untuk filter berdasarkan level unit
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level_unit', $level);
    }

    /**
     * Accessor untuk nama lengkap dengan kode
     */
    public function getNamaLengkapAttribute()
    {
        return $this->kode_unit . ' - ' . $this->nama_unit;
    }

    /**
     * Accessor untuk badge class berdasarkan status
     */
    public function getStatusBadgeClassAttribute()
    {
        return $this->status === 'aktif' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    }

    /**
     * Accessor untuk jenis unit label
     */
    public function getJenisUnitLabelAttribute()
    {
        $jenisLabels = [
            'fakultas' => 'Fakultas',
            'prodi' => 'Program Studi',
            'lembaga' => 'Lembaga',
            'biro' => 'Biro',
            'upt' => 'UPT',
            'pusat' => 'Pusat',
            'bagian' => 'Bagian',
            'sub_bagian' => 'Sub Bagian'
        ];

        return $jenisLabels[$this->jenis_unit] ?? ucfirst($this->jenis_unit);
    }

    /**
     * Accessor untuk level unit label
     */
    public function getLevelUnitLabelAttribute()
    {
        $levelLabels = [
            'universitas' => 'Universitas',
            'fakultas' => 'Fakultas',
            'jurusan' => 'Jurusan',
            'program_studi' => 'Program Studi',
            'unit_kerja' => 'Unit Kerja'
        ];

        return $levelLabels[$this->level_unit] ?? ucfirst(str_replace('_', ' ', $this->level_unit));
    }
}