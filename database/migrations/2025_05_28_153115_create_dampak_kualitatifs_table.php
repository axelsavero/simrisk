<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dampak_kualitatifs', function (Blueprint $table) {
            $table->id();
            // Ini adalah Foreign Key yang menghubungkan ke tabel identify_risks
            $table->foreignId('identify_risk_id')->constrained('identify_risks')->onDelete('cascade');
            $table->text('description'); // Kolom untuk deskripsi penyebab
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dampak_kualitatifs');
    }
};
