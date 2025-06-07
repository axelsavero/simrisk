<?php
// app/Models/PenangananRisiko.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenangananRisiko extends Model
{
    use HasFactory;

    protected $table = 'penanganan_risikos';

    protected $fillable = [
        'identity_risk_id',
        'description',
    ];

    /**
     * Get the identity risk that owns the penanganan risiko.
     */
    public function identityRisk(): BelongsTo
    {
        return $this->belongsTo(IdentityRisk::class);
    }
}
