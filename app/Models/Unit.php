<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'unit'; // Nama tabel sesuai migrasi

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
        'status',
    ];

    // Relasi ke user (jika diperlukan)
    public function users()
    {
        // Asumsi foreign key di tabel users adalah unit_id yang mengacu ke id_unit
        return $this->hasMany(User::class, 'unit_id', 'id_unit');
    }

    // Relasi ke parent unit
    public function parent()
    {
        return $this->belongsTo(Unit::class, 'parent_unit_id', 'id_unit');
    }

    // Relasi ke child units
    public function children()
    {
        return $this->hasMany(Unit::class, 'parent_unit_id', 'id_unit');
    }
}
