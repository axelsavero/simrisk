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
        'target_unit',
        'bobot_unit',
        'status_pelaksanaan',
        'progress_persen',
        'capaian_saat_ini',
        'tanggal_mulai_unit',
        'tanggal_selesai_unit',
        'deadline_unit',
        'pic_unit',
        'keterangan',
        'metadata',
    ];

    protected $casts = [
        'target_unit' => 'decimal:2',
        'bobot_unit' => 'decimal:2',
        'progress_persen' => 'decimal:2',
        'capaian_saat_ini' => 'decimal:2',
        'tanggal_mulai_unit' => 'date',
        'tanggal_selesai_unit' => 'date',
        'deadline_unit' => 'date',
        'metadata' => 'array',
    ];

    public function getRouteKeyName()
    {
        return 'id_sasaran_unit';
    }
}
