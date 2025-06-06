<?php
// app/Models/Penyebab.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penyebab extends Model
{
    use HasFactory;

    protected $table = 'penyebabs';

    protected $fillable = ['identity_risk_id', 'description'];

    // Relasi 'belongsTo' ke model induknya
    public function identityRisk(): BelongsTo
    {
        return $this->belongsTo(IdentityRisk::class);
    }
}