<?php
// app/Models/Role.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'guard_name',
        'description'
    ];

    /**
     * Relasi many-to-many ke User melalui tabel hak_akses
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'hak_akses', 'role_id', 'user_id')
                    ->withTimestamps();
    }
}
