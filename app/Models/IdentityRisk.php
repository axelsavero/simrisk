<?php

// app/Models/IdentyRisk.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

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
        'probability',
        'impact',
        'level', // Kita akan isi ini di controller atau via event
    ];

    // Casts untuk tipe data
    protected $casts = [
        'status' => 'boolean',
        'identification_date_start' => 'date',
        'identification_date_end' => 'date',
        'probability' => 'integer',
        'impact' => 'integer',
        'level' => 'integer',
    ];

    // Nanti kita akan tambahkan relasi di sini
    // public function penyebab() { return $this->hasMany(Penyebab::class); }
    // public function penanganan() { return $this->hasMany(Penanganan::class); }
    // public function dampakKualitatif() { return $this->hasMany(DampakKualitatif::class); }
}