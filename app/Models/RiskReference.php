<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskReference extends Model
{
    protected $table = 'risk_references';

    protected $fillable = [
        'type',      // 'kategori' atau 'kriteria'
        'title',
        'description',
    ];

    public $timestamps = false;

    // Scope untuk masing-masing tipe
    public function scopeKategori($query)
    {
        return $query->where('type', 'kategori');
    }

    public function scopeKriteria($query)
    {
        return $query->where('type', 'kriteria');
    }
}
