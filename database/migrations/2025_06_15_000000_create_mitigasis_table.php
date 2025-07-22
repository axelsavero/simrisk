<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mitigasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identify_risk_id')->constrained('identify_risks')->onDelete('cascade');
            
            // Informasi dasar mitigasi
            $table->string('judul_mitigasi');
            $table->text('deskripsi_mitigasi');
            $table->enum('strategi_mitigasi', ['avoid', 'reduce', 'transfer', 'accept']);
            
            // PIC dan timeline
            $table->string('pic_mitigasi'); // Person in Charge
            $table->date('target_selesai');
            
            // Biaya dan status
            $table->decimal('biaya_mitigasi', 15, 2)->nullable();
            $table->enum('status_mitigasi', [
                'belum_dimulai', 
                'sedang_berjalan', 
                'selesai', 
                'tertunda', 
                'dibatalkan'
            ])->default('belum_dimulai');
            
            // Progress tracking
            $table->integer('progress_percentage')->default(0);
            $table->text('catatan_progress')->nullable();
            
            // Dokumentasi
            $table->json('bukti_implementasi')->nullable(); // File paths
            
            // Evaluasi
            $table->text('evaluasi_efektivitas')->nullable();
            $table->text('rekomendasi_lanjutan')->nullable();
            
            // Approval workflow
            $table->string('validation_status')->default('draft')->index();
            $table->timestamp('validation_processed_at')->nullable();
            $table->foreignId('validation_processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            
            // Audit trail
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes untuk performa
            $table->index('identify_risk_id');
            $table->index('status_mitigasi');
            $table->index('strategi_mitigasi');
            $table->index('target_selesai');
            $table->index(['status_mitigasi', 'target_selesai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mitigasis');
    }
};