<?php
// app/Models/SasaranUnit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SasaranUnit extends Model
{
    use HasFactory;

    protected $table = 'sasaran_unit';
    protected $primaryKey = 'id_sasaran_unit';

    protected $fillable = [
        'id_sasaran_univ',
        'id_unit',
        'kategori',
        'nama_dokumen',
        'nomor_dokumen',
        'tanggal_dokumen',
        'file_path'
    ];

    protected $casts = [
        'tanggal_dokumen' => 'date'
    ];

    public function getRouteKeyName()
    {
        return 'id_sasaran_unit';
    }
}
