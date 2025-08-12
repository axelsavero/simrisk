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
        Schema::create('sasaran_unit', function (Blueprint $table) {
            $table->id('id_sasaran_unit');
            $table->foreignId('id_sasaran_univ')
                  ->constrained('sasaran_univ', 'id_sasaran_univ')
                  ->onDelete('cascade');
            $table->foreignId('id_unit')
                  ->constrained('unit', 'id_unit')
                  ->onDelete('cascade');
            
            // New document-related fields
            $table->string('nama_dokumen')->nullable();
            $table->string('nomor_dokumen')->nullable();
            $table->date('tanggal_dokumen')->nullable();
            $table->string('file_path')->nullable();
            
            $table->json('metadata')->nullable(); // Untuk data tambahan
            $table->timestamps();
            $table->softDeletes();
            
            // Unique constraint
            $table->unique(['id_sasaran_univ', 'id_unit'], 'unique_sasaran_unit');
            
            // Indexes
            $table->index('id_sasaran_univ');
            $table->index('id_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sasaran_unit');
    }
};