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
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->string('risk_id');          // Nomor_Urut_Kode Risiko _Kode_Instansi_Bulan_Tahun
            $table->string('status');           // Status Resiko
            $table->string('risk_category');    // Kategori Resiko
            // // $table->string('');    // Departemen / Unit Kerja / Fungsi 
            $table->date('identification_date_start')->nullable();    // Start Periode Identifikasi Risiko
            $table->date('identification_date_end')->nullable();      // End Periode Identifikasi Risiko
            $table->string('description');      // Deskripsi atau Kejadian Risiko (Risk Event)
            $table->integer('Probability');     // Probabilitas Risiko Inheren (Sebelum Mitigasi Risiko)
            $table->integer('impact');          // Dampak Risiko Inheren
            $table->integer('level');            // Tingkat Risiko Inheren ( P x D) 

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('risks');
    }
};
