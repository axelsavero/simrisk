<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Risk extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'risk_id',
        'status',
        'risk_category',
        'identification_date_start',
        'identification_date_end',
        'description',
        'probability',
        'impact',
        
    ];

    protected $casts = [
        'identification_date_start' => 'date',
        'identification_date_end' => 'date',
        'probability' => 'integer',
        'impact' => 'integer',
        'level' => 'integer',
        'status' => 'boolean',
    ];

    /**
     * Get the probability attribute from the 'Probability' column.
     *
     * @return int|null
     */
    public function getProbabilityAttribute()
    {
        return $this->attributes['Probability'] ?? null;
    }

    /**
     * Set the probability attribute to the 'Probability' column.
     *
     * @param int $value
     * @return void
     */
    public function setProbabilityAttribute($value)
    {
        $this->attributes['Probability'] = $value;
        $this->calculateLevel();
    }

    /**
     * Set the impact and automatically calculate the level.
     *
     * @param int $value
     * @return void
     */
    public function setImpactAttribute($value)
    {
        $this->attributes['impact'] = $value;
        $this->calculateLevel();
    }

    /**
     * Calculate the risk level based on probability and impact.
     *
     * @return void
     */
    protected function calculateLevel()
    {
        // Only calculate if both values are set
        if (isset($this->attributes['Probability']) && isset($this->attributes['impact'])) {
            $this->attributes['level'] = $this->attributes['Probability'] * $this->attributes['impact'];
        }
    }

    /**
     * Boot the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            // Ensure probability is between 1-5
            if ($model->probability < 1) $model->probability = 1;
            if ($model->probability > 5) $model->probability = 5;

            // Ensure impact is between 1-5
            if ($model->impact < 1) $model->impact = 1;
            if ($model->impact > 5) $model->impact = 5;

            // Ensure level is calculated correctly
            $model->attributes['level'] = $model->probability * $model->impact;
        });
    }
}
