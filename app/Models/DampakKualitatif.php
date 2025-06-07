<?php
// app/Models/DampakKualitatif.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DampakKualitatif extends Model
{
    use HasFactory;

    protected $table = 'dampak_kualitatifs';

    protected $fillable = [
        'identity_risk_id',
        'description',
    ];

    /**
     * Get the identity risk that owns the dampak kualitatif.
     */
    public function identityRisk(): BelongsTo
    {
        return $this->belongsTo(IdentityRisk::class);
    }
}
