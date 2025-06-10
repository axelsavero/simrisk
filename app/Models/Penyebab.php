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

    protected $fillable = ['identify_risk_id', 'description'];

    // Relasi 'belongsTo' ke model induknya
    public function identifyRisk(): BelongsTo
    {
        return $this->belongsTo(IdentifyRisk::class);
    }
}