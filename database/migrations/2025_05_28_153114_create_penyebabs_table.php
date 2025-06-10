<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_penyebabs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penyebabs', function (Blueprint $table) {
            $table->id();
            // Ini adalah Foreign Key yang menghubungkan ke tabel identify_risks
            $table->foreignId('identify_risk_id')->constrained('identify_risks')->onDelete('cascade');
            $table->text('description'); // Kolom untuk deskripsi penyebab
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penyebabs');
    }
};