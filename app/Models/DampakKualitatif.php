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
        'identify_risk_id',
        'description',
    ];

    /**
     * Get the identify risk that owns the dampak kualitatif.
     */
    public function identifyRisk(): BelongsTo
    {
        return $this->belongsTo(IdentifyRisk::class);
    }
}
