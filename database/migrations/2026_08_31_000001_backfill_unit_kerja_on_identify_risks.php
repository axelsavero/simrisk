<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\IdentifyRisk;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ambil semua identify_risks yang unit_kerja-nya null, kosong, atau 'Tidak Diketahui'
        $risks = IdentifyRisk::with(['user.unit'])->where(function ($query) {
            $query->whereNull('unit_kerja')
                  ->orWhere('unit_kerja', '')
                  ->orWhere('unit_kerja', 'Tidak Diketahui')
                  ->orWhere('unit_kerja', '-');
        })->get();

        foreach ($risks as $risk) {
            if ($risk->user) {
                $unitName = $risk->user->unit_name;
                if (!empty($unitName) && $unitName !== 'Tidak Diketahui') {
                    DB::table('identify_risks')
                        ->where('id', $risk->id)
                        ->update(['unit_kerja' => $unitName]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed on rollback
    }
};
