<?php
// app/Models/SasaranUniv.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SasaranUniv extends Model
{
    use HasFactory;

    protected $table = 'sasaran_univ';
    protected $primaryKey = 'id_sasaran_univ'; // 🔥 Primary key custom
    
    protected $fillable = [
        'kategori',
        'nama_dokumen',
        'nomor_dokumen',
        'tanggal_dokumen',
        'file_path'
    ];

    protected $casts = [
        'tanggal_dokumen' => 'date'
    ];

    // 🔥 Override route key untuk custom primary key
    public function getRouteKeyName()
    {
        return 'id_sasaran_univ';
    }
}
