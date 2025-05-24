<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
     use HasFactory;

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = ['name'];

    /**
     * Relasi yang mendefinisikan user yang memiliki peran ini.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'hak_akses', 'role_id', 'user_id')
                    ->withTimestamps();
    }
}
