<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
            $table->decimal('target_unit', 12, 2)->nullable();
            $table->decimal('bobot_unit', 5, 2)->default(0);
            $table->enum('status_pelaksanaan', [
                'belum_mulai', 'sedang_berjalan', 'selesai', 
                'terhenti', 'ditunda'
            ])->default('belum_mulai');
            $table->decimal('progress_persen', 5, 2)->default(0);
            $table->decimal('capaian_saat_ini', 12, 2)->default(0);
            $table->date('tanggal_mulai_unit')->nullable();
            $table->date('tanggal_selesai_unit')->nullable();
            $table->date('deadline_unit')->nullable();
            $table->string('pic_unit')->nullable();
            $table->text('keterangan')->nullable();
            $table->json('metadata')->nullable(); // Untuk data tambahan
            $table->timestamps();
            $table->softDeletes();
            
            // Unique constraint
            $table->unique(['id_sasaran_univ', 'id_unit'], 'unique_sasaran_unit');
            
            // Indexes
            $table->index('id_sasaran_univ');
            $table->index('id_unit');
            $table->index('status_pelaksanaan');
            $table->index('progress_persen');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sasaran_unit');
    }
};
