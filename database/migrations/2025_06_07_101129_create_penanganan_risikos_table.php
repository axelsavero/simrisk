<?php
// database/migrations/xxxx_xx_xx_create_penanganan_risikos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penanganan_risikos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identify_risk_id')->constrained('identify_risks')->onDelete('cascade');
            $table->text('description');
            $table->timestamps();
            
            // Index untuk performa
            $table->index('identify_risk_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penanganan_risikos');
    }
};
